import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import {LocationProvider} from './src/contexts/LocationContext';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import LogoIcon from './src/assets/logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import {WaveLottieWeb} from './src/assets/animation/WaveLottieWeb';

const {width, height} = Dimensions.get('window');

// 메인 앱 컴포넌트 (AuthProvider 내부)
const AppContent: React.FC = () => {
  const {user, isLoading, login, isAuthenticated} = useAuth();
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCode, setProcessedCode] = useState<string | null>(null);
  const [attemptedEmailRefresh, setAttemptedEmailRefresh] = useState(false);

  useEffect(() => {
    // 딥링크 처리 설정
    const handleDeepLink = (url: string) => {
      console.log('=== 딥링크 수신 ===');
      console.log('딥링크 URL:', url);

      if (url.startsWith('busanvibe://oauth/kakao')) {
        handleKakaoDeepLink(url);
      }
    };

    // 앱이 실행 중일 때 딥링크 처리
    const linkingListener = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    // 앱이 종료된 상태에서 딥링크로 실행될 때 처리
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      linkingListener.remove();
    };
  }, []);

  // 이메일이 'unknown'인 경우, 토큰으로 사용자 정보 재조회하여 이메일 갱신
  useEffect(() => {
    const refreshEmailIfUnknown = async () => {
      try {
        if (!user?.accessToken) return;
        const response = await fetch('https://api.busanvibe.site/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        const fetchedEmail = data?.result?.email;
        if (fetchedEmail && fetchedEmail !== 'unknown') {
          await login({
            id: data?.result?.id || user.id || 0,
            email: fetchedEmail,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            tokenIssuedAt: user.tokenIssuedAt,
          });
        }
      } catch (e) {
        // ignore
      }
    };

    if (
      isAuthenticated &&
      user?.email === 'unknown' &&
      !attemptedEmailRefresh
    ) {
      setAttemptedEmailRefresh(true);
      refreshEmailIfUnknown();
    }
  }, [isAuthenticated, user?.email, user?.accessToken]);

  const handleKakaoDeepLink = async (url: string) => {
    console.log('=== 카카오 딥링크 처리 시작 ===');
    console.log('딥링크 URL:', url);

    try {
      // URL에서 토큰 추출 (React Native 호환 방식)
      const queryString = url.split('?')[1];
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (queryString) {
        const params = queryString.split('&');
        for (const param of params) {
          const [key, value] = param.split('=');
          if (key === 'accessToken') {
            accessToken = decodeURIComponent(value);
          } else if (key === 'refreshToken') {
            refreshToken = decodeURIComponent(value);
          }
        }
      }

      console.log('추출된 accessToken:', accessToken ? '있음' : '없음');
      console.log('추출된 refreshToken:', refreshToken ? '있음' : '없음');

      if (accessToken && refreshToken) {
        // WebView 닫기
        setShowWebView(false);
        setLoading(true);

        // 토큰 저장
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // 사용자 정보 가져오기 (토큰으로 사용자 정보 조회)
        try {
          const userResponse = await fetch(
            'https://api.busanvibe.site/users/me',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();

            // AuthContext의 login 함수 사용
            await login({
              id: userData.result.id || 0,
              email: userData.result.email || 'unknown',
              accessToken,
              refreshToken,
              tokenIssuedAt: Date.now(),
            });

            console.log('=== 딥링크 로그인 완료 ===');
          } else {
            // 사용자 정보를 가져올 수 없어도 토큰이 있으면 로그인 처리
            await login({
              id: 0,
              email: 'unknown',
              accessToken,
              refreshToken,
              tokenIssuedAt: Date.now(),
            });
          }
        } catch (userError) {
          console.error('사용자 정보 조회 오류:', userError);
          // 사용자 정보 조회 실패해도 토큰이 있으면 로그인 처리
          await login({
            id: 0,
            email: 'unknown',
            accessToken,
            refreshToken,
            tokenIssuedAt: Date.now(),
          });
        }
      } else {
        console.error('딥링크에서 토큰을 찾을 수 없음');
        Alert.alert('오류', '로그인 정보를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('딥링크 처리 오류:', error);
      Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    console.log('=== 카카오 로그인 시작 ===');
    setIsProcessing(false);
    setProcessedCode(null);
    setShowWebView(true);
  };

  const handleIdLogin = async () => {
    console.log('=== 심사용(게스트) 로그인 시작 ===');
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.busanvibe.site/users/login/guest',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const responseText = await response.text();
      console.log('심사용 로그인 응답:', response.status, responseText);

      if (!response.ok) {
        throw new Error(responseText || '심사용 로그인 실패');
      }

      const data = JSON.parse(responseText);
      if (
        data?.is_success &&
        data?.result?.accessToken &&
        data?.result?.refreshToken
      ) {
        await login({
          id: 0,
          email: 'guest@busanvibe',
          accessToken: data.result.accessToken,
          refreshToken: data.result.refreshToken,
          tokenIssuedAt: Date.now(),
        });
        Alert.alert('심사용 로그인 완료', '1회용 계정으로 로그인되었습니다.');
      } else {
        Alert.alert('오류', data?.message || '심사용 로그인에 실패했습니다.');
      }
    } catch (e) {
      console.error('심사용 로그인 오류:', e);
      Alert.alert('오류', '심사용 로그인 처리 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const {url, loading} = navState;
    console.log('=== WebView URL 변경 ===');
    console.log('URL:', url);
    console.log('Loading:', loading);

    // 딥링크 URL 감지 - 직접 처리
    if (url.startsWith('busanvibe://oauth/kakao')) {
      console.log('=== WebView에서 딥링크 감지 ===');
      handleKakaoDeepLink(url);
      return;
    }

    // 백엔드 콜백 URL 감지 (JSON 응답이 있는 페이지)
    if (
      url.includes('api.busanvibe.site/users/oauth/kakao') &&
      url.includes('code=') &&
      !loading
    ) {
      console.log('=== 카카오 콜백 URL 감지 ===');

      // URL에서 code 파라미터 추출 (React Native 호환 방식)
      let code: string | null = null;
      const codeMatch = url.match(/code=([^&]+)/);
      if (codeMatch) {
        code = decodeURIComponent(codeMatch[1]);
      }

      console.log('추출된 카카오 코드:', code);
      console.log('이전에 처리된 코드:', processedCode);

      // 중복 처리 방지 - 같은 코드는 한 번만 처리
      if (isProcessing || code === processedCode) {
        console.log('이미 처리 중이거나 같은 코드이므로 스킵');
        return;
      }

      if (code && code.length > 0) {
        // 카카오 코드 유효성 체크
        console.log('=== 카카오 코드 유효성 체크 ===');
        console.log('코드 길이:', code.length);
        console.log('코드 형태 체크:', /^[A-Za-z0-9_-]+$/.test(code));
        console.log('코드에 특수문자 포함:', /[^A-Za-z0-9_-]/.test(code));

        setIsProcessing(true);
        setProcessedCode(code);

        console.log('=== 백엔드 API 호출 시작 ===');
        setShowWebView(false);
        setLoading(true);

        try {
          // GET 방식으로 백엔드 API 호출 (기존 방식 유지)
          const encodedCode = encodeURIComponent(code);
          const apiUrl = `https://api.busanvibe.site/users/oauth/kakao?code=${encodedCode}`;

          console.log('=== API 호출 디버깅 정보 ===');
          console.log('원본 코드:', code);
          console.log('인코딩된 코드:', encodedCode);
          console.log('최종 API URL:', apiUrl);
          console.log('코드 길이:', code.length);
          console.log('현재 시간:', new Date().toISOString());

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'BusanVibe-App/1.0',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          console.log('=== 백엔드 응답 정보 ===');
          console.log('응답 상태:', response.status);
          console.log('응답 상태 텍스트:', response.statusText);
          console.log(
            '응답 헤더:',
            JSON.stringify([...response.headers.entries()]),
          );

          const responseText = await response.text();
          console.log('백엔드 원본 응답:', responseText);

          if (!response.ok) {
            console.error('=== 백엔드 API 호출 실패 ===');
            console.error('상태 코드:', response.status);
            console.error('응답 내용:', responseText);

            // 백엔드 개발자를 위한 디버깅 정보
            console.error('=== 백엔드 개발자용 디버깅 정보 ===');
            console.error('요청 URL:', apiUrl);
            console.error('요청 메소드: GET');
            console.error('카카오 코드 길이:', code.length);
            console.error('카카오 코드 첫 10자:', code.substring(0, 10));
            console.error(
              '카카오 코드 마지막 10자:',
              code.substring(code.length - 10),
            );

            throw new Error(
              `HTTP error! status: ${response.status}, response: ${responseText}`,
            );
          }

          const data = JSON.parse(responseText);
          console.log('=== 백엔드 응답 성공 ===');
          console.log('파싱된 응답 데이터:', {
            is_success: data.is_success,
            code: data.code,
            message: data.message,
            hasResult: !!data.result,
            hasTokens: !!data.result?.tokenResponseDTO,
            userEmail: data.result?.email,
          });

          if (data.is_success && data.result) {
            // 백엔드에서 받은 토큰을 저장 (AuthContext 사용)
            const {tokenResponseDTO, id, email} = data.result;

            await login({
              id: id,
              email: email,
              accessToken: tokenResponseDTO.accessToken,
              refreshToken: tokenResponseDTO.refreshToken,
              tokenIssuedAt: Date.now(),
            });

            console.log('=== 로그인 완료 ===');
            Alert.alert('로그인 성공', `환영합니다, ${email}님!`);
          } else {
            console.error('백엔드 응답 실패:', data.message);
            Alert.alert('오류', data.message || '로그인에 실패했습니다.');
          }
        } catch (error) {
          console.error('백엔드 API 호출 오류:', error);
          Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
          setShowWebView(false);
        } finally {
          setLoading(false);
          setIsProcessing(false);
        }
      } else {
        console.error('카카오 코드를 추출할 수 없음');
        console.log('URL 전체:', url);
        Alert.alert('오류', '카카오 인증 코드를 받지 못했습니다.');
        setShowWebView(false);
      }
    }
  };

  const getKakaoAuthUrl = () => {
    const clientId = '54690ce439aabad65181d8b39262d8b9';
    const redirectUri = 'https://api.busanvibe.site/users/oauth/kakao';
    const responseType = 'code';

    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;

    console.log('카카오 OAuth URL 생성:', authUrl);
    return authUrl;
  };

  // WebView 표시
  if (showWebView) {
    return (
      <View style={styles.webViewContainer}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowWebView(false)}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{uri: getKakaoAuthUrl()}}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onLoadEnd={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.log('WebView 로드 완료:', nativeEvent.url);

            // onLoadEnd에서는 처리하지 않음 (중복 방지)
            // onNavigationStateChange에서만 처리
          }}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('WebView 에러:', nativeEvent);
          }}
          onLoadStart={() => {
            console.log('WebView 로드 시작');
          }}
          style={styles.webView}
        />
      </View>
    );
  }

  // AuthContext 로딩 중이거나 로그인 처리 중
  if (isLoading || loading) {
    return (
      <LinearGradient
        colors={['#99DCFB', '#FFFFFF']}
        style={styles.splashContainer}>
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.subTitle, {marginTop: 20}]}>
            {loading ? '로그인 처리 중...' : '앱 로딩 중...'}
          </Text>
        </View>
        <View style={styles.waveContainer}>
          <WaveLottieWeb />
        </View>
      </LinearGradient>
    );
  }

  // 로그인되지 않은 상태 - 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#99DCFB', '#FFFFFF']}
        style={styles.splashContainer}>
        <View style={styles.contentContainer}>
          {/* 로고 아이콘 - 작은 크기로 조정 */}
          <View style={styles.iconContainer}>
            <LogoIcon width={100} height={100} />
          </View>

          {/* 메인 타이틀 */}
          <Text style={styles.mainTitle}>부산스럽다</Text>

          {/* 서브 타이틀 */}
          <Text style={styles.subTitle}>부산 여행 혼잡도 가이드</Text>
        </View>

        {/* 카카오 로그인 버튼 */}
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <View style={styles.kakaoButtonContent}>
            <Text style={styles.leftIconText}>💬</Text>
            <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
          </View>
        </TouchableOpacity>

        {/* 아이디 로그인 버튼 */}
        <TouchableOpacity style={styles.idButton} onPress={handleIdLogin}>
          <View style={styles.kakaoButtonContent}>
            <LogoIcon width={28} height={28} style={styles.leftIcon} />
            <Text style={styles.idButtonText}>심사용 로그인</Text>
          </View>
        </TouchableOpacity>

        {/* Wave 애니메이션 */}
        <View style={styles.waveContainer}>
          <WaveLottieWeb />
        </View>
      </LinearGradient>
    );
  }

  // 로그인된 상태 - 메인 앱 표시
  return (
    <LocationProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </LocationProvider>
  );
};

// 최상위 App 컴포넌트 (AuthProvider로 감싸기)
function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    fontWeight: '300',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: width - 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  kakaoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
  },
  leftIconText: {
    position: 'absolute',
    left: 16,
    fontSize: 22,
  },
  kakaoButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C1E1E',
    textAlign: 'center',
    width: '100%',
  },
  idButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: width - 40,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  idButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
    width: '100%',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
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
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '120%',
    height: 320,
  },
  waveAnimation: {
    width: '100%',
    height: '100%',
  },
});

export default App;
