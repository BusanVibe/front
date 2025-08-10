/**
 * 앱 네비게이터 - 로그인 상태에 따른 화면 분기
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { MyPageScreen } from '../screens/MyPageScreen';

// 임시 홈 화면 컴포넌트
const HomeScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <View style={styles.homeContainer}>
      <Text style={styles.welcomeText}>BusanVibe</Text>
      <Text style={styles.subtitle}>부산의 모든 것을 경험하세요</Text>
      <Text style={styles.userInfo}>환영합니다, {user?.email}님!</Text>
      <Text style={styles.userInfo}>사용자 ID: {user?.id}</Text>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>홈 화면 콘텐츠는</Text>
        <Text style={styles.comingSoonText}>곧 업데이트 예정입니다!</Text>
      </View>
    </View>
  );
};

// 메인 탭 네비게이터
const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'mypage'>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'mypage':
        return <MyPageScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.tabContainer}>
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* 하단 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabIcon]}>🏠</Text>
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'mypage' && styles.activeTabItem]}
          onPress={() => setActiveTab('mypage')}
        >
          <Text style={[styles.tabIcon, activeTab === 'mypage' && styles.activeTabIcon]}>👤</Text>
          <Text style={[styles.tabText, activeTab === 'mypage' && styles.activeTabText]}>마이페이지</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('AppNavigator 상태:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    userEmail: user?.email
  });

  // 로딩 중일 때
  if (isLoading) {
    console.log('로딩 중...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 로그인 상태에 따른 화면 분기
  if (isAuthenticated) {
    console.log('인증됨 - 메인 앱 표시, 사용자:', user?.email);
    return <MainTabNavigator />;
  } else {
    console.log('인증되지 않음 - 로그인화면 표시');
    return <LoginScreen />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  comingSoon: {
    marginTop: 50,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabItem: {
    // 활성 탭 스타일은 텍스트/아이콘 색상으로만 구분
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#999',
  },
  activeTabIcon: {
    color: '#2196f3',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
  },
  activeTabText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
});