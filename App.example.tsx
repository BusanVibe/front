/**
 * 메인 App 컴포넌트 예시
 * 실제 App.tsx에 이 내용을 적용하세요
 */

import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { SimpleAppNavigator } from './src/components/SimpleAppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SimpleAppNavigator />
    </AuthProvider>
  );
}