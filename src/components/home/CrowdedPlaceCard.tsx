import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {PlaceListItem, PlaceType} from '../../types/place';
import CongestionBadge from '../common/CongestionBadge';
import colors from '../../styles/colors';
import typography from '../../styles/typography';

interface CrowdedPlaceCardProps {
  place: PlaceListItem;
}

const CrowdedPlaceCard: React.FC<CrowdedPlaceCardProps> = ({place}) => {
  const getPlaceTypeText = (type: PlaceType) => {
    switch (type) {
      case PlaceType.SIGHT:
        return '관광명소';
      case PlaceType.RESTAURANT:
        return '맛집';
      case PlaceType.CAFE:
        return '카페';
      default:
        return '';
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        {place.img ? (
          <Image source={{uri: place.img}} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>이미지</Text>
          </View>
        )}

        <View style={styles.badgeContainer}>
          <CongestionBadge level={place.congestion_level} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.placeName}>{place.name}</Text>
        {/* TODO: 거리 정보 API 연동 후 실제 데이터로 교체 */}
        <Text style={styles.distance}>315m</Text>
        <View style={styles.typeAddressContainer}>
          <Text style={styles.placeType}>{getPlaceTypeText(place.type)}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 250,
    height: 216,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    flexShrink: 0,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginVertical: 4,
    marginHorizontal: 2,
  },
  imageContainer: {
    width: 250,
    height: 130,
    flexShrink: 0,
    position: 'relative',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.bodyMd,
    color: colors.gray[700],
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flex: 1,
    alignSelf: 'stretch',
    gap: 8,
  },
  placeName: {
    ...typography.subHeadingMd,
    color: colors.black,
    alignSelf: 'stretch',
  },
  distance: {
    ...typography.bodyMd,
    color: colors.gray[800],
  },
  typeAddressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
    alignSelf: 'stretch',
  },
  placeType: {
    ...typography.bodyMd,
    color: colors.gray[800],
  },
  separator: {
    ...typography.bodyMd,
    color: colors.gray[800],
    marginHorizontal: 4,
  },
  address: {
    ...typography.bodyMd,
    color: colors.gray[800],
    flex: 1,
  },
});

export default CrowdedPlaceCard;
