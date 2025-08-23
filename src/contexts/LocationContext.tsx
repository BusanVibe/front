import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {UserLocation, getLocationWithPermission} from '../utils/locationUtils';

interface LocationContextType {
  userLocation: UserLocation | null;
  isLocationLoading: boolean;
  hasLocationPermission: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({children}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const refreshLocation = async () => {
    setIsLocationLoading(true);
    try {
      const location = await getLocationWithPermission();
      if (location) {
        console.log('LocationContext: 받아온 위치 정보', {
          latitude: location.latitude,
          longitude: location.longitude,
          위치설명: location.latitude > 33 && location.latitude < 39 && location.longitude > 124 && location.longitude < 132 
            ? '한국 내 위치' 
            : '해외 위치 (시뮬레이터일 가능성)'
        });
        
        // 한국 영역 밖이면 경고
        if (!(location.latitude > 33 && location.latitude < 39 && location.longitude > 124 && location.longitude < 132)) {
          console.warn('⚠️ 현재 위치가 한국 밖입니다. 시뮬레이터를 사용 중이거나 GPS 오류일 수 있습니다.');
          console.warn('시뮬레이터 사용 시 Debug > Location에서 한국 위치로 설정해주세요.');
        }
        
        setUserLocation(location);
        setHasLocationPermission(true);
      } else {
        setUserLocation(null);
        setHasLocationPermission(false);
      }
    } catch (error) {
      console.error('위치 업데이트 실패:', error);
      setUserLocation(null);
      setHasLocationPermission(false);
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const value: LocationContextType = {
    userLocation,
    isLocationLoading,
    hasLocationPermission,
    refreshLocation,
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