import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {PlaceListItem, PlaceType} from '../types/place';
import {RootStackParamList} from '../navigation/RootNavigator';
import {getPlaceTypeText} from '../utils/placeUtils';
import CongestionBadge from '../components/common/CongestionBadge';
import colors from '../styles/colors';
import typography from '../styles/typography';
import IcHeart from '../assets/icon/ic_heart.svg';
import IcMapPin from '../assets/icon/ic_map_pin.svg';

type PlaceDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlaceDetail'>;

const PlaceDetailScreen = () => {
  const route = useRoute<PlaceDetailScreenRouteProp>();
  const {place} = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(place.is_like);

  // 임시 이미지 배열 (실제로는 API에서 받아올 데이터)
  const images = [
    'https://via.placeholder.com/400x300/87CEEB/FFFFFF?text=장소+이미지+1',
    'https://via.placeholder.com/400x300/B8D4F0/FFFFFF?text=장소+이미지+2',
    'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=장소+이미지+3',
  ];

  // 장소 타입별 소개 텍스트
  const getIntroduction = (placeType: PlaceType, placeName: string) => {
    switch (placeType) {
      case PlaceType.SIGHT:
        if (placeName.includes('광안리')) {
          return '광안리해수욕장은 부산 수영구에 위치한 아름다운 해변이다. 맑고 푸른 바다와 고운 모래가 특징으로, 여름철에는 많은 관광객들이 찾는 명소이다. 특히 광안대교와 바다가 어우러지는 경치가 아름다워 야경 명소로도 유명하다. 해수욕 외에도 다양한 해양 스포츠를 즐길 수 있으며, 인근에는 카페와 레스토랑들이 있어 맛있는 음식을 즐기며 여유로운 시간을 보낼 수 있다.';
        } else if (placeName.includes('해운대')) {
          return '해운대해수욕장은 부산을 대표하는 해변으로 국내외 관광객들이 가장 많이 찾는 명소입니다. 넓은 백사장과 푸른 바다, 그리고 주변의 고층 빌딩들이 어우러져 독특한 풍경을 만들어냅니다. 매년 여름철에는 다양한 축제와 이벤트가 열려 더욱 활기찬 분위기를 연출합니다.';
        } else if (placeName.includes('감천')) {
          return '감천문화마을은 부산의 마추픽추라고 불리는 아름다운 산복도로 마을입니다. 알록달록한 집들이 계단식으로 배치되어 있어 독특한 경관을 자랑하며, 골목골목마다 예술 작품들이 숨어있어 걷는 재미가 쏠쏠합니다.';
        } else {
          return `${placeName}은(는) 부산의 대표적인 관광명소로 많은 사람들이 찾는 특별한 장소입니다. 아름다운 경관과 독특한 매력을 가지고 있어 방문객들에게 잊지 못할 추억을 선사합니다.`;
        }
      default:
        return '';
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const showIntroduction = place.type === PlaceType.SIGHT;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>장소 이미지</Text>
        </View>

        {/* 이미지 인디케이터 */}
        <View style={styles.imageIndicator}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                index === currentImageIndex
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

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
          <Text style={styles.likeCount}>210</Text>
        </View>
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 장소명과 혼잡도 배지 */}
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.placeName}>{place.name}</Text>
            {place.congestion_level > 0 && (
              <CongestionBadge
                level={place.congestion_level}
                style={styles.congestionBadge}
              />
            )}
          </View>
        </View>

        {/* 평점 정보 */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>4.2</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewCount}>(157)</Text>
          </View>
        </View>

        {/* 상세 정보 */}
        <View style={styles.detailsContainer}>
          {/* 운영시간 */}
          <View style={styles.detailRow}>
            <Text style={styles.iconText}>🕐</Text>
            <Text style={styles.detailText}>
              {place.type === PlaceType.SIGHT ? '상시 개방' : '09:00 - 22:00'}
            </Text>
          </View>

          {/* 위치 */}
          <View style={styles.detailRow}>
            <IcMapPin width={16} height={16} color={colors.gray[600]} />
            <Text style={styles.detailText}>{place.address}</Text>
            <Text style={styles.expandIcon}>⌄</Text>
          </View>

          {/* 전화번호 */}
          <View style={styles.detailRow}>
            <Text style={styles.iconText}>📞</Text>
            <Text style={styles.detailText}>051-622-4251</Text>
          </View>
        </View>

        {/* 소개 섹션 - 관광명소일 때만 표시 */}
        {showIntroduction && (
          <View style={styles.introSection}>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.description}>
              {getIntroduction(place.type, place.name)}
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
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary[300],
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
    right: 30,
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
