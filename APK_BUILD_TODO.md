# React Native APK 빌드 TODO 리스트

## 📋 현재 프로젝트 상태

- ✅ React Native 0.73.0 프로젝트 확인됨
- ✅ Android 빌드 설정 확인됨
- ✅ 기본 의존성 설치됨

## 🔧 APK 빌드 준비 작업

### 1. 환경 설정 확인

- ✅ Android Studio 설치 확인
- ✅ Android SDK 설치 확인 (C:\Users\~~\AppData\Local\Android\Sdk)
- ✅ Java JDK 20 설치 확인
- ✅ 환경 변수 설정 확인 (ANDROID_HOME, JAVA_HOME)

### 2. 프로젝트 설정

- ✅ 의존성 설치 (`npm install`)
- ✅ Android 의존성 설치 (`cd android && ./gradlew clean`)
- ✅ Metro 서버 시작 확인

### 3. 릴리즈 빌드 설정

- ⚠️ 릴리즈 키스토어 생성 (프로덕션용) - 현재 debug 키스토어 사용 중
- ✅ build.gradle 릴리즈 설정 업데이트
- ✅ ProGuard 설정 (선택사항)

### 4. APK 빌드 실행

- ✅ Debug APK 빌드 (`./gradlew assembleDebug`) - 성공 (61.6MB)
- ✅ Release APK 빌드 (`./gradlew assembleRelease`) - 성공 (34.2MB)
- ✅ APK 파일 위치 확인

### 5. 테스트 및 배포

- [ ] APK 설치 테스트
- [ ] 기능 동작 확인
- [ ] 성능 확인

## 📱 예상 APK 위치

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## ⚠️ 주의사항

- 현재 릴리즈 빌드가 debug 키스토어를 사용하도록 설정됨
- 프로덕션 배포시 별도 키스토어 생성 필요

## 🎉

빌드 완료 결과

### 생성된 APK 파일들

1. **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`

   - 크기: 61.6MB
   - 용도: 개발 및 테스트용
   - 디버깅 정보 포함

2. **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
   - 크기: 34.2MB
   - 용도: 배포용 (최적화됨)
   - 코드 압축 및 최적화 적용

### 다음 단계

1. **APK 테스트**: Android 기기에 설치하여 동작 확인
2. **프로덕션 키스토어**: 실제 배포시 별도 키스토어 생성 필요
3. **Google Play Store 업로드**: AAB 형식으로 변환 권장

## 🛠️ 실제 사용한 명령어와 빌드 과정

### 1단계: 환경 확인

```bash
# Java 버전 확인
java -version
# 결과: Java 20.0.2 확인됨

# Android SDK 경로 확인 (PowerShell)
echo $env:ANDROID_HOME
# 결과: C:\Users\~~\AppData\Local\Android\Sdk
```

### 2단계: 프로젝트 의존성 설치

```bash
# Node.js 의존성 설치
npm install
# 결과: 991개 패키지 설치 완료, 5개 보안 취약점 발견
```

### 3단계: Android 프로젝트 정리

```bash
# Android 디렉토리로 이동하여 Gradle 캐시 정리
cd android
./gradlew clean
# 결과: BUILD SUCCESSFUL in 20s (20개 작업 실행)
```

### 4단계: Debug APK 빌드

```bash
# Debug APK 빌드 실행
cd android
./gradlew assembleDebug
# 결과: BUILD SUCCESSFUL in 2m 53s (363개 작업 실행)
# 생성된 파일: android/app/build/outputs/apk/debug/app-debug.apk (61.6MB)
```

### 5단계: Release APK 빌드

```bash
# Release APK 빌드 실행
cd android
./gradlew assembleRelease
# 결과: BUILD SUCCESSFUL in 4m 20s (441개 작업 실행)
# 생성된 파일: android/app/build/outputs/apk/release/app-release.apk (34.2MB)
```

### 6단계: 빌드 결과 확인

```bash
# APK 파일 목록 확인 (PowerShell)
Get-ChildItem "android/app/build/outputs/apk" -Recurse -Filter "*.apk" | Select-Object Name, Length, FullName | Format-Table -AutoSize
# 결과: Debug APK (61,568,537 bytes), Release APK (34,195,007 bytes)
```

## 📝 각 명령어 설명

### `java -version`

- **목적**: 설치된 Java 버전 확인
- **필요성**: React Native Android 빌드에는 Java가 필수

### `echo $env:ANDROID_HOME`

- **목적**: Android SDK 경로 확인
- **필요성**: Gradle이 Android SDK를 찾기 위해 필요

### `npm install`

- **목적**: package.json에 정의된 Node.js 의존성 설치
- **포함**: React Native, 네이티브 모듈, 개발 도구 등

### `./gradlew clean`

- **목적**: 이전 빌드 결과물 및 캐시 정리
- **효과**: 깨끗한 상태에서 빌드 시작, 빌드 오류 방지

### `./gradlew assembleDebug`

- **목적**: 개발용 Debug APK 생성
- **특징**:
  - 디버깅 정보 포함
  - 코드 압축 없음
  - 빠른 빌드 시간
  - 큰 파일 크기

### `./gradlew assembleRelease`

- **목적**: 배포용 Release APK 생성
- **특징**:
  - 코드 압축 및 최적화
  - ProGuard/R8 적용
  - 작은 파일 크기
  - 긴 빌드 시간

## 🔧 추가 유용한 명령어들

```bash
# APK 설치 (ADB 필요)
adb install android/app/build/outputs/apk/release/app-release.apk

# AAB 빌드 (Google Play Store용)
cd android && ./gradlew bundleRelease

# 빌드 정리
cd android && ./gradlew clean

# 모든 빌드 변형 확인
cd android && ./gradlew tasks --all

# 빌드 의존성 확인
cd android && ./gradlew dependencies

# APK 분석 (크기, 구성 요소)
cd android && ./gradlew analyzeReleaseBundle
```

## ⚡ 빌드 최적화 팁

1. **빌드 시간 단축**:

   ```bash
   # Gradle 데몬 사용
   echo "org.gradle.daemon=true" >> android/gradle.properties

   # 병렬 빌드 활성화
   echo "org.gradle.parallel=true" >> android/gradle.properties
   ```

2. **APK 크기 줄이기**:

   - ProGuard/R8 활성화 (이미 적용됨)
   - 사용하지 않는 리소스 제거
   - APK 분할 (ABI별)

3. **빌드 오류 해결**:

   ```bash
   # 캐시 완전 정리
   cd android && ./gradlew clean
   rm -rf node_modules && npm install

   # Metro 캐시 정리
   npx react-native start --reset-cache
   ```
