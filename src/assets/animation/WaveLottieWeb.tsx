import React from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import wave from './wave.json';

const html = `
<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body,#app { margin:0; padding:0; height:100%; background:transparent; }
</style>
</head>
<body>
<div id="app"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
  const data = ${JSON.stringify(wave)};
  const container = document.getElementById('app');
  lottie.loadAnimation({
    container,
    renderer: 'svg', // 마스크/블렌드 호환 좋음
    loop: true,
    autoplay: true,
    animationData: data
  });
</script>
</body>
</html>
`;

export function WaveLottieWeb() {
  return (
    <View style={{height: 350, width: '100%'}}>
      <WebView
        originWhitelist={['*']}
        source={{html}}
        style={{backgroundColor: 'transparent', width: '100%'}}
        androidHardwareAccelerationDisabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}
