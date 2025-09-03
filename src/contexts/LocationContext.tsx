import React, {createContext, useContext, useState, useEffect, useRef, ReactNode} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {UserLocation, getLocationWithPermission} from '../utils/locationUtils';

interface LocationContextType {
  userLocation: UserLocation | null;
  isLocationLoading: boolean;
  hasLocationPermission: boolean;
  refreshLocation: () => Promise<void>;
  ensureFreshLocation: (maxAgeMs?: number) => Promise<UserLocation | null>;
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
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
        setLastUpdatedAt(Date.now());
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

  const ensureFreshLocation = async (maxAgeMs: number = 30000): Promise<UserLocation | null> => {
    try {
      const now = Date.now();
      if (userLocation && lastUpdatedAt && now - lastUpdatedAt <= maxAgeMs) {
        return userLocation;
      }
      await refreshLocation();
      // 최신 state 반환
      return new Promise(resolve => {
        // 다음 틱에서 최신 값을 읽어 반환
        setTimeout(() => {
          resolve(userLocation);
        }, 0);
      });
    } catch {
      return null;
    }
  };

  const startWatching = () => {
    if (watchIdRef.current !== null || !hasLocationPermission) return;
    try {
      const id = Geolocation.watchPosition(
        position => {
          const next: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(next);
          setLastUpdatedAt(Date.now());
        },
        error => {
          console.warn('위치 감시 실패:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 30, // 30m 이상 이동 시 업데이트
          interval: 10000,
          fastestInterval: 5000,
          useSignificantChanges: false,
        } as any,
      );
      watchIdRef.current = id as unknown as number;
    } catch (e) {
      console.warn('watchPosition 설정 실패:', e);
    }
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      try {
        Geolocation.clearWatch(watchIdRef.current);
      } catch {}
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    refreshLocation();
    // 언마운트 시 워치 해제
    return () => {
      stopWatching();
    };
  }, []);

  // 권한이 있는 경우 워치 시작 (최초 위치 획득 이후)
  useEffect(() => {
    if (hasLocationPermission && userLocation && watchIdRef.current === null) {
      startWatching();
    }
  }, [hasLocationPermission, userLocation]);

  const value: LocationContextType = {
    userLocation,
    isLocationLoading,
    hasLocationPermission,
    refreshLocation,
    ensureFreshLocation,
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