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
  RefreshControl,
  InteractionManager,
  Image,
  AppState,
  Animated,
  LayoutAnimation,
  UIManager,
  Keyboard,
  Platform,
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

// 타이핑 인디케이터 컴포넌트
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = animateDot(dot1, 0);
    const animation2 = animateDot(dot2, 200);
    const animation3 = animateDot(dot3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={typingStyles.container}>
      <Animated.View style={[typingStyles.dot, { opacity: dot1 }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot2 }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999999',
    marginHorizontal: 2,
  },
});

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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  const [inputText, setInputText] = useState('');
  const listRef = useRef<any>(null);
  // 키보드 높이에 따라 입력창을 올리기 위한 애니메이션 값
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;
  const keyboardVisibleRef = useRef<boolean>(false);
  // 현재까지 본 메시지 중 가장 큰 타임스탬프(ms) 추적 → 동시각 충돌 방지용
  const lastTimestampMsRef = useRef<number>(0);
  // 최근 내가 전송한 메시지 텍스트 기록(에코 방지)
  const pendingSentRef = useRef<{ text: string; ts: number }[]>([]);
  // 최근에 처리한 (userId+text) 키의 마지막 시간 기록(히스토리/실시간 중복 방지)
  const recentSeenRef = useRef<Map<string, number>>(new Map());
  // 내 사용자 ID 캐시 (JWT sub 우선)
  const myUserIdRef = useRef<number>(-1);
  // 히스토리 최초 1회만 로드 가드
  const hasLoadedHistoryRef = useRef<boolean>(false);

  // Android 레이아웃 애니메이션 활성화
  useEffect(() => {
    try {
      if (Platform.OS === 'android' && (UIManager as any)?.setLayoutAnimationEnabledExperimental) {
        (UIManager as any).setLayoutAnimationEnabledExperimental(true);
      }
    } catch {}
  }, []);

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

  // 정렬용 안전 타임스탬프 변환기
  const timeToMs = (input?: string): number => {
    try {
      if (!input || typeof input !== 'string') return Date.now();
      const t = Date.parse(input);
      if (!isNaN(t)) return t;
      const m = input.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)(Z|[+-]\d{2}:?\d{2})?$/);
      if (m) {
        const head = m[1];
        const ms = (m[2] || '').slice(0, 3).padEnd(3, '0');
        const tz = m[3] ?? 'Z';
        const fixed = `${head}.${ms}${tz}`;
        const t2 = Date.parse(fixed);
        if (!isNaN(t2)) return t2;
      }
      return Date.now();
    } catch {
      return Date.now();
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
  const mapChatToMessage = (chat: ChatMessage, index: number, fallbackTimeMs?: number): Message => {
    const myId = myUserIdRef.current !== -1 ? myUserIdRef.current : Number((authUser as any)?.id ?? -1);
    const userIdNum = Number(chat.user_id ?? 0);
    const isMyFromServer = typeof (chat as any)?.is_my === 'boolean' ? (chat as any).is_my : undefined;
    // 타입 정규화: 백엔드가 'BOT'을 줄 수 있으므로 'BOT_RESPONSE'로 매핑
    const normalizedType = ((): Message['type'] => {
      const t = String((chat as any)?.type ?? '').toUpperCase();
      if (t === 'BOT' || t === 'BOT_RESPONSE') return 'BOT_RESPONSE';
      if (t === 'BOT_REQUEST') return 'BOT_REQUEST';
      return 'CHAT';
    })();
    // 시간 파싱 실패/누락 시 폴백: 호출 시점 밀리초
    let timeIso = chat.time as any;
    const parsed = timeToMs(String(timeIso ?? ''));
    if (!timeIso || isNaN(parsed)) {
      const base = typeof fallbackTimeMs === 'number' ? fallbackTimeMs : Date.now();
      const assigned = Math.max(base, (lastTimestampMsRef.current || 0) + 1);
      timeIso = new Date(assigned).toISOString();
    }
    return {
      id: `api-${chat.time}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userIdNum,
      name: chat.name ?? '',
      image_url: chat.image_url ?? '',
      message: chat.message ?? '',
      time: String(timeIso ?? new Date().toISOString()),
      type: normalizedType,
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

  const getTypePriority = (m: Message) => {
    // 동일 시각일 때 요청이 응답보다 먼저 보이도록 우선순위
    // CHAT(1)은 중간, BOT_REQUEST(0) < CHAT(1) < BOT_RESPONSE(2)
    if (m.type === 'BOT_REQUEST') return 0;
    if (m.type === 'CHAT') return 1;
    return 2; // BOT_RESPONSE
  };

  const sortByIsoTimeAsc = (list: Message[]) =>
    list.sort((a, b) => {
      const ta = timeToMs(a.time);
      const tb = timeToMs(b.time);
      if (ta !== tb) return ta - tb; // 밀리초까지 시간 기준 절대 정렬
      // 완전히 동일한 타임스탬프일 때만 안정화용 보조 정렬
      return String(a.id).localeCompare(String(b.id));
    });

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

  // 히스토리 페이지를 기존 목록 앞에 붙이되, 기존 항목의 순서를 재정렬하지 않음
  const prependHistoryNoResort = (prev: Message[], incoming: Message[]) => {
    const existsKey = new Set<string>();
    for (const m of prev) {
      existsKey.add(`${m.user_id}|${m.message}|${m.time}`);
    }
    // 히스토리 페이지 내부도 절대 시간순으로 정렬 후 앞에 붙임
    const filtered = incoming.filter(m => !existsKey.has(`${m.user_id}|${m.message}|${m.time}`));
    const sortedIncoming = sortByIsoTimeAsc(filtered);
    return [...sortedIncoming, ...prev];
  };

  const filterNewHistoryItems = (current: Message[], incoming: Message[]) => {
    const existsKey = new Set<string>();
    for (const m of current) {
      existsKey.add(`${m.user_id}|${m.message}|${m.time}`);
    }
    return incoming.filter(m => !existsKey.has(`${m.user_id}|${m.message}|${m.time}`));
  };

  // 점진적 프리펜드 큐
  const progressiveQueueRef = useRef<Message[]>([]);
  const progressiveTimerRef = useRef<any>(null);
  const progressiveActiveRef = useRef<boolean>(false);

  const stopProgressiveTimer = () => {
    if (progressiveTimerRef.current) {
      clearTimeout(progressiveTimerRef.current);
      progressiveTimerRef.current = null;
    }
  };

  const processProgressive = () => {
    if (progressiveQueueRef.current.length === 0) {
      progressiveActiveRef.current = false;
      stopProgressiveTimer();
      return;
    }
    const nextItem = progressiveQueueRef.current.shift() as Message;
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {}
    setMessages(prev => [nextItem, ...prev]);
    progressiveTimerRef.current = setTimeout(processProgressive, 60);
  };

  const startProgressivePrepend = (items: Message[]) => {
    if (!items || items.length === 0) return;
    progressiveQueueRef.current = [...items, ...progressiveQueueRef.current];
    if (!progressiveActiveRef.current) {
      progressiveActiveRef.current = true;
      processProgressive();
    }
  };

  useEffect(() => {
    return () => {
      stopProgressiveTimer();
    };
  }, []);

  // 메시지 배열이 바뀔 때마다 현재까지의 최대 타임스탬프(ms) 갱신
  useEffect(() => {
    try {
      let maxMs = lastTimestampMsRef.current || 0;
      for (const m of messages) {
        const t = timeToMs(m.time);
        if (t > maxMs) maxMs = t;
      }
      lastTimestampMsRef.current = maxMs;
    } catch {}
  }, [messages]);

  // 상단 로드 트리거 안정화용 레퍼런스들
  const isNearBottomRef = useRef<boolean>(true);
  const isLoadingMoreRef = useRef<boolean>(false);
  const lastRequestedCursorRef = useRef<string | null>(null);
  const lastRequestTsRef = useRef<number>(0);
  const topCooldownUntilRef = useRef<number>(0);
  const topLockRef = useRef<boolean>(false);
  // 스크롤/앵커 상태 추적
  const lastOffsetYRef = useRef<number>(0);
  const lastContentHeightRef = useRef<number>(0);
  const anchorPendingRef = useRef<{ oldHeight: number; oldOffset: number } | null>(null);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  const loadInitialHistory = async () => {
    setIsLoading(true);
    try {
      const page = await ChatService.history(null, 30);
      const mapped = sortByIsoTimeAsc(page.messages.map((m, i) => mapChatToMessage(m, i)));
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
          seen.set(key, timeToMs(m.time));
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
    const now = Date.now();
    if (isLoadingMoreRef.current || cursorId === null) return;
    if (lastRequestedCursorRef.current === cursorId && now - lastRequestTsRef.current < 1000) {
      return; // 같은 커서로 1초 내 중복 요청 방지
    }
    isLoadingMoreRef.current = true;
    lastRequestedCursorRef.current = cursorId;
    lastRequestTsRef.current = now;
    setIsLoadingMore(true);
    try {
      // 현재 높이/오프셋 저장 → 프리펜드 후 보정
      anchorPendingRef.current = {
        oldHeight: lastContentHeightRef.current || 0,
        oldOffset: lastOffsetYRef.current || 0,
      };
      const page = await ChatService.history(cursorId, 30);
      const mapped = sortByIsoTimeAsc(page.messages.map((m, i) => mapChatToMessage(m, i)));
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
          seen.set(key, timeToMs(m.time));
        }
      } catch {}
      // 점진적 프리펜드 비활성화: 한 번 호출당 최대 30개를 즉시 붙임
      stopProgressiveTimer();
      progressiveQueueRef.current = [];
      progressiveActiveRef.current = false;
      setMessages(prev => prependHistoryNoResort(prev, mapped));
      setCursorId(page.cursorId);
      // 상단 연속 트리거 방지 쿨다운
      topCooldownUntilRef.current = Date.now() + 600;
      // 통신 결과를 생략 없이 로그 출력
      console.log('[history] full response page:', page);
      console.log('[history] full response mapped:', mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  };

  const onRefresh = useCallback(async () => {
    if (isRefreshing || cursorId === null) return;
    setIsRefreshing(true);
    try {
      console.log('[history] pull-to-refresh triggered');
      await loadMoreHistory();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, cursorId]);

  const handleScroll = useCallback((e: any) => {
    try {
      const { contentOffset, layoutMeasurement, contentSize } = e?.nativeEvent ?? {};
      const offsetY = contentOffset?.y ?? 0;
      const viewportH = layoutMeasurement?.height ?? 0;
      const contentH = contentSize?.height ?? 0;

      lastOffsetYRef.current = offsetY;
      lastContentHeightRef.current = contentH;

      // 하단 근접 여부 갱신 (자동 스크롤 제어용)
      const bottomThreshold = 80;
      const distanceFromBottom = contentH - (offsetY + viewportH);
      isNearBottomRef.current = distanceFromBottom <= bottomThreshold;

      // 상단 근접 시 이전 히스토리 로드
      if (offsetY <= 12) {
        // 상단 근접 시 추가 로드
        if (Date.now() >= topCooldownUntilRef.current && !isLoadingMoreRef.current && cursorId !== null && !topLockRef.current) {
          topLockRef.current = true; // 같은 제스처에서 한 번만
          loadMoreHistory();
        }
      }
      // 사용자가 충분히 아래로 내려오면 락 해제
      if (offsetY > 140 && topLockRef.current) {
        topLockRef.current = false;
      }
    } catch {}
  }, [cursorId]);

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
      // 포커스 복귀 시 항상 맨 아래로 스크롤 고정
      setTimeout(() => {
        scrollToBottom(false);
        requestAnimationFrame(() => scrollToBottom(false));
        setTimeout(() => scrollToBottom(false), 120);
      }, 0);
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

  // 키보드에 맞춰 입력창만 올리기 (iOS/Android 모두 적용)
  // Android는 Activity를 adjustPan으로 설정하여 탭바가 고정되고,
  // 여기서 입력창만 키보드 높이만큼 올려 겹침을 방지한다.
  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    const handleShow = (e: any) => {
      keyboardVisibleRef.current = true;
      if (Platform.OS === 'android') {
        // Android는 adjustResize로 전체 레이아웃이 줄어듦. 수동 이동 금지
        return;
      }
      const height = e?.endCoordinates?.height ?? 0;
      Animated.timing(keyboardTranslateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };
    const handleHide = () => {
      keyboardVisibleRef.current = false;
      if (Platform.OS === 'android') {
        return;
      }
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };
    const subShow = Keyboard.addListener(showEvent as any, handleShow);
    const subHide = Keyboard.addListener(hideEvent as any, handleHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [keyboardTranslateY]);

  const renderMessage = ({item}: {item: Message}) => {
    // 봇 타이핑 로딩 메시지인지 확인
    const isBotTypingMessage = item.id === 'bot-typing';
    
    return (
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
              <Text style={styles.nickname}>{item.type === 'BOT_RESPONSE' || isBotTypingMessage ? '챗봇' : (item.name ?? '닉네임')}</Text>
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
                {isBotTypingMessage ? (
                  <TypingIndicator />
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      (item.type === 'BOT_RESPONSE' || !item.is_my) ? styles.botText : styles.userText,
                    ]}>
                    {softWrap(item.message)}
                  </Text>
                )}
              </View>
              {(item.type === 'BOT_RESPONSE' || !item.is_my) && !isBotTypingMessage && <Text style={styles.timeText}>{formatTime(item.time)}</Text>}
            </View>
          </View>
        </View>
      </View>
    );
  };

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
    const isSlash = text.startsWith('/');
    const clientSendMsRaw = Date.now();
    const clientSendMs = Math.max(clientSendMsRaw, (lastTimestampMsRef.current || 0) + 1);
    const clientSendIso = new Date(clientSendMs).toISOString();
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      user_id: myId,
      name: (authUser as any)?.name ?? '',
      image_url: (authUser as any)?.image_url ?? '',
      message: text,
      time: clientSendIso,
      type: isSlash ? 'BOT_REQUEST' : 'CHAT',
      is_my: true,
    };
    setMessages(prev => sortByIsoTimeAsc([...prev, optimistic]));
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
    
    // 챗봇 질문인 경우 타이핑 로딩 메시지 추가
    const isBotQuestion = text.startsWith('/');
    if (isBotQuestion) {
      setIsBotTyping(true);
      const typingMessage: Message = {
        id: 'bot-typing',
        user_id: -1,
        name: '챗봇',
        image_url: '',
        message: '',
        time: new Date().toISOString(),
        type: 'BOT_RESPONSE',
        is_my: false,
      };
      setMessages(prev => [...prev, typingMessage]);
      setTimeout(() => scrollToBottom(true), 100);
    }
    
    try { console.log('[send] request FULL', { length: text.length, text }); } catch {}
    try {
      const res = await ChatService.send(text);
      
      // 챗봇 질문인 경우 타이핑 메시지 제거 후 실제 응답 추가
      if (isBotQuestion) {
        setIsBotTyping(false);
        // 타이핑 메시지 제거
        setMessages(prev => prev.filter(msg => msg.id !== 'bot-typing'));
        
        const botMsg: Message = mapChatToMessage(res.result, 0, clientSendMs);
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
      
      // 챗봇 질문 실패 시 타이핑 메시지도 제거
      if (isBotQuestion) {
        setIsBotTyping(false);
        setMessages(prev => prev.filter(msg => msg.id !== 'bot-typing'));
      }
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
            onContentSizeChange={(w, h) => {
              // 키보드 표시 중에는 자동 스크롤 금지
              if (keyboardVisibleRef.current) return;
              // 히스토리 프리펜드 후에도 현재 시점 유지 보정
              if (anchorPendingRef.current) {
                const { oldHeight, oldOffset } = anchorPendingRef.current;
                const delta = (h ?? 0) - (oldHeight ?? 0);
                const target = Math.max(0, (oldOffset ?? 0) + delta);
                try {
                  listRef.current?.scrollToOffset?.({ offset: target, animated: false });
                } catch {}
                anchorPendingRef.current = null;
                return;
              }
              // 사용자 시야가 하단 거의 근처일 때만 자동 스크롤
              if (!isLoadingMore && isNearBottomRef.current) {
                scrollToBottom(true);
              }
            }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            ListHeaderComponent={
              isLoadingMore ? (
                <View style={styles.headerLoader}>
                  <ActivityIndicator size="small" color="#333" />
                </View>
              ) : (cursorId ? (
                <TouchableOpacity style={styles.headerLoadMoreBtn} onPress={loadMoreHistory}>
                  <Text style={styles.headerLoadMoreText}>이전 채팅 더 보기</Text>
                </TouchableOpacity>
              ) : null)
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#333"
                colors={["#333"]}
              />
            }
          />
        )}

        {/* 입력창 */}
        <Animated.View style={[
          styles.inputContainer,
          { transform: [{ translateY: Animated.multiply(keyboardTranslateY, -1) }] },
        ]}>
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
        </Animated.View>
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
  headerLoader: {
    paddingVertical: 12,
  },
  headerLoadMoreBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerLoadMoreText: {
    fontSize: 12,
    color: '#333',
  },

});
