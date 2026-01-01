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
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaceType, PlaceDetail} from '../types/place';
import {RootStackParamList} from '../navigation/RootNavigator';
import {getPlaceDetail} from '../services/placeService';
import {useLikes} from '../contexts/LikesContext';
import CongestionBadge from '../components/common/CongestionBadge';
import colors from '../styles/colors';
import typography from '../styles/typography';
import IcHeart from '../assets/icon/ic_heart.svg';
import IcMapPin from '../assets/icon/ic_map_pin.svg';
import IcClock from '../assets/icon/ic_clock.svg';
import IcCall from '../assets/icon/ic_call.svg';
import IcCalendar from '../assets/icon/ic_calendar.svg';
import StrokeText from '../components/common/StrokeText';

const {width: screenWidth} = Dimensions.get('window');

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
  const { togglePlaceLike: togglePlaceLikeInContext } = useLikes();

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
      
      const ok = await togglePlaceLikeInContext(place.id);
      if (ok) {
        
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

  const openDirections = async () => {
    const ensureCoords = async (): Promise<{ latitude: number; longitude: number; label: string } | null> => {
      const latFromState = placeDetail?.latitude;
      const lonFromState = placeDetail?.longitude;
      if (latFromState && lonFromState) {
        return { latitude: latFromState, longitude: lonFromState, label: placeDetail?.name || place.name };
      }

      const latFromParam = place?.latitude as number | undefined;
      const lonFromParam = place?.longitude as number | undefined;
      if (latFromParam && lonFromParam) {
        return { latitude: latFromParam, longitude: lonFromParam, label: placeDetail?.name || place.name };
      }

      // 좌표가 없으면 상세 API 재조회로 확보
      try {
        const detail = await getPlaceDetail(place.id);
        setPlaceDetail(detail);
        if (detail.latitude && detail.longitude) {
          return { latitude: detail.latitude, longitude: detail.longitude, label: detail.name };
        }
      } catch (e) {
        // 무시하고 아래에서 에러 안내
      }
      return null;
    };

    const coords = await ensureCoords();
    const label = placeDetail?.name || place.name;
    const address = placeDetail?.address || place.address;
    const encodedLabel = encodeURIComponent(label);
    const encodedAddress = encodeURIComponent(address || label);

    let url = '';
    if (coords) {
      const { latitude, longitude } = coords;
      
      if (Platform.OS === 'ios') {
        url = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d&q=${encodedLabel}`;
      } else {
        url = `google.navigation:q=${latitude},${longitude}&mode=d`;
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        }
      }
    } else {
      
      if (Platform.OS === 'ios') {
        // Apple Maps는 주소 문자열로 목적지 지정 가능
        url = `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d&q=${encodedLabel}`;
      } else {
        // Google Maps 인텐트: 주소 문자열 사용
        url = `google.navigation:q=${encodedAddress}&mode=d`;
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
        }
      }
    }

    

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('길찾기 앱 열기 실패:', error);
      const fallbackUrl = coords
        ? `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
      try {
        await Linking.openURL(fallbackUrl);
      } catch (fallbackError) {
        Alert.alert('오류', '길찾기 앱을 열 수 없습니다.');
      }
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
        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
            decelerationRate="fast">
            {images.map((imageUri, index) => (
              <Image
                key={index}
                source={{uri: imageUri}}
                style={[styles.image, {width: screenWidth}]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <Image
            source={require('../assets/detail_image_default.png')}
            style={styles.image}
            resizeMode="cover"
          />
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
            stroke={isLiked ? colors.red[500] : colors.white}
            fill={isLiked ? colors.red[500] : 'none'}
          />
        </TouchableOpacity>

        {/* 좋아요 수 */}
        <View style={styles.likeCountContainer}>
          <StrokeText strokeColor="#000" strokeWidth={1.5} style={styles.likeCount}>
            {likeAmount}
          </StrokeText>
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
          <TouchableOpacity 
            style={styles.directionButton}
            onPress={openDirections}
          >
            <Text style={styles.directionButtonText}>길찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => {
              (navigation as any).navigate('Main', {
                screen: '혼잡도',
                params: { selectedPlaceId: place.id }
              });
            }}
          >
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
    alignItems: 'baseline',
    gap: 8,
  },
  placeName: {
    ...typography.headingLg,
    color: colors.gray[900],
    includeFontPadding: false,
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
