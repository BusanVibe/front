# 부산스럽다
> 실시간 혼잡도 데이터를 기반으로 관광지·맛집·문화시설·축제 정보를 제공하는 부산 지역 특화 관광서비스

![이미지 2025  9  23  오전 11 19 (9)](https://github.com/user-attachments/assets/51feb411-58e6-48af-8c96-2f962d8dc4f9)

<img width="7680" height="4320" alt="2" src="https://github.com/user-attachments/assets/2ee8dd2d-27d3-4af4-86f0-a1737c1013f9" />
<img width="7680" height="4320" alt="3" src="https://github.com/user-attachments/assets/27cfc940-df36-4e36-9112-c16da3340f47" />
<img width="7680" height="4320" alt="4" src="https://github.com/user-attachments/assets/833c40fb-6677-47bc-9e7d-a47e64828af3" />

![이미지 2025  9  23  오전 11 19 (3)](https://github.com/user-attachments/assets/f06f8cb0-372b-4fac-8020-6f05fe8d822d)

<img width="7680" height="4320" alt="5" src="https://github.com/user-attachments/assets/e29dc6d8-2a03-491f-99f0-a8b0432b9654" />
<img width="7680" height="4320" alt="6" src="https://github.com/user-attachments/assets/49fc07f3-4aba-4fe4-954f-a0b3b567eb9c" />
<img width="7680" height="4320" alt="7" src="https://github.com/user-attachments/assets/2511a16a-73b3-43a6-9c2c-76d291e0e02d" />
<img width="7680" height="4320" alt="8" src="https://github.com/user-attachments/assets/db68cf4d-c89c-4202-bd51-54de951b5146" />
<img width="7680" height="4320" alt="9" src="https://github.com/user-attachments/assets/a397bad6-3a34-41f1-8687-17e1702e04f5" />
<img width="7680" height="4320" alt="10" src="https://github.com/user-attachments/assets/57990025-c244-4f06-beaf-d8de91068016" />
<img width="7680" height="4320" alt="11" src="https://github.com/user-attachments/assets/6e32fdc3-7f97-4f12-814d-087e0e5ccecd" />
<img width="7680" height="4320" alt="12" src="https://github.com/user-attachments/assets/5d441d96-c1cc-4a5c-85a9-f0eb9a568b9d" />
<img width="7680" height="4320" alt="13" src="https://github.com/user-attachments/assets/db3260f5-214c-419b-963c-385e675aa644" />
<img width="7680" height="4320" alt="14" src="https://github.com/user-attachments/assets/a34852e0-6d7b-4b98-89db-bc375d5ae2d4" />
<img width="7680" height="4320" alt="15" src="https://github.com/user-attachments/assets/3877384e-88ec-4bea-9cbd-776e4ec2eaba" />
<img width="7680" height="4320" alt="9" src="https://github.com/user-attachments/assets/897e9f51-5c72-407c-ac52-d4f551e0dddd" />
<img width="7680" height="4320" alt="16" src="https://github.com/user-attachments/assets/c30e6eae-6017-48c4-8176-a070ef6bbc03" />
<img width="7680" height="4320" alt="17" src="https://github.com/user-attachments/assets/9b3291fc-0478-4e6b-acf3-24bf1bbc96b3" />


## 🖥️ 시연 영상

[![시연 영상](https://img.youtube.com/vi/gIAk3Fj_dK4/0.jpg)](https://youtube.com/shorts/gIAk3Fj_dK4)

<br />

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | React Native 0.73 |
| **Language** | TypeScript |
| **Navigation** | React Navigation (Stack, Bottom Tabs) |
| **State Management** | Context API, AsyncStorage |
| **Animation** | React Native Reanimated, Lottie |
| **Real-time** | STOMP.js, SockJS (WebSocket) |
| **Authentication** | Kakao OAuth, React Native Keychain |
| **UI Components** | React Native SVG, Linear Gradient |

<br />


## 📂 프로젝트 구조

```
src/
├── screens/           # 화면 컴포넌트
│   ├── HomeScreen.tsx           # 홈 화면
│   ├── CongestionScreen.tsx     # 혼잡도 화면
│   ├── BusanTalkScreen.tsx      # 실시간 채팅
│   ├── AttractionScreen.tsx     # 관광지 목록
│   ├── FestivalScreen.tsx       # 축제 정보
│   ├── PlaceDetailScreen.tsx    # 장소 상세
│   └── ...
├── components/        # 재사용 컴포넌트
│   ├── common/                  # 공통 UI
│   ├── home/                    # 홈 화면 전용
│   ├── map/                     # 지도 관련
│   └── KakaoLogin.tsx           # 카카오 로그인
├── contexts/          # Context API
│   ├── AuthContext.tsx          # 인증 상태
│   ├── LocationContext.tsx      # 위치 상태
│   ├── LikesContext.tsx         # 즐겨찾기 상태
│   └── ToastContext.tsx         # 토스트 알림
├── services/          # API 서비스
│   ├── authService.ts           # 인증 API
│   ├── chatSocket.ts            # WebSocket 연결
│   ├── placeService.ts          # 장소 API
│   └── ...
├── navigation/        # 네비게이션
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
└── assets/            # 이미지, 아이콘
```

<br />

## 🏗 아키텍처

<img width="2937" height="2667" alt="image" src="https://github.com/user-attachments/assets/c467b469-9e47-410c-ac9b-54daefed32ac" />

<br />
