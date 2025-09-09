import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PlaceListItem, PlaceType} from '../../types/place';
import {RootStackParamList} from '../../navigation/RootNavigator';
import CongestionBadge from '../common/CongestionBadge';
import {getPlaceTypeText} from '../../utils/placeUtils';
import {useLocation} from '../../contexts/LocationContext';
import {calculateDistance, formatDistance} from '../../utils/locationUtils';
import colors from '../../styles/colors';
import typography from '../../styles/typography';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CrowdedPlaceCardProps {
  place: PlaceListItem;
}

const CrowdedPlaceCard: React.FC<CrowdedPlaceCardProps> = ({place}) => {
  const navigation = useNavigation<NavigationProp>();
  const {userLocation, hasLocationPermission} = useLocation();

  // 거리 계산
  const getDistanceText = (): string | null => {
    if (!hasLocationPermission || !userLocation) {
      console.log('CrowdedPlaceCard: 위치 권한 없음 또는 사용자 위치 없음', {
        hasLocationPermission,
        hasUserLocation: !!userLocation,
      });
      return null;
    }

    // PlaceListItem에 포함된 좌표 정보 사용
    if (place.latitude && place.longitude) {
      // console.log('CrowdedPlaceCard: 거리 계산 중', {
      //   placeName: place.name,
      //   placeCoords: [place.latitude, place.longitude],
      //   userCoords: [userLocation.latitude, userLocation.longitude],
      // });
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.latitude,
        place.longitude,
      );
      const formattedDistance = formatDistance(distance);
      // console.log('CrowdedPlaceCard: 계산된 거리', {
      //   placeName: place.name,
      //   distance,
      //   formattedDistance,
      // });
      return formattedDistance;
    }

    console.log('CrowdedPlaceCard: 장소 좌표 정보 없음', {
      placeName: place.name,
      hasLatitude: !!place.latitude,
      hasLongitude: !!place.longitude,
    });
    return null;
  };

  const distanceText = getDistanceText();

  const handlePress = () => {
    navigation.navigate('PlaceDetail', {place});
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image 
          source={place.img ? {uri: place.img} : require('../../assets/image_default.png')} 
          style={styles.image} 
        />

        <View style={styles.badgeContainer}>
          <CongestionBadge level={place.congestion_level} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.placeName}>{place.name}</Text>
        {distanceText && (
          <Text style={styles.distance}>{distanceText}</Text>
        )}
        <View style={styles.typeAddressContainer}>
          <Text style={styles.placeType}>{getPlaceTypeText(place.type)}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
