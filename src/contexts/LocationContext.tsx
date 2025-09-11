import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import locationService, {UserLocation} from '../services/locationService';

interface LocationContextType {
  userLocation: UserLocation | null;
  isLocationLoading: boolean;
  hasLocationPermission: boolean;
  refreshLocation: (showAlert?: boolean) => Promise<UserLocation | null>;
  ensureFreshLocation: (maxAgeMs?: number) => Promise<UserLocation | null>;
  fastRefreshLocation: () => Promise<UserLocation | null>;
  startWatching: () => void;
  stopWatching: () => void;
  lastUpdatedAt: number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({children}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  // LocationService 위치 변경 리스너 설정
  useEffect(() => {
    const locationListener = (location: UserLocation | null) => {
      setUserLocation(location);
      setLastUpdatedAt(location?.timestamp || null);
      setHasLocationPermission(!!location);
      
      if (location) {
        console.log('LocationContext: 위치 업데이트', {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date(location.timestamp).toLocaleString(),
          위치설명: location.latitude > 33 && location.latitude < 39 && location.longitude > 124 && location.longitude < 132 
            ? '한국 내 위치' 
            : '해외 위치 (시뮬레이터일 가능성)'
        });
        
        // 한국 영역 밖이면 경고
        if (!(location.latitude > 33 && location.latitude < 39 && location.longitude > 124 && location.longitude < 132)) {
          console.warn('⚠️ 현재 위치가 한국 밖입니다. 시뮬레이터를 사용 중이거나 GPS 오류일 수 있습니다.');
          console.warn('시뮬레이터 사용 시 Debug > Location에서 한국 위치로 설정해주세요.');
        }
      }
    };

    const loadingListener = (isLoading: boolean) => {
      setIsLocationLoading(isLoading);
    };

    // 현재 위치가 있으면 즉시 설정
    const currentLocation = locationService.getCurrentLocation();
    if (currentLocation) {
      locationListener(currentLocation);
    }

    // 로딩 상태 동기화
    setIsLocationLoading(locationService.isLoading());

    // 리스너 등록
    locationService.addLocationListener(locationListener);
    locationService.addLoadingListener(loadingListener);

    return () => {
      // 리스너 제거
      locationService.removeLocationListener(locationListener);
      locationService.removeLoadingListener(loadingListener);
    };
  }, []);

  const refreshLocation = async (showAlert: boolean = false): Promise<UserLocation | null> => {
    console.log('LocationContext: 위치 새로고침 요청 (사용자 요청)');
    return await locationService.updateLocation({ 
      showAlert, 
      forceUpdate: true, 
      isUserRequest: true // 사용자 요청이므로 로딩 표시
    });
  };

  const ensureFreshLocation = async (maxAgeMs: number = 30000): Promise<UserLocation | null> => {
    const currentLocation = locationService.getCurrentLocation();
    
    // 캐시된 위치가 유효한 경우
    if (currentLocation && currentLocation.timestamp) {
      const now = Date.now();
      if (now - currentLocation.timestamp <= maxAgeMs) {
        console.log('LocationContext: 캐시된 위치 사용 (유효 기간 내)');
        return currentLocation;
      }
    }

    // 새로운 위치 요청 (사용자 요청)
    console.log('LocationContext: 새로운 위치 요청 (캐시 만료 또는 없음)');
    return await locationService.updateLocation({ 
      showAlert: false, 
      isUserRequest: true // 사용자 요청이므로 로딩 표시
    });
  };

  // 빠른 위치 가져오기 (캐시 우선, 없으면 즉시 요청)
  const fastRefreshLocation = async (): Promise<UserLocation | null> => {
    const cachedLocation = locationService.getCurrentLocation();
    
    // 유효한 캐시가 있으면 즉시 반환
    if (cachedLocation && locationService.isLocationValid()) {
      console.log('LocationContext: 캐시된 위치 즉시 반환');
      return cachedLocation;
    }

    // 캐시가 없거나 만료된 경우 새로 요청 (사용자 요청)
    console.log('LocationContext: 빠른 위치 업데이트 요청');
    return await locationService.updateLocation({ 
      showAlert: false, 
      timeout: 10000, 
      isUserRequest: true // 사용자가 버튼을 눌렀으므로 로딩 표시
    });
  };

  const startWatching = () => {
    console.log('LocationContext: 위치 추적 시작');
    locationService.startLocationTracking();
  };

  const stopWatching = () => {
    console.log('LocationContext: 위치 추적 중지');
    locationService.stopLocationTracking();
  };

  const value: LocationContextType = {
    userLocation,
    isLocationLoading,
    hasLocationPermission,
    refreshLocation,
    ensureFreshLocation,
    fastRefreshLocation,
    startWatching,
    stopWatching,
    lastUpdatedAt,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};