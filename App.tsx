import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LogoIcon from './src/assets/logo.svg';

const { width, height } = Dimensions.get('window');

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 로그인 상태 체크 (실제로는 AsyncStorage나 다른 저장소에서 확인)
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // TODO: 실제 로그인 상태 체크 로직
      // const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      // setIsLoggedIn(loginStatus === 'true');
      
      // 임시로 false로 설정 (로그인되지 않은 상태)
      setIsLoggedIn(false);
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      setIsLoggedIn(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      // TODO: 카카오 로그인 구현
      console.log('카카오 로그인 시도');
      
      // 임시로 로그인 성공 처리
      setIsLoggedIn(true);
      setShowSplash(false);
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
    }
  };

  if (showSplash) {
    return (
      <LinearGradient
        colors={['#B8D4F0', '#4A90E2']}
        style={styles.splashContainer}
      >
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
        <TouchableOpacity 
          style={styles.kakaoButton}
          onPress={handleKakaoLogin}
        >
          <View style={styles.kakaoButtonContent}>
            <Text style={styles.kakaoButtonIcon}>💬</Text>
            <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (!isLoggedIn) {
    // 로그인되지 않은 상태에서는 스플래시 화면 유지
    return (
      <LinearGradient
        colors={['#B8D4F0', '#4A90E2']}
        style={styles.splashContainer}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <LogoIcon width={60} height={60} />
          </View>
          <Text style={styles.mainTitle}>부산스럽다</Text>
          <Text style={styles.subTitle}>부산 여행 혼잡도 가이드</Text>
        </View>
        <TouchableOpacity 
          style={styles.kakaoButton}
          onPress={handleKakaoLogin}
        >
          <View style={styles.kakaoButtonContent}>
            <Text style={styles.kakaoButtonIcon}>💬</Text>
            <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  },
  kakaoButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  kakaoButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C1E1E',
  },
});

export default App;
