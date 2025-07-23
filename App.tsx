import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import {View, Image, StyleSheet, Animated} from 'react-native';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (imageLoaded) {
      // 이미지가 로드되면 페이드인 애니메이션 시작
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 2초 후 스플래시 화면 숨김
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, fadeAnim]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
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
      </View>
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
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
