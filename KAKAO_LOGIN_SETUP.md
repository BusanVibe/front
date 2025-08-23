# 카카오 로그인 설정 가이드

## 필요한 패키지 설치

```bash
npm install react-native-webview @react-native-async-storage/async-storage
```

또는

```bash
yarn add react-native-webview @react-native-async-storage/async-storage
```

## iOS 설정 (필요한 경우)

```bash
cd ios && pod install
```

## 사용 방법

1. App.tsx에서 AuthProvider로 앱을 감싸기:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';

export default function App() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}
```

2. 다른 컴포넌트에서 인증 상태 사용:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const SomeComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (isAuthenticated) {
    return <Text>안녕하세요, {user?.email}님!</Text>;
  }
  
  return <LoginScreen />;
};
```

## 주요 기능

- 카카오 OAuth 인증
- 토큰 자동 저장/로드
- 인증 상태 전역 관리
- WebView를 통한 안전한 로그인 플로우