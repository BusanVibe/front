# 부산스럽다
> 실시간 혼잡도 데이터를 기반으로 관광지·맛집·문화시설·축제 정보를 제공하는 부산 지역 특화 관광서비스

![이미지 2025  9  23  오전 11 19 (9)](https://github.com/user-attachments/assets/51feb411-58e6-48af-8c96-2f962d8dc4f9)

![이미지 2025  9  23  오전 11 19 (10)](https://github.com/user-attachments/assets/83563a4b-8653-4e95-b84f-093ec9edd8f2)

![이미지 2025  9  23  오전 11 19 (7)](https://github.com/user-attachments/assets/0592532b-0c4d-4313-b987-b32642d54ab8)

![이미지 2025  9  23  오전 11 19 (1)](https://github.com/user-attachments/assets/0f2208fa-db3e-4d1e-b9d7-5d4af7382a63)

![이미지 2025  9  23  오전 11 19 (3)](https://github.com/user-attachments/assets/f06f8cb0-372b-4fac-8020-6f05fe8d822d)

![이미지 2025  9  23  오전 11 19 (8)](https://github.com/user-attachments/assets/6832b03d-b0b6-4384-9bd2-1c7096fe5b2a)

![이미지 2025  9  23  오전 11 19 (2)](https://github.com/user-attachments/assets/84adde99-6f2c-4036-9ebb-e03704437ef6)

![이미지 2025  9  23  오전 11 19 (6)](https://github.com/user-attachments/assets/8fb50515-8f19-4182-854d-03ed6b7d8531)

![이미지 2025  9  23  오전 11 19 (4)](https://github.com/user-attachments/assets/26d6bbcc-7789-4b57-90b4-f5ea9db8e156)

![이미지 2025  9  23  오전 11 19 (11)](https://github.com/user-attachments/assets/e9e3e51c-9dba-4711-84bc-a03c8dd55b6d)

![이미지 2025  9  23  오전 11 19 (5)](https://github.com/user-attachments/assets/5233d8d0-9463-4821-8bf2-68f35e628e27)

![이미지 2025  9  23  오전 11 19](https://github.com/user-attachments/assets/6c0e06c5-2816-44fb-be0e-cda4faa9053d)



# React Native 프로젝트 가이드

이 프로젝트는 [`@react-native-community/cli`](https://github.com/react-native-community/cli)를 통해 생성된 [**React Native**](https://reactnative.dev) 기반 프로젝트입니다.
- [React Native 환경 구성 가이드](https://reactnative.dev/docs/environment-setup)를 참고해 Node, JDK, Android Studio, Xcode 등을 사전에 설치해 주세요.

---

## 🎯 Git 커밋 컨벤션

- 🎉 **Start:** Start New Project  
- ✨ **Feat:** 새로운 기능을 추가  
- 🐛 **Fix:** 버그 수정  
- 🎨 **Design:** CSS 등 사용자 UI 디자인 변경  
- ♻️ **Refactor:** 코드 리팩토링  
- 🔧 **Settings:** 설정 파일 수정  
- 🗃️ **Comment:** 필요한 주석 추가 및 변경  
- ➕ **Dependency/Plugin:** 의존성·플러그인 추가  
- 📝 **Docs:** 문서 수정  
- 🔀 **Merge:** 브랜치 병합  
- 🚀 **Deploy:** 배포 관련 커밋  
- 🚚 **Rename:** 파일·폴더명 수정 또는 이동  
- 🔥 **Remove:** 파일 삭제  
- ⏪️ **Revert:** 이전 버전으로 롤백

---
## 🚀 앱 실행 기본 명령어

### 1. Metro 서버 실행
```bash
npx react-native start
```
> 프로젝트 루트에서 실행하며, JS 번들러 역할을 합니다. 항상 백그라운드에서 켜두세요.

### 2. 안드로이드 앱 실행
```bash
npx react-native run-android
```
> 연결된 Android 기기 또는 에뮬레이터에서 앱을 실행합니다.

### 3. 아이폰(iOS) 앱 실행
```bash
npx react-native run-ios
```
> macOS 환경에서만 실행 가능하며, Xcode 설정 필요


---

## 📱 디바이스/에뮬레이터 설정 방법

### ✅ 안드로이드 에뮬레이터 실행

```bash
emulator -list-avds          # AVD 리스트 출력
emulator -avd [에뮬레이터 이름]  # 에뮬레이터 실행
```

### ✅ iOS 시뮬레이터 실행 (Mac 전용)

```bash
xcrun simctl list devices  # 모든 iOS 기기 리스트 확인
npx react-native run-ios --device "iPhone 14"
```

### ✅ 물리 iOS 기기에서 실행 (Mac 전용)

- Xcode → Devices and Simulators → 본인 iPhone 연결 및 신뢰 설정
- Xcode에서 해당 기기 선택 후 실행 또는
```bash
npx react-native run-ios --device "사용자 아이폰 이름"
```

---

## 📦 npm install 관련 정리

### 기본 명령어
```bash
npm install
```
> `package.json` 기반으로 모든 의존성을 설치합니다.

### 옵션 설명
- `--legacy-peer-deps`: 의존성 충돌이 날 경우 무시하고 강제 설치 (주의 필요)
- `--force`: 강제 설치 (더 위험함, 추천하지 않음)

### 캐시 삭제 및 클린 설치
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 🔄 앱 리로드 방법

### Android
- 개발자 메뉴: `Ctrl + M` (Windows/Linux), `Cmd ⌘ + M` (macOS)
- 또는 `R` 키 두 번 눌러 새로고침

### iOS
- 시뮬레이터 내에서 `Cmd ⌘ + R`

---

## 🧩 폴더 구조

```
src/
├── screens/           # 전체 화면 단위 (ex. HomeScreen.tsx)
├── components/        # 공통 UI 컴포넌트 (ex. CustomButton.tsx)
├── navigation/        # 네비게이션 스택/탭 정의
├── hooks/             # 사용자 정의 훅
├── store/             # Redux/Context 등 상태관리
├── api/               # REST API 호출, axios 정의 등
├── utils/             # 날짜/문자열/포맷 함수들
├── types/             # 공통 타입 정의
├── assets/            # 이미지, 폰트, 아이콘 등
└── App.tsx            # 루트 앱 진입점
```

---

## 🔗 참고 링크
- [React Native 공식문서](https://reactnative.dev)
- [환경설정 가이드](https://reactnative.dev/docs/environment-setup)
- [디버깅 방법](https://reactnative.dev/docs/debugging)
- [iOS 디바이스 설정](https://developer.apple.com)

---

## 📦 원스토어 배포 정보 (Android)

다음 값은 현재 프로젝트의 안드로이드 설정에서 확인된 배포/서명 정보입니다.

- 패키지명(applicationId): `com.busanvibe`
- 버전 정보
  - `versionCode`: `1`  (재업로드 시 반드시 증가 필요)
  - `versionName`: `1.0`
- SDK 타겟
  - `minSdkVersion`: `21`
  - `targetSdkVersion`: `34`
  - `compileSdkVersion`: `34`
- 릴리즈 서명 키
  - keystore 경로: `android/app/busanvibe-release.keystore`
  - key alias: `BusanVibe_release`
  - storePassword: `busanvibern2025A9x3`
  - keyPassword: `busanvibern2025A9x3`
  - 설정 위치:
    - `android/app/build.gradle` → `signingConfigs.release` 가 Gradle 속성 참조
    - `android/gradle.properties` → `MYAPP_UPLOAD_*` 값 지정
- 디버그 키(참고)
  - keystore: `android/app/debug.keystore`
  - alias: `androiddebugkey` / password: `android`

### 서명 지문 확인 (필요 시)
```bash
keytool -list -v -keystore android\app\busanvibe-release.keystore -alias BusanVibe_release
```

### 릴리즈 빌드 (APK)
```bash
cd android
./gradlew clean
./gradlew assembleRelease
# 산출물: app/build/outputs/apk/release/app-release.apk
```
