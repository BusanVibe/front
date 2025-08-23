import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * 두 지점 간의 거리를 계산합니다 (하버사인 공식 사용)
 * @param lat1 시작 지점 위도
 * @param lon1 시작 지점 경도
 * @param lat2 끝 지점 위도
 * @param lon2 끝 지점 경도
 * @returns 거리 (미터)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  console.log('거리 계산 입력 좌표:', {
    사용자위치: [lat1, lon1],
    장소위치: [lat2, lon2],
    위도차이: Math.abs(lat2 - lat1),
    경도차이: Math.abs(lon2 - lon1),
  });

  // 좌표 유효성 검사
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90) {
    console.error('잘못된 위도값:', {lat1, lat2});
    return 0;
  }
  if (Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    console.error('잘못된 경도값:', {lon1, lon2});
    return 0;
  }

  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  
  console.log('계산된 거리:', {
    미터: Math.round(distance),
    킬로미터: (distance / 1000).toFixed(2),
  });

  return distance;
};

/**
 * 거리를 사용자 친화적인 형태로 포맷팅합니다
 * @param distance 거리 (미터)
 * @returns 포맷된 거리 문자열
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * 위치 권한을 요청합니다
 * @returns 권한이 허용되었는지 여부
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS에서는 getCurrentPosition을 호출하면 자동으로 권한 요청
    // 실제 권한 상태는 getCurrentPosition의 성공/실패로 판단
    return true; // iOS는 getCurrentPosition에서 처리
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한',
          message: '근처 장소까지의 거리를 표시하기 위해 위치 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('위치 권한 요청 실패:', err);
      return false;
    }
  }
};

/**
 * 현재 위치를 가져옵니다
 * @returns 현재 위치 또는 null
 */
export const getCurrentLocation = (): Promise<UserLocation | null> => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('위치 가져오기 실패:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000, // 5분
      },
    );
  });
};

/**
 * 위치 권한을 확인하고 현재 위치를 가져옵니다
 * @returns 현재 위치 또는 null (권한이 없거나 위치를 가져올 수 없는 경우)
 */
export const getLocationWithPermission = async (): Promise<UserLocation | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('위치 권한이 거부되었습니다.');
      return null;
    }

    const location = await getCurrentLocation();
    if (!location) {
      console.log('현재 위치를 가져올 수 없습니다.');
      return null;
    }

    return location;
  } catch (error) {
    console.error('위치 가져오기 실패:', error);
    return null;
  }
};