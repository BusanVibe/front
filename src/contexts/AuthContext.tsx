/**
 * 인증 상태 관리 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('=== 저장된 인증 정보 로드 시작 ===');
      
      // AsyncStorage에서 사용자 정보 가져오기
      const userDataString = await AsyncStorage.getItem('userData');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      console.log('AsyncStorage 사용자 데이터 존재:', !!userDataString);
      console.log('AsyncStorage 토큰 존재:', !!accessToken, !!refreshToken);

      if (userDataString && accessToken && refreshToken) {
        const userData = JSON.parse(userDataString);
        const user = {
          ...userData,
          accessToken,
          refreshToken,
        };
        
        console.log('저장된 사용자 정보 로드 성공:', { 
          id: user.id, 
          email: user.email,
          hasAccessToken: !!user.accessToken,
          hasRefreshToken: !!user.refreshToken
        });
        setUser(user);
      } else {
        console.log('저장된 인증 정보 없음 - 로그인 필요');
      }
    } catch (error) {
      console.error('저장된 인증 정보 로드 실패:', error);
    } finally {
      console.log('=== 인증 정보 로드 완료, 로딩 상태 해제 ===');
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      console.log('로그인 정보 저장 시작:', { id: userData.id, email: userData.email });
      
      // AsyncStorage에 모든 정보 저장
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: userData.id,
        email: userData.email,
      }));
      await AsyncStorage.setItem('accessToken', userData.accessToken);
      await AsyncStorage.setItem('refreshToken', userData.refreshToken);
      
      console.log('로그인 정보 저장 완료');
      setUser(userData);
    } catch (error) {
      console.error('로그인 정보 저장 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('로그아웃 시작');
      
      // AsyncStorage에서 모든 정보 삭제
      await AsyncStorage.multiRemove(['userData', 'accessToken', 'refreshToken']);
      
      console.log('로그아웃 완료');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};