import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaceType, PlaceDetail} from '../types/place';
import {RootStackParamList} from '../navigation/RootNavigator';
import {getPlaceDetail, togglePlaceLike} from '../services/placeService';
import CongestionBadge from '../components/common/CongestionBadge';
import colors from '../styles/colors';
import typography from '../styles/typography';
import IcHeart from '../assets/icon/ic_heart.svg';
import IcMapPin from '../assets/icon/ic_map_pin.svg';
import IcClock from '../assets/icon/ic_clock.svg';
import IcCall from '../assets/icon/ic_call.svg';
import IcCalendar from '../assets/icon/ic_calendar.svg';

type PlaceDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlaceDetail'>;
type PlaceDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PlaceDetail'
>;

const PlaceDetailScreen = () => {
  const route = useRoute<PlaceDetailScreenRouteProp>();
  const navigation = useNavigation<PlaceDetailScreenNavigationProp>();
  const {place} = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(place.is_like);
  const [likeAmount, setLikeAmount] = useState(0);
  const [likeStateChanged, setLikeStateChanged] = useState(false);

  useEffect(() => {
    fetchPlaceDetail();
  }, []);

  const fetchPlaceDetail = async () => {
    try {
      setIsLoading(true);
      const detail = await getPlaceDetail(place.id);
      setPlaceDetail(detail);
      setIsLiked(detail.is_like);
      setLikeAmount(detail.like_amount);
    } catch (error) {
      console.error('명소 상세 정보 로드 실패:', error);
      Alert.alert('오류', '명소 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async () => {
    try {
      console.log('=== PlaceDetailScreen 좋아요 처리 시작 ===', place.id);
      const response = await togglePlaceLike(place.id);
      
      if (response.is_success) {
        console.log('=== PlaceDetailScreen 좋아요 처리 성공 ===');
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        setLikeAmount(prev => (newLikeState ? prev + 1 : prev - 1));
        
        setLikeStateChanged(true);
        
        fetchPlaceDetail();
      } else {
        Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('=== PlaceDetailScreen 좋아요 토글 실패 ===', error);
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  const images = Array.isArray(placeDetail?.img)
    ? placeDetail.img.filter(img => img && typeof img === 'string')
    : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!placeDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>데이터를 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        {images.length > 0 && images[currentImageIndex] ? (
          <Image
            source={{uri: images[currentImageIndex]}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>이미지 없음</Text>
          </View>
        )}

        {/* 이미지 인디케이터 */}
        {images.length > 1 && (
          <View style={styles.imageIndicator}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicatorDot,
                  index === currentImageIndex
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
                onPress={() => setCurrentImageIndex(index)}
              />
            ))}
          </View>
        )}

        {/* 좋아요 버튼 */}
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleLike}>
          <IcHeart
            width={24}
            height={24}
            color={isLiked ? colors.red[500] : colors.white}
            fill={isLiked ? colors.red[500] : 'none'}
          />
        </TouchableOpacity>

        {/* 좋아요 수 */}
        <View style={styles.likeCountContainer}>
          <Text style={styles.likeCount}>{likeAmount}</Text>
        </View>
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 장소명과 혼잡도 배지 */}
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.placeName}>{placeDetail.name}</Text>
            {placeDetail.congestion_level &&
              placeDetail.congestion_level > 0 && (
                <CongestionBadge
                  level={placeDetail.congestion_level}
                  style={styles.congestionBadge}
                />
              )}
          </View>
        </View>

        {/* 상세 정보 */}
        <View style={styles.detailsContainer}>
          {/* 운영시간 */}
          {placeDetail.use_time && (
            <View style={styles.detailRow}>
              <IcClock width={16} height={16} color={colors.gray[600]} />
              <Text style={styles.detailText}>{placeDetail.use_time}</Text>
            </View>
          )}

          {/* 위치 */}
          {placeDetail.address && (
            <View style={styles.detailRow}>
              <IcMapPin width={16} height={16} color={colors.gray[600]} />
              <Text style={styles.detailText}>{placeDetail.address}</Text>
              <Text style={styles.expandIcon}>⌄</Text>
            </View>
          )}

          {/* 전화번호 */}
          {placeDetail.phone && (
            <View style={styles.detailRow}>
              <IcCall width={16} height={16} color={colors.gray[600]} />
              <Text style={styles.detailText}>{placeDetail.phone}</Text>
            </View>
          )}

          {/* 휴무일 */}
          {placeDetail.rest_date && (
            <View style={styles.detailRow}>
              <IcCalendar width={16} height={16} color={colors.gray[600]} />
              <Text style={styles.detailText}>{placeDetail.rest_date}</Text>
            </View>
          )}
        </View>

        {/* 소개 섹션 */}
        {placeDetail.introduce && (
          <View style={styles.introSection}>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.description}>
              {placeDetail.introduce}
            </Text>
          </View>
        )}

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.directionButton}>
            <Text style={styles.directionButtonText}>길찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>혼잡도 보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
  },
  errorText: {
    ...typography.bodyLg,
    color: colors.gray[600],
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 18,
    color: colors.white,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 32,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeCountContainer: {
    position: 'absolute',
    top: 68,
    right: 20,
    width: 40,
    alignItems: 'center',
  },
  likeCount: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
    ...typography.headingLg,
    color: colors.gray[900],
  },
  congestionBadge: {
    marginLeft: 0,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rating: {
    ...typography.subHeadingMd,
    color: colors.gray[900],
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 14,
    marginRight: 4,
  },
  reviewCount: {
    ...typography.bodyLg,
    color: colors.gray[600],
  },
  likeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  detailsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconText: {
    fontSize: 16,
    width: 16,
    textAlign: 'center',
  },
  detailText: {
    ...typography.bodyLg,
    color: colors.gray[700],
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: colors.gray[600],
  },
  introSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.subHeadingMd,
    color: colors.gray[900],
    marginBottom: 12,
  },
  description: {
    ...typography.bodyLg,
    color: colors.gray[700],
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  directionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[400],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  directionButtonText: {
    ...typography.subHeadingMd,
    color: colors.gray[700],
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  detailButtonText: {
    ...typography.subHeadingMd,
    color: colors.white,
    fontWeight: '600',
  },
});

export default PlaceDetailScreen;
