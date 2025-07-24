import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import {View, Image, Animated} from 'react-native';
import './global.css';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  if (showSplash) {
    return (
      <View className="flex-1 bg-white">
        <Animated.View 
          className="flex-1 items-center justify-center"
          style={{opacity: fadeAnim}}
        >
          <Image
            source={require('./src/assets/logo.png')}
            className="w-24 h-24"
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

export default App;
