/**
 * 카카오 로그인 컴포넌트
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { AuthService } from '../services/authService';
import { KakaoLoginResult } from '../types/auth';

interface KakaoLoginProps {
  onLoginSuccess: (user: KakaoLoginResult) => void;
  onLoginError: (error: string) => void;
}

export const KakaoLogin: React.FC<KakaoLoginProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도 시작');
    setShowWebView(true);
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url, loading, canGoBack, canGoForward } = navState;
    console.log('=== WebView 네비게이션 상태 변경 ===');
    console.log('URL:', url);
    console.log('로딩 중:', loading);
    console.log('뒤로 가기 가능:', canGoBack);
    console.log('앞으로 가기 가능:', canGoForward);
    
    // 카카오 인증 페이지 로드 확인
    if (url.includes('kauth.kakao.com')) {
      console.log('카카오 인증 페이지 로드됨');
    }
    
    // 리다이렉트 URL에서 code 파라미터 추출
    if (url.includes('api.busanvibe.site/users/oauth/kakao')) {
      console.log('=== 카카오 리다이렉트 URL 감지 ===');
      console.log('리다이렉트 URL:', url);
      
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const urlParams = new URLSearchParams(urlParts[1]);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        console.log('URL 파라미터들:');
        console.log('- code:', code);
        console.log('- error:', error);
        console.log('- error_description:', errorDescription);
        
        if (error) {
          setShowWebView(false);
          console.error('카카오 인증 에러:', error, errorDescription);
          onLoginError(`카카오 인증 실패: ${error} - ${errorDescription}`);
          return;
        }
        
        if (code) {
          console.log('카카오 인증 코드 추출 성공:', code);
          setShowWebView(false);
          setLoading(true);
          
          try {
            const response = await AuthService.kakaoLogin(code);
            
            if (response.is_success) {
              console.log('=== 최종 로그인 성공 ===');
              onLoginSuccess(response.result);
            } else {
              console.error('백엔드 로그인 처리 실패:', response.message);
              onLoginError(response.message || '로그인에 실패했습니다.');
            }
          } catch (error) {
            console.error('백엔드 API 호출 에러:', error);
            onLoginError('네트워크 오류가 발생했습니다.');
          } finally {
            setLoading(false);
          }
        } else {
          setShowWebView(false);
          console.error('카카오 인증 코드를 받지 못함');
          onLoginError('인증 코드를 받지 못했습니다.');
        }
      } else {
        console.error('URL에 파라미터가 없음:', url);
      }
    }
  };

  if (showWebView) {
    return (
      <View style={styles.webViewContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowWebView(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: AuthService.getKakaoAuthUrl() }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView 에러:', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP 에러:', nativeEvent);
          }}
          onLoadStart={() => {
            console.log('WebView 로드 시작');
          }}
          onLoadEnd={() => {
            console.log('WebView 로드 완료');
          }}
          style={styles.webView}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.kakaoButton}
        onPress={handleKakaoLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.kakaoButtonText}>카카오로 로그인</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  kakaoButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  webView: {
    flex: 1,
  },
});