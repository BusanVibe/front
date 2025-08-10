/**
 * 로그인 화면
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { KakaoLogin } from '../components/KakaoLogin';
import { KakaoLoginResult, User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();

  const handleLoginSuccess = async (kakaoUser: KakaoLoginResult) => {
    try {
      console.log('카카오 로그인 성공, 사용자 정보 저장 중:', kakaoUser);
      
      const user: User = {
        id: kakaoUser.id,
        email: kakaoUser.email,
        accessToken: kakaoUser.tokenResponseDTO.accessToken,
        refreshToken: kakaoUser.tokenResponseDTO.refreshToken,
      };
      
      await login(user);
      
      console.log('로그인 완료, 홈화면으로 이동');
      
      Alert.alert(
        '로그인 성공',
        `환영합니다! ${user.email}${kakaoUser.newUser ? '\n새로운 사용자입니다.' : ''}`,
        [
          {
            text: '확인',
            onPress: () => {
              onLoginSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
    }
  };

  const handleLoginError = (error: string) => {
    console.error('로그인 에러:', error);
    Alert.alert('로그인 실패', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BusanVibe</Text>
        <Text style={styles.subtitle}>부산의 모든 것을 경험하세요</Text>
        
        <View style={styles.loginContainer}>
          <KakaoLogin
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  loginContainer: {
    width: '100%',
    alignItems: 'center',
  },
});