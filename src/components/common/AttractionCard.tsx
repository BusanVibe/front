/**
 * 명소 및 축제 카드 컴포넌트
 */
import React, {useState, memo, useCallback} from 'react';
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
import {
  PlaceListItem,
  FestivalListItem,
  CardType,
  PlaceType,
} from '../../types/place';
import {RootStackParamList} from '../../navigation/RootNavigator';
import CongestionBadge from '../common/CongestionBadge';
import {getPlaceTypeText} from '../../utils/placeUtils';
import {useLocation} from '../../contexts/LocationContext';
import {calculateDistance, formatDistance} from '../../utils/locationUtils';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import IcHeart from '../../assets/icon/ic_heart.svg';
import IcMapPin from '../../assets/icon/ic_map_pin.svg';
import {useLikes} from '../../contexts/LikesContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FestivalLikeData {
  start_date?: string;
  end_date?: string;
  like_count?: number;
}

interface AttractionCardProps {
  place: PlaceListItem | FestivalListItem;
  cardType?: CardType;
  onToggleLike?: (id: number) => Promise<void>;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  place,
  cardType = CardType.PLACE,
  onToggleLike,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const {userLocation, hasLocationPermission} = useLocation();
  const {isPlaceLiked, togglePlaceLike: togglePlaceLikeInContext} = useLikes();

  const isPlace = cardType === CardType.PLACE;
  const placeData = place as PlaceListItem;
  const festivalData = place as FestivalListItem;

  const formatDateRange = useCallback((startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      return dateStr.replace(/-/g, '.');
    };
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  }, []);

  const handlePress = useCallback(() => {
    if (isPlace && placeData.type !== PlaceType.FESTIVAL) {
      navigation.navigate('PlaceDetail', {place: placeData});
    } else {
      const festivalLikeData = place as PlaceListItem & FestivalLikeData;
      const festivalItem = {
        id: place.id,
        name: place.name,
        is_like: place.is_like,
        address: place.address,
        img: place.img,
        start_date: festivalLikeData.start_date || '',
        end_date: festivalLikeData.end_date || '',
        like_amount: festivalLikeData.like_count || 0,
      };
      navigation.navigate('FestivalDetail', {festival: festivalItem});
    }
  }, [isPlace, navigation, placeData, place]);

  const getDistanceText = useCallback((): string | null => {
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
  }, [isPlace, hasLocationPermission, userLocation, place]);

  const handleLikePress = useCallback(async () => {
    if (isLikeLoading) {
      return;
    }

    setIsLikeLoading(true);
    try {
      if (onToggleLike) {
        await onToggleLike(isPlace ? placeData.id : festivalData.id);
      } else if (isPlace) {
        await togglePlaceLikeInContext(placeData.id);
      }
    } finally {
      setIsLikeLoading(false);
    }
  }, [
    isLikeLoading,
    onToggleLike,
    isPlace,
    placeData.id,
    festivalData.id,
    togglePlaceLikeInContext,
  ]);

  const imageUrl = place.img;
  const hasImage = imageUrl && imageUrl.trim() !== '';
  const distanceText = getDistanceText();

  const handleImageLoadStart = useCallback(() => setImageLoading(true), []);
  const handleImageLoadEnd = useCallback(() => setImageLoading(false), []);
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const getFestivalDateInfo = (): {startDate?: string; endDate?: string} => {
    const festivalLikeData = place as PlaceListItem & FestivalLikeData;
    return {
      startDate: festivalLikeData.start_date,
      endDate: festivalLikeData.end_date,
    };
  };

  const dateInfo = getFestivalDateInfo();

  return (
    <TouchableOpacity style={styles.attractionItem} onPress={handlePress}>
      <View style={styles.attractionImageContainer}>
        {hasImage && !imageError ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{uri: imageUrl}}
              style={styles.attractionImage}
              onLoadStart={handleImageLoadStart}
              onLoadEnd={handleImageLoadEnd}
              onError={handleImageError}
              resizeMode="cover"
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
            {isPlace && placeData.type !== PlaceType.FESTIVAL && (
              <CongestionBadge
                level={placeData.congestion_level}
                style={styles.congestionBadge}
              />
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isLikeLoading && styles.favoriteButtonLoading,
            ]}
            onPress={handleLikePress}
            disabled={isLikeLoading}>
            <IcHeart
              width={16}
              height={16}
              stroke={
                isPlace
                  ? isPlaceLiked(placeData.id)
                    ? colors.red[500]
                    : colors.gray[600]
                  : place.is_like
                  ? colors.red[500]
                  : colors.gray[600]
              }
              fill={
                isPlace
                  ? isPlaceLiked(placeData.id)
                    ? colors.red[500]
                    : 'none'
                  : place.is_like
                  ? colors.red[500]
                  : 'none'
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.attractionCategory}>
          {isPlace && placeData.type !== PlaceType.FESTIVAL
            ? getPlaceTypeText(placeData.type)
            : placeData.type === PlaceType.FESTIVAL &&
              dateInfo.startDate &&
              dateInfo.endDate
            ? formatDateRange(dateInfo.startDate, dateInfo.endDate)
            : !isPlace
            ? formatDateRange(festivalData.start_date, festivalData.end_date)
            : getPlaceTypeText(placeData.type)}
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

export default memo(AttractionCard, (prevProps, nextProps) => {
  if (prevProps.place.id !== nextProps.place.id) return false;
  if (prevProps.place.name !== nextProps.place.name) return false;
  if (prevProps.place.img !== nextProps.place.img) return false;
  if (prevProps.place.is_like !== nextProps.place.is_like) return false;
  if (prevProps.cardType !== nextProps.cardType) return false;

  if (prevProps.cardType === CardType.PLACE) {
    const prevPlace = prevProps.place as PlaceListItem;
    const nextPlace = nextProps.place as PlaceListItem;
    if (prevPlace.congestion_level !== nextPlace.congestion_level) return false;
    if (prevPlace.type !== nextPlace.type) return false;
    if (prevPlace.address !== nextPlace.address) return false;
  }

  return true;
});

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
  favoriteButtonLoading: {
    opacity: 0.5,
  },
});
