import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import {View, Image, StyleSheet, Animated} from 'react-native';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (imageLoaded) {
      // 이미지가 로드되면 페이드인 애니메이션 시작
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 2초 후 페이드아웃 시작
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, fadeAnim, splashOpacity]);

  return (
    <View style={styles.container}>
      {/* 메인 화면 */}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>

      {/* 스플래시 화면 오버레이 */}
      {showSplash && (
        <Animated.View style={[styles.splashOverlay, {opacity: splashOpacity}]}>
          <Animated.View style={[styles.logoContainer, {opacity: fadeAnim}]}>
            <Image
              source={require('./src/assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              onLoad={() => setImageLoaded(true)}
              onError={error => {
                console.log('Image load error:', error);
                setImageLoaded(true); // 에러가 나도 계속 진행
              }}
            />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default App;
