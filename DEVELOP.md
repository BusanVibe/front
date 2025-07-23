리액트 네이티브(React Native) 프로젝트에서 **자주 사용되는 `gradlew`, `npx`, `npm/yarn` 명령어들**을 카테고리별로 정리해드릴게요.

---

## 📦 기본 프로젝트 초기화 관련

| 명령어                            | 설명                             |
| ------------------------------ | ------------------------------ |
| `npx react-native init MyApp`  | 새로운 React Native 프로젝트 생성       |
| `npm install` / `yarn install` | `package.json` 기반으로 패키지 설치     |
| `npx react-native upgrade`     | 현재 프로젝트의 React Native 버전 업그레이드 |

---

## 🧹 Gradle / 빌드 관련 명령어 (`android/` 디렉토리 내)

| 명령어                         | 설명                              |
| --------------------------- | ------------------------------- |
| `./gradlew clean`           | Gradle 빌드 캐시 정리 (build 디렉토리 삭제) |
| `./gradlew build`           | 전체 앱 빌드 수행 (APK 생성 포함)          |
| `./gradlew assembleDebug`   | 디버그용 APK만 생성                    |
| `./gradlew assembleRelease` | 릴리즈용 APK 생성                     |
| `./gradlew installDebug`    | 디버그 APK를 에뮬레이터나 기기에 설치          |
| `./gradlew uninstallAll`    | 모든 변형(variant)의 앱 제거            |
| `./gradlew tasks`           | 사용 가능한 gradle task 목록 출력        |
| `./gradlew dependencies`    | 의존성 트리 확인                       |

> ⚠️ `./gradlew`는 **android 폴더 안에서만** 실행해야 합니다.

---

## 📱 앱 실행 및 개발 관련 (`프로젝트 루트`에서)

| 명령어                            | 설명                                            |
| ------------------------------ | --------------------------------------------- |
| `npx react-native run-android` | Android 앱 빌드 및 에뮬레이터에 실행                      |
| `npx react-native run-ios`     | iOS 앱 빌드 및 시뮬레이터에 실행 (Mac 전용)                 |
| `npx react-native start`       | 메트로 번들러(Metro Bundler) 실행                     |
| `npx react-native doctor`      | 환경 설정 문제 점검 도구 실행                             |
| `npx react-native log-android` | Android 로그 출력 (adb logcat)                    |
| `npx react-native log-ios`     | iOS 로그 출력 (Mac 전용)                            |
| `npx react-native clean`       | Metro, Gradle, Watchman 등 캐시 제거 (선택적으로 클린 가능) |

---

## 🧪 디버깅 및 테스트

| 명령어                             | 설명                                     |
| ------------------------------- | -------------------------------------- |
| `adb devices`                   | 연결된 Android 디바이스 목록 출력                 |
| `adb uninstall com.myapp`       | 앱 삭제 (패키지명 기반)                         |
| `adb logcat`                    | Android 로그 출력                          |
| `adb reverse tcp:8081 tcp:8081` | Android 기기와 Metro 번들러 연결 (USB 연결 시 필요) |

---

## 📤 릴리즈 및 배포

| 명령어                         | 설명                                               |
| --------------------------- | ------------------------------------------------ |
| `./gradlew bundleRelease`   | AAB (Android App Bundle) 파일 생성                   |
| `./gradlew assembleRelease` | APK 생성 (`android/app/build/outputs/apk/release`) |
| `cd ios && pod install`     | iOS 라이브러리 설치 (`CocoaPods`)                       |
| `xcodebuild clean`          | Xcode 빌드 클린 (iOS 전용)                             |

---

## 🛠 기타 유용한 명령어

| 명령어                                  | 설명                            |
| ------------------------------------ | ----------------------------- |
| `npm audit`                          | 보안 취약점 점검                     |
| `npm audit fix`                      | 자동으로 보안 이슈 패치                 |
| `watchman watch-del-all`             | Watchman 캐시 초기화 (macOS 환경 주로) |
| `rm -rf node_modules && npm install` | 의존성 초기화 (설정 꼬였을 때)            |

---

## 📁 폴더 기준 요약

| 디렉토리           | 명령어 예시                                        |
| -------------- | --------------------------------------------- |
| **프로젝트 루트**    | `npx react-native run-android`, `npm install` |
| **android/**   | `./gradlew clean`, `./gradlew build`          |
| **ios/** (Mac) | `pod install`, `xcodebuild clean`             |

---

## ✅ 추천 클린 루틴 (환경 꼬였을 때)

```bash
# 루트에서
watchman watch-del-all # (macOS)
rm -rf node_modules
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build
npm install
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

필요하시면 특정 상황(예: APK 추출, 배포 준비 등)에 맞는 명령어만 골라서 정리해드릴 수도 있어요.
원하시면 말씀해주세요! 😊
