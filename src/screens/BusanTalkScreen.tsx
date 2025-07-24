import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const BusanTalkScreen = () => {
  const [messages, setMessages] = useState([
    {id: '1', sender: 'user', text: '메시지메시지메시지'},
    {id: '2', sender: 'other', text: '메시지메시지메시지'},
    {id: '3', sender: 'other', text: '메시지메시지메시지'},
    {id: '4', sender: 'user', text: '메시지메시지메시지'},
    {
      id: '5',
      sender: 'other',
      text: '메시지메시지메시지메시지메시지메시지메시지메시지',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const renderItem = ({item}) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}>
        <Text style={styles.sender}>{isUser ? '나' : '닉네임'}</Text>
        <View style={styles.bubble}>
          <Text>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{color: 'white'}}>보내기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BusanTalkScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#D6E6F2'},
  list: {padding: 10},
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  sender: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  bubble: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 20,
  },
});
