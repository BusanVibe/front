import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  InteractionManager,
  Image,
  AppState,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IcSend from '../assets/icon/ic_send.svg';
import IcNickname from '../assets/icon/ic_talknickname.svg';
import Logo from '../assets/logo.svg';
import { ChatService, ChatMessage } from '../services/chatService';
import { ChatSocket } from '../services/chatSocket';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const {width} = Dimensions.get('window');

interface Message {
  // 백엔드 필드명과 동일
  user_id: number;
  name: string;
  image_url: string;
  message: string;
  time: string; // ISO
  type: 'CHAT' | 'BOT_REQUEST' | 'BOT_RESPONSE';
  // 클라이언트 보조 필드
  id: string;
  is_my?: boolean;
}

const BusanTalkScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user: authUser } = useAuth();
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [inputText, setInputText] = useState('');
  const listRef = useRef<any>(null);
  // 최근 내가 전송한 메시지 텍스트 기록(에코 방지)
  const pendingSentRef = useRef<{ text: string; ts: number }[]>([]);
  // 최근에 처리한 (userId+text) 키의 마지막 시간 기록(히스토리/실시간 중복 방지)
  const recentSeenRef = useRef<Map<string, number>>(new Map());
  // 내 사용자 ID 캐시 (JWT sub 우선)
  const myUserIdRef = useRef<number>(-1);
  // 히스토리 최초 1회만 로드 가드
  const hasLoadedHistoryRef = useRef<boolean>(false);

  const parseJwtSub = (token?: string | null): number => {
    try {
      if (!token) return -1;
      const parts = token.split('.');
      if (parts.length < 2) return -1;
      const json = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
      const sub = Number(json?.sub);
      return isNaN(sub) ? -1 : sub;
    } catch {
      return -1;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const subId = parseJwtSub(token);
        const authId = Number((authUser as any)?.id ?? -1);
        myUserIdRef.current = subId !== -1 ? subId : authId;
        try { console.log('[INFO][MY_ID]', { ts: new Date().toISOString(), subId, authId, final: myUserIdRef.current }); } catch {}
      } catch {}
    })();
  }, [authUser]);

  const scrollToBottom = (animated: boolean = true) => {
    try {
      listRef.current?.scrollToEnd?.({ animated });
    } catch (e) {}
    requestAnimationFrame(() => {
      try { listRef.current?.scrollToEnd?.({ animated }); } catch (e) {}
    });
    setTimeout(() => {
      try { listRef.current?.scrollToEnd?.({ animated }); } catch (e) {}
    }, 80);
    InteractionManager.runAfterInteractions(() => {
      try { listRef.current?.scrollToEnd?.({ animated }); } catch (e) {}
    });
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return iso;
    }
  };

  // 웹소켓 수신 메시지 → Message (정규 스키마 유지)
  const mapWebSocketToMessage = (wsMessage: ChatMessage): Message => {
    const myId = myUserIdRef.current !== -1 ? myUserIdRef.current : Number((authUser as any)?.id ?? -1);
    return {
      id: `ws-${wsMessage.time}-${wsMessage.user_id}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: Number(wsMessage.user_id ?? 0),
      name: wsMessage.name ?? '',
      image_url: wsMessage.image_url ?? '',
      message: wsMessage.message ?? '',
      time: wsMessage.time ?? new Date().toISOString(),
      type: wsMessage.type,
      is_my: Number(wsMessage.user_id ?? -999) === myId,
    };
  };

  // API 응답 메시지 → Message (정규 스키마 유지)
  const mapChatToMessage = (chat: ChatMessage, index: number): Message => {
    const myId = myUserIdRef.current !== -1 ? myUserIdRef.current : Number((authUser as any)?.id ?? -1);
    const userIdNum = Number(chat.user_id ?? 0);
    const isMyFromServer = typeof (chat as any)?.is_my === 'boolean' ? (chat as any).is_my : undefined;
    return {
      id: `api-${chat.time}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userIdNum,
      name: chat.name ?? '',
      image_url: chat.image_url ?? '',
      message: chat.message ?? '',
      time: chat.time ?? new Date().toISOString(),
      type: chat.type,
      is_my: isMyFromServer !== undefined ? isMyFromServer : (userIdNum === myId),
    };
  };

  // 공백 없는 긴 문자열(예: 점/이모지 반복)이 잘리지 않도록
  // 일정 길이 이상의 연속 문자열에 제로폭 공백을 삽입해 소프트 래핑
  const softWrap = (input: string, chunk: number = 8) => {
    try {
      return input.replace(/[^\s]{20,}/g, (segment) => {
        const parts: string[] = [];
        for (let i = 0; i < segment.length; i += chunk) {
          parts.push(segment.slice(i, i + chunk));
        }
        return parts.join('\u200B');
      });
    } catch {
      return input;
    }
  };

  const sortByIsoTimeAsc = (list: Message[]) =>
    list.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const appendDedupeAndSort = (prev: Message[], incoming: Message) => {
    // 시간, 텍스트, 사용자ID로 중복 체크
    const exists = prev.some(
      m => m.time === incoming.time && m.message === incoming.message && m.user_id === incoming.user_id
    );
    if (exists) {
      try { console.log('Duplicate message filtered:', incoming.message); } catch {}
      return prev;
    }
    const merged = [...prev, incoming];
    return sortByIsoTimeAsc(merged);
  };

  const dedupeAndSort = (list: Message[]) => {
    // 시간 근접(±5s) 동일 텍스트/동일 사용자 중복 제거
    // const WINDOW_MS = 5000;
    const byUserAndText = new Map<string, number>();
    const result: Message[] = [];
    const sorted = sortByIsoTimeAsc([...list]);
    for (const m of sorted) {
      const key = `${m.user_id}|${m.message}`;
      const t = new Date(m.time).getTime();
      const last = byUserAndText.get(key);
      // if (last !== undefined && Math.abs(t - last) <= WINDOW_MS) {
      //   continue;
      // }
      byUserAndText.set(key, t);
      result.push(m);
    }
    return result;
  };

  const loadInitialHistory = async () => {
    setIsLoading(true);
    try {
      const page = await ChatService.history(null, 30);
      const mapped = page.messages
        .map(mapChatToMessage)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      try {
        console.log('[history] loaded FULL', {
          count: mapped.length,
          cursorId: page.cursorId,
          messages: mapped,
        });
      } catch {}
      // 최근 본 키로 마킹
      try {
        const seen = recentSeenRef.current;
        for (const m of mapped) {
          const key = `${m.user_id}|${m.message}`;
          seen.set(key, new Date(m.time).getTime());
        }
      } catch {}
      setMessages(prev => dedupeAndSort([...prev, ...mapped]));
      setCursorId(page.cursorId);
      setTimeout(() => scrollToBottom(false), 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (isLoadingMore || cursorId === null) return;
    setIsLoadingMore(true);
    try {
      const page = await ChatService.history(cursorId, 30);
      const mapped = page.messages.map(mapChatToMessage);
      try {
        
        console.log('[history] page FULL', {
          count: mapped.length,
          cursorId: page.cursorId,
          messages: mapped,
        });
        
      } catch {}
      try {
        const seen = recentSeenRef.current;
        for (const m of mapped) {
          const key = `${m.user_id}|${m.message}`;
          seen.set(key, new Date(m.time).getTime());
        }
      } catch {}
      setMessages(prev => dedupeAndSort([...prev, ...mapped]));
      setCursorId(page.cursorId);
      // 통신 결과를 생략 없이 로그 출력
      console.log('[history] full response page:', page);
      console.log('[history] full response mapped:', mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const connectWebSocket = useCallback(async () => {
    try { console.log('Connecting WebSocket...'); } catch {}
    try {
      const canConnect = await (ChatSocket as any).testConnection?.();
      if (!canConnect) {
        console.error('❌ WebSocket connection test failed. Server may be unreachable.');
        return;
      }
      console.log('✅ WebSocket connection test passed');
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return;
    }

    ChatSocket.connect((wsMessage: ChatMessage) => {
      const mappedMessage = mapWebSocketToMessage(wsMessage);
      // 가독성 로그
      try {
        console.log('[socket][received FULL]', mappedMessage);
      } catch {}

      // 1) 내 에코 중복 제거: 최근 전송 텍스트와 동일하면 무시(10초 윈도우)
      try {
        const now = Date.now();
        pendingSentRef.current = pendingSentRef.current.filter(p => now - p.ts < 10000);
        const isRecentMyText = pendingSentRef.current.some(p => p.text === mappedMessage.message);
        // 에코는 무시하지 말고, 내 메시지로 정정 + 낙관적 메시지 대체
        if (isRecentMyText) {
          mappedMessage.is_my = true as any;
          try { console.log('[socket][received] echo_replace', { text: mappedMessage.message, time: mappedMessage.time }); } catch {}
        }
      } catch {}

      // 2) 히스토리와 실시간의 교차 중복 제거: 같은 (userId+text)를 짧은 시간 내에 반복 수신하면 무시
      try {
        const seen = recentSeenRef.current;
        const key = `${mappedMessage.user_id}|${mappedMessage.message}`;
        const t = new Date(mappedMessage.time).getTime();
        const last = seen.get(key);
        // // 5초 내 동일 텍스트 재등장 시 중복으로 간주
        // if (last && Math.abs(t - last) <= 5000) {
        //   return;
        // }
        seen.set(key, t);
      } catch {}

      // 3) 낙관적 메시지 대체: 같은 텍스트의 temp- 항목 제거
      const removeOptimisticWithSameText = (list: Message[]) =>
        list.filter(m => !(m.id?.startsWith?.('temp-') && m.message === mappedMessage.message));

      setMessages(prev => {
        const cleaned = removeOptimisticWithSameText(prev);
        const updated = appendDedupeAndSort(cleaned, mappedMessage);
        return updated;
      });
      setTimeout(() => scrollToBottom(true), 200);
    });
    console.log('WebSocket connection request sent');
  }, []);

  const disconnectWebSocket = useCallback(() => {
    ChatSocket.disconnect();
    try { console.log('WebSocket disconnected'); } catch {}
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      try { console.log('App state changed to:', nextAppState); } catch {}
      if (nextAppState === 'active') {
        if (!ChatSocket.isConnected()) {
          console.log('Reconnecting WebSocket after app became active');
          setTimeout(() => { connectWebSocket(); }, 1000);
        }
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => { subscription?.remove(); };
  }, [connectWebSocket]);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - loading history and connecting WebSocket');
      if (!hasLoadedHistoryRef.current) {
        loadInitialHistory();
        hasLoadedHistoryRef.current = true;
      }
      connectWebSocket();
      return () => {
        console.log('Screen unfocused');
        // 연결 유지 (실시간 알림을 위해)
      };
    }, [connectWebSocket])
  );

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const renderMessage = ({item}: {item: Message}) => (
    <View
      style={[
        styles.messageContainer,
        (item.type === 'BOT_RESPONSE' || !item.is_my) ? styles.botMessage : styles.userMessage,
      ]}>
      <View style={styles.messageWrapper}>
        {(item.type === 'BOT_RESPONSE' || !item.is_my) && (
          <View style={styles.profileContainer}>
            <View style={styles.profileIcon}>
              {item.type === 'BOT_RESPONSE' ? (
                <Logo width={30} height={30} />
              ) : item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.profileImage} />
              ) : (
                <IcNickname width={30} height={30} stroke="none" />
              )}
            </View>
            <Text style={styles.nickname}>{item.type === 'BOT_RESPONSE' ? '챗봇' : (item.name ?? '닉네임')}</Text>
          </View>
        )}
        <View style={(item.type === 'BOT_RESPONSE' || !item.is_my) ? styles.messageContentBot : styles.messageContentUser}>
          <View style={[styles.messageRow, (item.is_my && item.type !== 'BOT_RESPONSE') ? styles.userMessageRow : {}]}>
            {(item.is_my && item.type !== 'BOT_RESPONSE') && <Text style={styles.timeText}>{formatTime(item.time)}</Text>}
            <View
              style={[
                styles.messageBubble,
                (item.type === 'BOT_RESPONSE' || !item.is_my) ? styles.botBubble : styles.userBubble,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  (item.type === 'BOT_RESPONSE' || !item.is_my) ? styles.botText : styles.userText,
                ]}>
                {softWrap(item.message)}
              </Text>
            </View>
            {(item.type === 'BOT_RESPONSE' || !item.is_my) && <Text style={styles.timeText}>{formatTime(item.time)}</Text>}
          </View>
        </View>
      </View>
    </View>
  );

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (text.length > 200) {
      console.warn('메시지는 200자 이하여야 합니다.');
      return;
    }

    const now = new Date();
    const nowText = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // 낙관적 UI 업데이트 (사용자 메시지) - 표준 스키마 사용
    const myId = myUserIdRef.current !== -1 ? myUserIdRef.current : Number((authUser as any)?.id ?? -1);
    try { console.log('[send] optimistic FULL', { text }); } catch {}
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      user_id: myId,
      name: (authUser as any)?.name ?? '',
      image_url: (authUser as any)?.image_url ?? '',
      message: text,
      time: new Date().toISOString(),
      type: 'CHAT',
      is_my: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 100);
    setInputText('');
    try {
      const nowTs = Date.now();
      pendingSentRef.current.push({ text, ts: nowTs });
      pendingSentRef.current = pendingSentRef.current.filter(p => nowTs - p.ts < 10000);
      // 최근 본 키에도 기록
      const key = `${(authUser as any)?.id ?? -1}|${text}`;
      recentSeenRef.current.set(key, nowTs);
    } catch {}

    setIsSending(true);
    try { console.log('[send] request FULL', { length: text.length, text }); } catch {}
    try {
      const res = await ChatService.send(text);
      // 챗봇 질문인 경우 API 응답으로 받은 메시지를 추가
      if (text.startsWith('/')) {
        const botMsg: Message = mapChatToMessage(res.result, 0);
        setMessages(prev => dedupeAndSort([...prev, botMsg]));
        setTimeout(() => scrollToBottom(true), 100);
        try { console.log('[send] bot_response FULL', botMsg); } catch {}
        // 봇 응답도 최근 본 키로 기록하여 WS 중복 수신을 방지
        try {
          const key = `${botMsg.user_id}|${botMsg.message}`;
          const t = new Date(botMsg.time).getTime();
          recentSeenRef.current.set(key, t);
        } catch {}
      }
      if (!ChatSocket.isConnected()) {
        console.log('WebSocket not connected, attempting to reconnect...');
        setTimeout(() => { (async () => { await connectWebSocket(); })(); }, 0);
      }
    } catch (e) {
      console.error('[send] fail', e);
      // 전송 실패 시 낙관적 업데이트 제거
      setMessages(prev => prev.filter(msg => msg.id !== optimistic.id));
    } finally {
      setIsSending(false);
    }
  };

      return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <LinearGradient
        colors={['#D1E2F8', '#8CB6EE']}
        style={styles.gradientContainer}
      >
        {/* 웹소켓 상태 배너 비표시 */}
        {/* 메시지 목록 */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#333" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!isLoadingMore) {
                scrollToBottom(true);
              }
            }}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.2}
            onEndReached={loadMoreHistory}
            ListFooterComponent={isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#333" />
              </View>
            ) : null}
          />
        )}

        {/* 입력창 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="/를 입력하고 챗봇에게 질문해보세요."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              multiline
            />
            <TouchableOpacity style={[styles.sendButton, isSending && styles.sendButtonDisabled]} onPress={sendMessage} disabled={isSending}>
              {isSending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <IcSend width={24} height={24} stroke="none" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default BusanTalkScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1E2F8',
  },
  gradientContainer: {
    flex: 1,
  },
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  debugText: {
    color: '#333',
    fontSize: 12,
    marginRight: 10,
  },
  debugButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#333',
    fontSize: 10,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  messageContainer: {
    marginBottom: 8,
  },
  messageWrapper: {
    flexDirection: 'column',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  profileText: {
    fontSize: 12,
  },
  nickname: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  messageContentBot: {
    maxWidth: width * 0.75,
    paddingLeft: 30,
  },
  messageContentUser: {
    maxWidth: width * 0.75,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageRow: {
    flexDirection: 'row',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 2,
    maxWidth: width * 0.75,
    flexShrink: 1,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  botText: {
    color: '#000',
  },
  userText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    color: '#ffffff',
    marginHorizontal: 8,
    marginBottom: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    paddingRight: 6,
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    paddingVertical: 2,
    paddingRight: 8,
    minHeight: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#ffffff',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 12,
  },

});
