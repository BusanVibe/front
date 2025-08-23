import React, {useEffect, useRef, useState} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IcSend from '../assets/icon/ic_send.svg';
import IcNickname from '../assets/icon/ic_talknickname.svg';
import { ChatService, ChatMessage } from '../services/chatService';


const {width} = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  time: string;
  isBot: boolean;
  name?: string;
}

const BusanTalkScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [inputText, setInputText] = useState('');
  const listRef = useRef<any>(null);

  const scrollToBottom = (animated: boolean = true) => {
    try {
      listRef.current?.scrollToEnd?.({ animated });
    } catch (e) {}
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

  const mapChatToMessage = (chat: ChatMessage, index: number): Message => ({
    id: `${chat.time}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    text: chat.message,
    time: formatTime(chat.time),
    isBot: chat.type === 'BOT',
    name: chat.name,
  });

  const loadInitialHistory = async () => {
    setIsLoading(true);
    try {
      const page = await ChatService.history(null, 30);
      const mapped = page.messages.map(mapChatToMessage);
      setMessages(mapped);
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
      setMessages(prev => [...prev, ...mapped]);
      setCursorId(page.cursorId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialHistory();
  }, []);

  const renderMessage = ({item}: {item: Message}) => (
    <View
      style={[
        styles.messageContainer,
        item.isBot ? styles.botMessage : styles.userMessage,
      ]}>
      <View style={styles.messageWrapper}>
        {item.isBot && (
          <View style={styles.profileContainer}>
            <View style={styles.profileIcon}>
              <IcNickname width={30} height={30} stroke="none" />
            </View>
            <Text style={styles.nickname}>{item.name ?? '닉네임'}</Text>
          </View>
        )}
        <View style={styles.messageContent}>
          <View style={[styles.messageRow, !item.isBot ? styles.userMessageRow : {}]}>
            {!item.isBot && <Text style={styles.timeText}>{item.time}</Text>}
            <View
              style={[
                styles.messageBubble,
                item.isBot ? styles.botBubble : styles.userBubble,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  item.isBot ? styles.botText : styles.userText,
                ]}>
                {item.text}
              </Text>
            </View>
            {item.isBot && <Text style={styles.timeText}>{item.time}</Text>}
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

    const nowText = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // 낙관적 UI 업데이트 (사용자 메시지)
    const optimistic: Message = {
      id: Date.now().toString(),
      text,
      time: nowText,
      isBot: false,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 0);
    setInputText('');

    setIsSending(true);
    try {
      const res = await ChatService.send(text);
      // 챗봇 질문인 경우 API 응답으로 받은 메시지를 추가
      if (text.startsWith('/')) {
        const botMsg: Message = mapChatToMessage(res.result, 0);
        setMessages(prev => [...prev, botMsg]);
        setTimeout(() => scrollToBottom(true), 0);
      }
    } catch (e) {
      console.error(e);
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
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isSending}>
            <IcSend width={20} height={20} stroke="none" />
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
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  messageContainer: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  profileText: {
    fontSize: 12,
  },
  nickname: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    lineHeight: 24,
    textAlignVertical: 'center',
  },
  messageContent: {
    maxWidth: width * 0.75,
    paddingLeft: 20,
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
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
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
  },
  botText: {
    color: '#000',
  },
  userText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginHorizontal: 8,
    marginBottom: 4,
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
