import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaceListItem, FestivalListItem, CardType} from '../../types/place';
import {RootStackParamList} from '../../navigation/RootNavigator';
import CongestionBadge from '../common/CongestionBadge';
import {getPlaceTypeText} from '../../utils/placeUtils';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import IcHeart from '../../assets/icon/ic_heart.svg';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface AttractionCardProps {
  place: PlaceListItem | FestivalListItem;
  cardType?: CardType;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  place,
  cardType = CardType.PLACE,
}) => {
  const navigation = useNavigation<NavigationProp>();
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
  return (
    <TouchableOpacity style={styles.attractionItem} onPress={handlePress}>
      <View style={styles.attractionImageContainer}>
        <View style={styles.attractionImagePlaceholder}>
          <Text style={styles.attractionImageText}>이미지</Text>
        </View>
      </View>
      <View style={styles.attractionInfo}>
        <View style={styles.attractionHeader}>
          <View style={styles.nameAndBadgeContainer}>
            <Text style={styles.attractionName}>{place.name}</Text>
            {isPlace && (
              <CongestionBadge
                level={placeData.congestion_level}
                style={styles.congestionBadge}
              />
            )}
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
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
          {isPlace && (
            <>
              <Text style={styles.attractionDistance}>315m</Text>
              <Text style={styles.attractionSeparator}>|</Text>
            </>
          )}
          <Text style={styles.attractionLocation}>
            {isPlace ? (place as PlaceListItem).address : (place as FestivalListItem).address}
          </Text>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandIcon}>⌄</Text>
          </TouchableOpacity>
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
  attractionImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary[400],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attractionImageText: {
    fontSize: 12,
    color: colors.white,
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
