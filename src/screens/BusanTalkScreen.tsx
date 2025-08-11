import React, {useState} from 'react';
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
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IcSend from '../assets/icon/ic_send.svg';
import IcNickname from '../assets/icon/ic_talknickname.svg';


const {width} = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  time: string;
  isBot: boolean;
}

const BusanTalkScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '테스트중입니다',
      time: '오후 01:30',
      isBot: true,
    },
    {
      id: '2',
      text: '부산뭐가유명해요?',
      time: '오후 01:30',
      isBot: true,
    },
    {
      id: '3',
      text: '아 집가고 싶어',
      time: '오후 01:30',
      isBot: true,
    },
    {
      id: '4',
      text: '메세지메세지',
      time: '오후 01:30',
      isBot: true,
    },
    {
      id: '5',
      text: '하기싫어하기싫어하기싫어하기싫어하기싫어하기싫어하기싫어하기싫어하기싫어',
      time: '오후 01:35',
      isBot: true,
    },
    {
      id: '6',
      text: '우왕부산이다',
      time: '오후 01:35',
      isBot: true,
    },
  ]);

  const [inputText, setInputText] = useState('');

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
            <Text style={styles.nickname}>닉네임</Text>
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

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        isBot: false,
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />  */}
      
      <LinearGradient
        colors={['#D1E2F8', '#8CB6EE']}
        style={styles.gradientContainer}
      >
        {/* 메시지 목록 */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

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
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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

});
