import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {FestivalListItem, FestivalDetailResult} from '../types/festival';
import {RootStackParamList} from '../navigation/RootNavigator';
import {FestivalService} from '../services/festivalService';
import colors from '../styles/colors';
import typography from '../styles/typography';
import IcHeart from '../assets/icon/ic_heart.svg';
import IcCalendar from '../assets/icon/ic_calendar.svg';
import IcMapPin from '../assets/icon/ic_map_pin.svg';

type FestivalDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'FestivalDetail'
>;

const FestivalDetailScreen = () => {
  const route = useRoute<FestivalDetailScreenRouteProp>();
  const {festival} = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [festivalDetail, setFestivalDetail] = useState<FestivalDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateRange = (startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      return dateStr.replace(/-/g, '.');
    };
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const getStatus = (startDate: string, endDate: string) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (currentDate < start) {
      return {text: '진행예정', color: colors.secondary[500]};
    } else if (currentDate >= start && currentDate <= end) {
      return {text: '진행중', color: colors.green[500]};
    } else {
      return {text: '종료', color: colors.gray[500]};
    }
  };

  const currentFestival = festivalDetail || festival;
  const status = getStatus(currentFestival.start_date, currentFestival.end_date);
  
  const images = festivalDetail?.img?.[1] || [];

  const handleIndicatorPress = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImagePress = () => {
    if (images.length > 1) {
      const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
    }
  };

  const handleSiteUrlPress = async () => {
    if (festivalDetail?.site_url) {
      try {
        const url = festivalDetail.site_url.startsWith('http') 
          ? festivalDetail.site_url 
          : `https://${festivalDetail.site_url}`;
        
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('오류', '링크를 열 수 없습니다.');
        }
      } catch (error) {
        console.error('링크 열기 오류:', error);
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    }
  };

  const handlePhonePress = async () => {
    if (festivalDetail?.phone) {
      try {
        // 전화번호에서 숫자만 추출
        const phoneNumber = festivalDetail.phone.replace(/[^0-9]/g, '');
        const phoneUrl = `tel:${phoneNumber}`;
        
        const canOpen = await Linking.canOpenURL(phoneUrl);
        if (canOpen) {
          await Linking.openURL(phoneUrl);
        } else {
          Alert.alert('오류', '전화 기능을 사용할 수 없습니다.');
        }
      } catch (error) {
        console.error('전화 걸기 오류:', error);
        Alert.alert('오류', '전화 기능을 사용할 수 없습니다.');
      }
    }
  };

  useEffect(() => {
    fetchFestivalDetail();
  }, []);

  const fetchFestivalDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await FestivalService.getFestivalDetail(festival.id);
      if (response.is_success) {
        setFestivalDetail(response.result || null);
      } else {
        setError('축제 상세 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('축제 상세 조회 에러:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>축제 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFestivalDetail}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
            <Image
              source={{uri: images[currentImageIndex]}}
              style={styles.festivalImage}
              onError={() => console.log('이미지 로드 실패:', images[currentImageIndex])}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>축제 이미지</Text>
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
                onPress={() => handleIndicatorPress(index)}
              />
            ))}
          </View>
        )}

        {/* 좋아요 버튼 */}
        <TouchableOpacity style={styles.favoriteButton}>
          <IcHeart
            width={24}
            height={24}
            color={currentFestival.is_like ? colors.red[500] : colors.white}
            fill={currentFestival.is_like ? colors.red[500] : 'none'}
          />
        </TouchableOpacity>

        {/* 좋아요 수 */}
        <View style={styles.likeCountContainer}>
          <Text style={styles.likeCount}>{festivalDetail?.like_amount || currentFestival.like_amount || 0}</Text>
        </View>
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 축제명과 상태 */}
        <View style={styles.headerContainer}>
          <Text style={styles.festivalName}>{currentFestival.name.split('(')[0]}</Text>
          <View style={[styles.statusBadge, {backgroundColor: status.color}]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        {/* 상세 정보 */}
        <View style={styles.detailsContainer}>
          {/* 날짜 */}
          <View style={styles.detailRow}>
            <IcCalendar width={16} height={16} color={colors.gray[600]} />
            <Text style={styles.detailText}>
              {formatDateRange(currentFestival.start_date, currentFestival.end_date)}
            </Text>
          </View>

          {/* 위치 */}
          {currentFestival.address && currentFestival.address.trim() !== '' && (
            <View style={styles.detailRow}>
              <IcMapPin width={16} height={16} color={colors.gray[600]} />
              <Text style={styles.detailText}>{currentFestival.address}</Text>
            </View>
          )}

          {/* 전화번호 */}
          {festivalDetail?.phone && festivalDetail.phone.trim() !== '' && (
            <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress}>
              <Text style={styles.iconText}>📞</Text>
              <Text style={[styles.detailText, styles.phoneText]}>{festivalDetail.phone}</Text>
            </TouchableOpacity>
          )}

          {/* 가격 */}
          {festivalDetail?.fee && festivalDetail.fee.trim() !== '' && (
            <View style={styles.detailRow}>
              <Text style={styles.iconText}>💰</Text>
              <Text style={styles.detailText}>{festivalDetail.fee}</Text>
            </View>
          )}
        </View>

        {/* 소개 섹션 */}
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>소개</Text>
          <Text style={styles.description}>
            {festivalDetail?.introduce || '축제 소개 정보가 없습니다.'}
          </Text>
        </View>

        {/* 상세보기 버튼 */}
        {festivalDetail?.site_url && (
          <TouchableOpacity style={styles.detailButton} onPress={handleSiteUrlPress}>
            <Text style={styles.detailButtonText}>상세보기</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  festivalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  festivalName: {
    ...typography.headingLg,
    color: colors.gray[900],
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
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
  detailButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailButtonText: {
    ...typography.subHeadingMd,
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    ...typography.bodyLg,
    color: colors.gray[700],
    marginTop: 16,
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
    color: colors.red[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.subHeadingMd,
    color: colors.white,
    fontWeight: '600',
  },
  phoneText: {
    color: colors.primary[500],
    textDecorationLine: 'underline',
  },
});

export default FestivalDetailScreen;
