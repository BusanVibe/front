import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const MyPageScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      category: '이용안내',
      items: [
        {icon: '✉️', title: '문의하기'},
        {icon: '📄', title: '서비스 이용약관'},
        {icon: '🔒', title: '개인정보 처리방침'},
      ],
    },
    {
      category: '기타',
      items: [
        {icon: '👥', title: '회원 탈퇴'},
        {icon: '🚪', title: '로그아웃'},
      ],
    },
  ];

  const handleMenuPress = (title: string) => {
    console.log(`${title} 메뉴 클릭됨`);
    // 각 메뉴별 기능 구현
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.settingsIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* 사용자 정보 카드 */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>사용자명</Text>
              <Text style={styles.userEmail}>user@example.com</Text>
            </View>
          </View>
        </View>

        {/* 내 좋아요 목록 */}
        <TouchableOpacity style={styles.favoriteSection}>
          <View style={styles.favoriteContent}>
            <Text style={styles.favoriteIcon}>🤍</Text>
            <Text style={styles.favoriteText}>내 좋아요 목록</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* 메뉴 섹션들 */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.title)}>
                <View style={styles.menuContent}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 24,
    color: '#666666',
  },
  userCard: {
    backgroundColor: '#e8f4fd',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    color: '#888888',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#888888',
  },
  favoriteSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  favoriteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  favoriteText: {
    fontSize: 16,
    color: '#000000',
  },
  arrow: {
    fontSize: 20,
    color: '#cccccc',
  },
  menuSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
    color: '#cccccc',
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default MyPageScreen;
