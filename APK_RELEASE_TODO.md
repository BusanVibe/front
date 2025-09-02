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

## ⚙️ Gradle 서명 설정

`android/gradle.properties` (릴리즈 서명 키 경로/정보):
```properties
MYAPP_UPLOAD_STORE_FILE=busanvibe-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=BusanVibe_release
MYAPP_UPLOAD_STORE_PASSWORD=busanvibern2025A9x3
MYAPP_UPLOAD_KEY_PASSWORD=busanvibern2025A9x3
```

`android/app/build.gradle` (릴리즈 서명 적용):
```groovy
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
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

3) 산출물 확인 (PowerShell)
```powershell
Get-ChildItem -Path 'C:\Users\yoyo2\_code\BusanVibe\android\app\build\outputs\apk\release' -Filter '*.apk' \
  | Select-Object Name,Length,FullName | Format-Table -AutoSize
```

빌드 결과:
- 파일: `android/app/build/outputs/apk/release/app-release.apk`
- 크기: 약 34.2MB

4) 설치 테스트(선택)
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 📦 AAB 생성(원스토어/스토어 배포 권장)

```bash
cd android
./gradlew bundleRelease
```
- 산출물: `android/app/build/outputs/bundle/release/app-release.aab`
- 버전 업데이트 시 `versionCode` 증가 필수 (`android/app/build.gradle > defaultConfig`)

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


