/**
 * 명소 및 축제 카드 컴포넌트
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaceListItem, FestivalListItem, CardType} from '../../types/place';
import {RootStackParamList} from '../../navigation/RootNavigator';
import CongestionBadge from '../common/CongestionBadge';
import {getPlaceTypeText} from '../../utils/placeUtils';
import {useLocation} from '../../contexts/LocationContext';
import {calculateDistance, formatDistance} from '../../utils/locationUtils';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import IcHeart from '../../assets/icon/ic_heart.svg';
import IcMapPin from '../../assets/icon/ic_map_pin.svg';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface AttractionCardProps {
  place: PlaceListItem | FestivalListItem;
  cardType?: CardType;
  onToggleLike?: (placeId: number) => void;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  place,
  cardType = CardType.PLACE,
  onToggleLike,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const {userLocation, hasLocationPermission} = useLocation();

  const isPlace = cardType === CardType.PLACE;
  const placeData = place as PlaceListItem;
  const festivalData = place as FestivalListItem;

  const formatDateRange = (startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      return dateStr.replace(/-/g, '.');
    };
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const handlePress = () => {
    if (isPlace) {
      navigation.navigate('PlaceDetail', {place: placeData});
    } else {
      navigation.navigate('FestivalDetail', {festival: festivalData});
    }
  };

  // 거리 계산
  const getDistanceText = (): string | null => {
    if (!isPlace || !hasLocationPermission || !userLocation) {
      return null;
    }

    const placeWithCoords = place as PlaceListItem;
    if (placeWithCoords.latitude && placeWithCoords.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        placeWithCoords.latitude,
        placeWithCoords.longitude,
      );
      return formatDistance(distance);
    }

    return null;
  };

  // 이미지 URL이 있는지 확인
  const imageUrl = place.img;
  const hasImage = imageUrl && imageUrl.trim() !== '';
  const distanceText = getDistanceText();

  return (
    <TouchableOpacity style={styles.attractionItem} onPress={handlePress}>
      <View style={styles.attractionImageContainer}>
        {hasImage && !imageError ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{uri: imageUrl}}
              style={styles.attractionImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                console.log('이미지 로드 실패:', imageUrl);
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.attractionImagePlaceholder}>
            <IcMapPin width={32} height={32} color={colors.white} />
          </View>
        )}
      </View>
      <View style={styles.attractionInfo}>
        <View style={styles.attractionHeader}>
          <View style={styles.nameAndBadgeContainer}>
            <Text style={styles.attractionName}>
              {place.name.split('(')[0]}
            </Text>
            {isPlace && (
              <CongestionBadge
                level={placeData.congestion_level}
                style={styles.congestionBadge}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() =>
              onToggleLike &&
              onToggleLike(isPlace ? placeData.place_id : festivalData.id)
            }>
            <IcHeart
              width={16}
              height={16}
              color={place.is_like ? colors.red[500] : colors.gray[600]}
              fill={place.is_like ? colors.red[500] : 'none'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.attractionCategory}>
          {isPlace
            ? getPlaceTypeText(placeData.type)
            : formatDateRange(festivalData.start_date, festivalData.end_date)}
        </Text>
        <View style={styles.attractionDetails}>
          {distanceText && (
            <>
              <Text style={styles.attractionDistance}>{distanceText}</Text>
              <Text style={styles.attractionSeparator}>|</Text>
            </>
          )}
          <Text style={styles.attractionLocation}>
            {isPlace
              ? (place as PlaceListItem).address
              : (place as FestivalListItem).address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AttractionCard;

const styles = StyleSheet.create({
  attractionItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  attractionImageContainer: {
    marginRight: 12,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  attractionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
    borderRadius: 8,
  },
  attractionImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary[400],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attractionInfo: {
    flex: 1,
  },
  attractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameAndBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attractionName: {
    ...typography.subHeadingMd,
    color: colors.gray[900],
  },
  congestionBadge: {
    marginLeft: 4,
  },
  favoriteButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  attractionCategory: {
    ...typography.bodyLg,
    color: colors.gray[800],
    marginBottom: 8,
  },
  attractionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionDistance: {
    ...typography.bodyLg,
    color: colors.gray[800],
  },
  attractionSeparator: {
    fontSize: 14,
    color: colors.gray[600],
    marginHorizontal: 8,
  },
  attractionLocation: {
    ...typography.bodyLg,
    color: colors.gray[800],
    flex: 1,
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: colors.gray[600],
  },
});
