# React Native 릴리즈 APK 빌드 TODO/기록

## 📋 프로젝트/환경 요약

- React Native: 0.73.x
- Android Gradle Plugin: 8.1.4 / Gradle: 8.3
- Java: 17 (jvmTarget 17)
- Hermes: 활성화(hermesEnabled=true)

## 🔐 릴리즈 키스토어 정보

- 파일: `android/app/busanvibe-release.keystore`
- Key alias: `BusanVibe_release`
- Store password: `busanvibern2025A9x3`
- Key password: `busanvibern2025A9x3`

키스토어 생성 명령어:
```bash
cd android
keytool -genkeypair -v \
  -keystore app/busanvibe-release.keystore \
  -alias BusanVibe_release \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass busanvibern2025A9x3 -keypass busanvibern2025A9x3 \
  -dname "CN=BusanVibe, OU=Dev, O=BusanVibe, L=Busan, S=Busan, C=KR" \
  -storetype JKS
```

키스토어 확인(별칭 조회) 예시:
```bash
cd android
keytool -list -v -keystore app/busanvibe-release.keystore -storepass busanvibern2025A9x3
```

주의사항:
- 실제 운영 비밀번호/키는 외부 유출 금지. 레포 공개 금지 및 비밀 관리(예: 사내 비밀 저장소) 권장.

### ❗️서명/키스토어 일관성 (중요)
- 릴리즈 키스토어는 파일 단위로 고유하며, 같은 alias/비밀번호로 “새로 생성”해도 내부 키 재료는 랜덤하게 달라집니다.
- 따라서 다른 사람이 동일한 값으로 새로운 키스토어를 생성하면 기존 배포 앱의 서명과 달라집니다.
- 결과적으로 스토어/사용자 단말에서 기존 앱 위에 업데이트 설치가 불가하며, 배포 라인이 분리됩니다.
- 반드시 “공유된 원본 키스토어 파일(app/busanvibe-release.keystore)”을 사용해 빌드/배포하세요. (새로 만들지 말 것)

## ⚙️ Gradle 서명 설정

`android/gradle.properties` (릴리즈 서명 키 경로/정보):
```properties
MYAPP_UPLOAD_STORE_FILE=busanvibe-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=BusanVibe_release
MYAPP_UPLOAD_STORE_PASSWORD=busanvibern2025A9x3
MYAPP_UPLOAD_KEY_PASSWORD=busanvibern2025A9x3
```


## 🚀 릴리즈 APK 빌드 절차 (실제 수행 내역)

1) 의존성/정리
```bash
npm install
cd android && ./gradlew clean
```

2) 릴리즈 APK 빌드
```bash
cd android
./gradlew assembleRelease
```

1) 산출물 확인
```
~BusanVibe\android\app\build\outputs\apk\release  폴더 확인
```

빌드 결과:
- 파일: `android/app/build/outputs/apk/release/app-release.apk`
- 크기: 약 34.2MB

4) 설치 테스트(선택)
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### 📚 단계별 상세 설명
1) 의존성 설치: `npm install` (프로젝트 루트)
2) 정리: `cd android && ./gradlew clean`
3) 서명 구성 확인:
   - `android/gradle.properties`에 `MYAPP_UPLOAD_*` 존재
   - `android/app/build.gradle`의 `signingConfigs.release`가 해당 값을 사용
4) 버전 관리: `android/app/build.gradle`의 `defaultConfig.versionCode` 증가, `versionName` 갱신
5) 빌드: `./gradlew assembleRelease` (RN 0.73는 JS 번들/에셋을 자동 포함)
6) 산출물 확인: `android/app/build/outputs/apk/release/app-release.apk`
7) 설치/실행: `adb install -r .../app-release.apk`

참고: 만약 CI에서 `ANDROID_SDK_ROOT` 또는 `JAVA_HOME`이 비어 있으면 빌드 실패가 납니다. 반드시 런너/에이전트 환경에 설정하세요.

## 📦 AAB 생성(원스토어/스토어 배포 권장)

```bash
cd android
./gradlew bundleRelease
```
- 산출물: `android/app/build/outputs/bundle/release/app-release.aab`
- 버전 업데이트 시 `versionCode` 증가 필수 (`android/app/build.gradle > defaultConfig`)

## 🔢 버전 관리 위치 (android/app/build.gradle)
- 배포용 APK/AAB의 버전 관리는 `android/app/build.gradle`의 `defaultConfig`에서 합니다.
- `versionCode`: 정수. 스토어에 올릴 때마다 반드시 증가해야 하며, 낮거나 동일하면 업로드/배포가 거절됩니다.
- `versionName`: 사람이 읽는 버전(예: 1.2.0). 필요에 따라 갱신합니다.

예시:
```groovy
android {
    defaultConfig {
        applicationId "com.busanvibe"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 42        // ← 릴리즈 때마다 +1 필수
        versionName "1.5.0"   // ← 가독용(semver 권장)
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

팁:
- 내부 테스트 용도라도 스토어/OTA 배포를 한다면 `versionCode`는 반드시 증가시키세요.
- `versionName`은 마이너 수정 시 유지 가능하지만, 배포 이력 파악을 위해 함께 갱신하는 것을 권장합니다.

## ✅ 릴리즈 APK 기본 동작 검증 체크리스트
- [ ] 앱 설치/실행 가능, 스플래시/홈 진입 정상
- [ ] 네트워크 기능 호출(예: 로그인/리스트 조회) 정상, SSL 핸드셰이크 오류 없음
- [ ] 권한 요청(위치/알림 등) 동작 및 승인 후 기능 정상
- [ ] 주요 화면 전환/탭 이동/뒤로가기 정상
- [ ] 이미지/폰트/아이콘 리소스 깨짐 없음
- [ ] 크래시 로그 없음(`adb logcat`으로 런타임 오류 확인)
- [ ] 빌드 버전 정보: 앱 설정 화면에서 `versionName`, 설치 후 `versionCode` 증가 확인

## ❗️문제 해결 메모

- keystore password incorrect 발생 시:
  - `gradle.properties`의 `MYAPP_UPLOAD_*` 값 확인
  - 키스토어 파일 경로/파일명 확인 (`busanvibe-release.keystore`)
  - 필요시 새 키스토어 생성 후 값 갱신
- Manifest namespace 경고: 써드파티 라이브러리 Manifest의 `package` 속성 안내 경고는 빌드 차단 아님

## ✅ 체크리스트

- [x] 릴리즈 키스토어 생성 및 보관
- [x] Gradle 서명 설정 완료
- [x] `assembleRelease` 성공 및 APK 산출물 확인
- [x] 필요 시 `bundleRelease`로 AAB 생성 준비


