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
  checkTokenExpiry: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 토큰 유효시간 (600분)
  const TOKEN_EXPIRY_TIME = 600 * 60 * 1000; // 600분 x 60초 x 1000밀리초로 변환

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    let tokenCheckInterval: NodeJS.Timeout | null = null;

    if (user) {
      // 로그인된 상태에서만 토큰 만료 확인 (1분마다)
      tokenCheckInterval = setInterval(() => {
        if (!checkTokenExpiry()) {
          console.log('토큰이 만료되었습니다. 자동 로그아웃을 실행합니다.');
          handleTokenExpiry();
        }
      }, 60 * 1000); // 1분마다 체크
    }

    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [user]);

  const loadStoredAuth = async () => {
    try {
      console.log('=== 저장된 인증 정보 로드 시작 ===');

      // AsyncStorage에서 사용자 정보 가져오기
      const userDataString = await AsyncStorage.getItem('userData');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const tokenIssuedAtString = await AsyncStorage.getItem('tokenIssuedAt');

      console.log('AsyncStorage 사용자 데이터 존재:', !!userDataString);
      console.log('AsyncStorage 토큰 존재:', !!accessToken, !!refreshToken);
      console.log('AsyncStorage 토큰 발급시간 존재:', !!tokenIssuedAtString);

      if (userDataString && accessToken && refreshToken && tokenIssuedAtString) {
        const userData = JSON.parse(userDataString);
        const tokenIssuedAt = parseInt(tokenIssuedAtString, 10);

        const user = {
          ...userData,
          accessToken,
          refreshToken,
          tokenIssuedAt,
        };

        console.log('저장된 사용자 정보 로드 성공:', {
          id: user.id,
          email: user.email,
          hasAccessToken: !!user.accessToken,
          hasRefreshToken: !!user.refreshToken,
          tokenIssuedAt: new Date(user.tokenIssuedAt).toISOString()
        });

        // 토큰 만료 확인
        if (checkTokenExpiryForUser(user)) {
          console.log('저장된 토큰이 유효합니다.');
          setUser(user);
        } else {
          console.log('저장된 토큰이 만료되었습니다. 저장된 데이터를 삭제합니다.');
          await AsyncStorage.multiRemove(['userData', 'accessToken', 'refreshToken', 'tokenIssuedAt']);
          setUser(null);
        }
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

      // AsyncStorage에 모든 정보 저장 (토큰 발급 시간 포함)
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: userData.id,
        email: userData.email,
      }));
      await AsyncStorage.setItem('accessToken', userData.accessToken);
      await AsyncStorage.setItem('refreshToken', userData.refreshToken);
      await AsyncStorage.setItem('tokenIssuedAt', userData.tokenIssuedAt.toString());

      console.log('로그인 정보 저장 완료 (토큰 발급시간 포함):', {
        tokenIssuedAt: new Date(userData.tokenIssuedAt).toISOString()
      });
      setUser(userData);
    } catch (error) {
      console.error('로그인 정보 저장 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('로그아웃 시작');

      // AsyncStorage에서 모든 정보 삭제 (토큰 발급시간 포함)
      await AsyncStorage.multiRemove(['userData', 'accessToken', 'refreshToken', 'tokenIssuedAt']);

      console.log('로그아웃 완료');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  // 토큰 유효성 검사 함수 (현재 사용자용)
  const checkTokenExpiry = (): boolean => {
    if (!user) return false;
    return checkTokenExpiryForUser(user);
  };

  // 토큰 유효성 검사 함수 (특정 사용자용)
  const checkTokenExpiryForUser = (userToCheck: User): boolean => {
    if (!userToCheck.tokenIssuedAt) {
      console.log('토큰 발급 시간이 없습니다.');
      return false;
    }

    const currentTime = Date.now();
    const tokenAge = currentTime - userToCheck.tokenIssuedAt;
    const isValid = tokenAge < TOKEN_EXPIRY_TIME;
    const remainingMinutes = Math.floor((TOKEN_EXPIRY_TIME - tokenAge) / (60 * 1000));

    console.log('토큰 유효성 검사:', {
      tokenIssuedAt: new Date(userToCheck.tokenIssuedAt).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      tokenAgeMinutes: Math.floor(tokenAge / (60 * 1000)),
      maxAgeMinutes: TOKEN_EXPIRY_TIME / (60 * 1000),
      remainingMinutes: isValid ? remainingMinutes : 0,
      isValid
    });

    return isValid;
  };

  // 토큰 만료 시 처리 함수
  const handleTokenExpiry = async () => {
    try {
      console.log('=== 토큰 만료로 인한 자동 로그아웃 ===');
      await logout();
    } catch (error) {
      console.error('토큰 만료 처리 중 오류:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    checkTokenExpiry,
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