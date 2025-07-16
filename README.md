# React Native 프로젝트 가이드

이 프로젝트는 [`@react-native-community/cli`](https://github.com/react-native-community/cli)를 통해 생성된 [**React Native**](https://reactnative.dev) 기반 프로젝트입니다.
- [React Native 환경 구성 가이드](https://reactnative.dev/docs/environment-setup)를 참고해 Node, JDK, Android Studio, Xcode 등을 사전에 설치해 주세요.

---

## ✅ Android Emulator 설치 및 사용 방법 (Windows & macOS 공통)

### 1. **Android Studio 설치**

* 공식 사이트: [https://developer.android.com/studio](https://developer.android.com/studio)
* 운영체제에 맞게 다운로드 후 설치

---

### 2. **Android SDK & Emulator 설치**

Android Studio 설치 후 처음 실행 시, 다음과 같은 컴포넌트 설치 유무를 확인하거나 수동 설치 가능:

* Android SDK
* Android SDK Platform-tools
* Android Emulator
* Intel HAXM (Windows) / Apple Hypervisor Framework (macOS)
* AVD Manager

> 설치 유무 확인:
> `Android Studio → More Actions → SDK Manager → SDK Tools 탭`
> `Android Emulator` 체크되어 있어야 함

---

### 3. **AVD(가상 디바이스) 생성 방법**

**Android Studio GUI 사용**

1. Android Studio 실행
2. `More Actions → Virtual Device Manager` 클릭
3. `+ Create Device` 버튼 클릭
4. 원하는 기기 선택 (예: Pixel 6)
5. 사용할 Android 버전 선택 (예: Android 13.0)
6. 이름 지정 후 `Finish`

---

## ✅ 에뮬레이터 실행

### ▶ GUI로 실행:

* Android Studio → Virtual Device Manager → `▶` 아이콘 클릭

### ▶ CLI (명령어)로 실행:

```bash
emulator -avd <AVD_NAME>
```

> 예: `emulator -avd Pixel_6_API_33`

---

## 🔧 SDK 경로 (중요)

* **Windows**: `C:\Users\<username>\AppData\Local\Android\Sdk`
* **macOS**: `~/Library/Android/sdk`

환경변수 등록 시:

```bash
# Windows (PowerShell 또는 환경변수 설정)
setx ANDROID_HOME "C:\Users\<username>\AppData\Local\Android\Sdk"

# macOS (zsh)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
```

---
---
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

## 🛠 기타 명령어 정리

| 기능 | 명령어 |
|------|--------|
| Metro 서버 시작 | `npx react-native start` |
| Android 실행 | `npx react-native run-android` |
| iOS 실행 | `npx react-native run-ios` |
| 기기 목록 확인 (Android) | `adb devices` |
| iOS 기기 목록 확인 | `xcrun simctl list devices` |
| 앱 종료 (iOS 시뮬레이터) | `Cmd + Q` 또는 시뮬레이터 창 닫기 |

---

## ✅ React Native 개발 시 코드 구성 단위

| 단위 | 설명 | 예시 폴더명 |
|------|------|-------------|
| **Screen** | 하나의 전체 화면(페이지) | `screens/` |
| **Component** | 여러 Screen에서 재사용되는 UI 블록 | `components/` |
| **Navigation** | 스택/탭 구조 정의 | `navigation/` |
| **Hooks** | 커스텀 로직 (상태/비즈니스) | `hooks/` |
| **Context / Store** | 전역 상태 관리 (Redux, Context API 등) | `store/`, `contexts/` |
| **Assets** | 이미지, 폰트 등 정적 자원 | `assets/` |
| **Utils** | 날짜 처리, 숫자 포맷 등 유틸 함수 | `utils/` |
| **Types** | TypeScript 인터페이스/타입 정의 | `types/` |
| **Services / API** | 서버 통신, 로컬 DB 등 외부 의존성 | `api/`, `services/` |

---

## 📝 React 와의 차이

| 항목 | React (Web) | React Native |
|------|-------------|--------------|
| **단위** | page, component | screen, component |
| **라우팅** | React Router | React Navigation (Stack/Tab/Drawer) |
| **스타일** | CSS/SASS/Styled-components 등 | StyleSheet / Tailwind-like utility libraries |
| **자원** | 이미지, SVG 등 웹 static | 로컬 이미지, 폰트, .ttf 등 직접 import 필요 |

---

## 🧩 기본 폴더 구조 예시

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



## 🎉 축하합니다!

React Native 프로젝트가 성공적으로 실행되었고, 디바이스 연결 및 앱 개발을 위한 환경이 갖추어졌습니다. 다음 단계로는 컴포넌트 개발, API 연동, 네비게이션 구성 등을 확장할 수 있습니다.


---

## 🔗 참고 링크
- [React Native 공식문서](https://reactnative.dev)
- [환경설정 가이드](https://reactnative.dev/docs/environment-setup)
- [디버깅 방법](https://reactnative.dev/docs/debugging)
- [iOS 디바이스 설정](https://developer.apple.com)
