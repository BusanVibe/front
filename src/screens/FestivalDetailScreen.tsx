import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {FestivalListItem} from '../types/festival';
import {RootStackParamList} from '../navigation/RootNavigator';
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

  const status = getStatus(festival.start_date, festival.end_date);

  // 임시 이미지 배열 (실제로는 API에서 받아올 데이터)
  const images = [
    'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=축제+이미지+1',
    'https://via.placeholder.com/400x300/8CB6EE/FFFFFF?text=축제+이미지+2',
    'https://via.placeholder.com/400x300/B8D4F0/FFFFFF?text=축제+이미지+3',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 이미지 영역 */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>축제 이미지</Text>
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
        <TouchableOpacity style={styles.favoriteButton}>
          <IcHeart
            width={24}
            height={24}
            color={festival.is_like ? colors.red[500] : colors.white}
            fill={festival.is_like ? colors.red[500] : 'none'}
          />
        </TouchableOpacity>

        {/* 좋아요 수 */}
        <View style={styles.likeCountContainer}>
          <Text style={styles.likeCount}>210</Text>
        </View>
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 축제명과 상태 */}
        <View style={styles.headerContainer}>
          <Text style={styles.festivalName}>{festival.name}</Text>
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
              {formatDateRange(festival.start_date, festival.end_date)}
            </Text>
          </View>

          {/* 위치 */}
          <View style={styles.detailRow}>
            <IcMapPin width={16} height={16} color={colors.gray[600]} />
            <Text style={styles.detailText}>{festival.address}</Text>
          </View>

          {/* 전화번호 */}
          <View style={styles.detailRow}>
            <Text style={styles.iconText}>📞</Text>
            <Text style={styles.detailText}>051-622-4251</Text>
          </View>

          {/* 가격 */}
          <View style={styles.detailRow}>
            <Text style={styles.iconText}>💰</Text>
            <Text style={styles.detailText}>무료</Text>
          </View>
        </View>

        {/* 소개 섹션 */}
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>소개</Text>
          <Text style={styles.description}>
            「광안리 M 드론라이트쇼」는 전국 최초로 개최되는 상설 드론라이트쇼로
            매주 토요일, 매회 12분 내외로 광안리해변 어디서나 관람이 가능합니다.
            {'\n\n'}
            매주 새롭고 다채로운 콘텐츠와 다양한 시민참여 프로젝트를 통해
            전세계에 희망과 행복의 메시지를 보내고, 관광객분들께는 잊지 못할
            추억을 선사할 것입니다.
          </Text>
        </View>

        {/* 상세보기 버튼 */}
        <TouchableOpacity style={styles.detailButton}>
          <Text style={styles.detailButtonText}>상세보기</Text>
        </TouchableOpacity>
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
});

export default FestivalDetailScreen;
