import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../assets/logo.svg';
import IcHome from '../assets/icon/ic_home.svg';
import IcMap from '../assets/icon/ic_map.svg';
import IcCalendar from '../assets/icon/ic_calendar.svg';
import IcMessage from '../assets/icon/ic_message.svg';
import IcX from '../assets/icon/ic_x.svg';
import CurationComponent from '../components/common/Curation';
import CrowdedPlacesSection from '../components/home/CrowdedPlacesSection';
import AttractionSection from '../components/home/AttractionSection';
import {useLocation} from '../contexts/LocationContext';
import {getHomeData} from '../services/placeService';
import {PlaceListItem} from '../types/place';
import typography from '../styles/typography';
import colors from '../styles/colors';
const banner = require('../assets/banner.png');

type TabParamList = {
  혼잡도: undefined;
  명소: undefined;
  홈: undefined;
  축제: undefined;
  부산톡: undefined;
};

const HomeScreen = () => {
  const [mostCrowdedPlaces, setMostCrowdedPlaces] = useState<PlaceListItem[]>(
    [],
  );
  const [recommendPlaces, setRecommendPlaces] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    userLocation,
    hasLocationPermission,
    refreshLocation,
    ensureFreshLocation,
  } = useLocation();
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<TabParamList>>();

  useEffect(() => {
    loadHomeData();
  }, []);

  // 앱 진입 시 위치를 미리 확보해 거리 계산에 활용
  useEffect(() => {
    ensureFreshLocation(60000).catch(() => {});
  }, [ensureFreshLocation]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const data = await getHomeData();
      setMostCrowdedPlaces(data.mostCrowded);
      setRecommendPlaces(data.recommendPlace);
    } catch (error) {
      console.error('홈 데이터 로드 실패:', error);
      Alert.alert('오류', '홈 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsIntroVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="부산스럽다 소개 보기">
          <Image
            source={banner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.crowdedSection}>
          <CrowdedPlacesSection places={mostCrowdedPlaces} />
        </View>

        <View style={styles.attractionSection}>
          <AttractionSection
            places={recommendPlaces}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isIntroVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsIntroVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsIntroVisible(false)}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="닫기">
              <IcX width={18} height={18} fill="none" stroke="#374151" />
            </TouchableOpacity>
            <LinearGradient
              colors={[colors.secondary[500], colors.secondary[600]]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.modalHeader}>
              <View style={styles.logoBadge}>
                <Logo width={48} height={48} />
              </View>
              <Text style={styles.modalHeaderTitle}>부산스럽다</Text>
              <Text style={styles.modalHeaderSubtitle}>
                지금 가장 즐거운 곳, 가장 붐비는 곳 알려드립니다
              </Text>
            </LinearGradient>

            <View style={styles.modalContent}>
              <View style={styles.featureRow}>
                <IcMap
                  width={18}
                  height={18}
                  fill="none"
                  stroke="#0057cc"
                  color="#0057cc"
                />
                <Text style={styles.featureText}>
                  실시간 혼잡도 기반으로 쾌적한 동선 계획
                </Text>
              </View>
              <View style={styles.featureRow}>
                <IcHome
                  width={18}
                  height={18}
                  fill="none"
                  stroke="#0057cc"
                  color="#0057cc"
                />
                <Text style={styles.featureText}>
                  인기 명소와 주변 추천 장소 한눈에
                </Text>
              </View>
              <View style={styles.featureRow}>
                <IcCalendar
                  width={18}
                  height={18}
                  fill="none"
                  stroke="#0057cc"
                  color="#0057cc"
                />
                <Text style={styles.featureText}>
                  축제 · 행사 일정 간편 확인
                </Text>
              </View>
              <View style={styles.featureRow}>
                <IcMessage
                  width={18}
                  height={18}
                  fill="none"
                  stroke="#0057cc"
                  color="#0057cc"
                />
                <Text style={styles.featureText}>부산톡에서 실시간 소통</Text>
              </View>

              <Text style={styles.modalBody}>
                부산스럽다는 부산 지역의 실시간 혼잡도 기반 서비스입니다. 인기
                명소와 축제, 혼잡도를 한눈에 보고 더 여유로운 여행을 즐겨보세요.
                부산의 다양한 정보를 모아 편리하게 제공해 드리니, 지금 바로
                부산스럽다와 함께 특별한 순간을 시작해 보세요!
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setIsIntroVisible(false);
                  navigation.navigate('혼잡도');
                }}
                style={styles.modalButton}
                accessibilityRole="button"
                accessibilityLabel="시작하기">
                <Text style={styles.modalButtonText}>시작하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannerImage: {
    width: '100%',
    height: 250,
  },
  curationSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  crowdedSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  attractionSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.subHeadingLg,
    color: colors.black,
    marginBottom: 12,
  },
  curationCard: {
    height: 200,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  crowdedCard: {
    height: 120,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attractionCard: {
    height: 80,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginTop: 6,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0057cc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  modalHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitle: {
    ...typography.headingLg,
    color: '#ffffff',
  },
  modalHeaderSubtitle: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    ...typography.bodyLg,
    color: '#111827',
    marginLeft: 8,
  },
});
