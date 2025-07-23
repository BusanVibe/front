# 안드로이드 앱 아이콘 설정 가이드

## 방법 1: 온라인 도구 사용 (권장)

1. https://icon.kitchen/ 또는 https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html 접속
2. `src/assets/logo.png` 파일을 업로드
3. 아이콘 스타일 설정 (배경색, 패딩 등)
4. 생성된 아이콘 파일들을 다운로드

## 방법 2: 수동 크기 조정

필요한 아이콘 크기들:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` - 48x48px
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` - 72x72px
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` - 96x96px
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` - 192x192px

라운드 아이콘도 동일한 크기로:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png` - 48x48px
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` - 72x72px
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png` - 96x96px
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png` - 144x144px
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png` - 192x192px

## 현재 설정 확인

AndroidManifest.xml에서 다음과 같이 설정되어 있습니다:
```xml
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
```

## 빌드 후 확인

아이콘을 교체한 후:
1. `npx react-native run-android` 또는 `cd android && ./gradlew clean && cd ..`
2. 앱을 다시 빌드하여 새 아이콘 확인

## 추가 팁

- 아이콘은 정사각형이어야 하며, 투명 배경을 권장합니다
- 안드로이드는 자동으로 둥근 모서리를 적용할 수 있습니다
- 아이콘 내부에 텍스트가 있다면 충분히 크게 만드세요