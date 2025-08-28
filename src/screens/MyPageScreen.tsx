/**
 * 마이페이지 화면
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import IcUserCircle from '../assets/icon/ic_user_circle.svg';

const MyPageScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: authUser, logout } = useAuth();

  const handleInquiry = () => {
    const email = 'psh2968@naver.com';
    const subject = '문의사항';
    const body = '안녕하세요.\n\n문의사항을 작성해주세요.';
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('알림', '관리자에게 이메일을 보내주세요.\n\n이메일: psh2968@naver.com');
        }
      })
      .catch((err) => {
        console.error('이메일 앱 열기 실패:', err);
        Alert.alert('알림', '관리자에게 이메일을 보내주세요.\n\n이메일: psh2968@naver.com');
      });
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== 로그아웃 시작 ===');
              console.log('현재 사용자:', authUser?.email);
              
              // AuthContext의 logout 함수 사용
              await logout();
              
              console.log('=== 로그아웃 완료 ===');
              Alert.alert('알림', '로그아웃되었습니다.');
              
              // AuthContext 상태가 변경되면 App.tsx에서 자동으로 로그인 화면으로 이동
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <View style={styles.headerProfileIcon}>
            <IcUserCircle width={24} height={24} />
          </View>
        </View>

        {/* 사용자 정보 */}
        <View style={styles.userSection}>
          <View style={styles.profileIcon}>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>사용자명</Text>
            <Text style={styles.userEmail}>{authUser?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* 내 좋아요 목록 */}
        <TouchableOpacity 
          style={styles.favoriteSection}
          onPress={() => navigation.navigate('FavoriteList' as never)}
        >
          <View style={styles.favoriteIcon}>
            <Text style={styles.favoriteIconText}>❤️</Text>
          </View>
          <Text style={styles.favoriteText}>내 좋아요 목록</Text>
          <Text style={styles.favoriteArrow}>›</Text>
        </TouchableOpacity>

        {/* 이용안내 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>이용안내</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleInquiry}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📧</Text>
            </View>
            <Text style={styles.menuText}>문의하기</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('TermsOfService' as never)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📄</Text>
            </View>
            <Text style={styles.menuText}>서비스 이용약관</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔒</Text>
            </View>
            <Text style={styles.menuText}>개인정보 처리방침</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 기타 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>기타</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👥</Text>
            </View>
            <Text style={styles.menuText}>회원 탈퇴</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📱</Text>
            </View>
            <Text style={styles.menuText}>로그아웃</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerProfileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    backgroundColor: '#D1E2F8',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c8c8c8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileIconText: {
    fontSize: 32,
    color: '#888',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  favoriteSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteIconText: {
    fontSize: 20,
  },
  favoriteText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  favoriteArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

export default MyPageScreen;