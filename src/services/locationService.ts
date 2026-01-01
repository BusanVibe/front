import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

class LocationService {
  private currentLocation: UserLocation | null = null;
  private isUserLocationLoading = false; // 사용자가 요청한 위치 로딩 (화면에 표시)
  private isBackgroundLocationLoading = false; // 백그라운드 위치 로딩 (화면에 표시 안함)
  private listeners: Array<(location: UserLocation | null) => void> = [];
  private loadingListeners: Array<(isLoading: boolean) => void> = [];
  private watchId: number | null = null;
  private lastLocationUpdate = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분
  private readonly UPDATE_INTERVAL = 2 * 60 * 1000; // 2분
  private readonly STORAGE_KEY = 'cached_location';

  constructor() {
    this.loadCachedLocation();
  }

  // 캐시된 위치 로드
  private async loadCachedLocation() {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const location = JSON.parse(cached) as UserLocation;
        const now = Date.now();

        // 캐시가 유효한 경우에만 사용
        if (now - location.timestamp < this.CACHE_DURATION) {
          this.currentLocation = location;
          console.log('캐시된 위치 로드 성공:', location);
          this.notifyListeners();
        } else {
          console.log('캐시된 위치가 만료됨');
          await AsyncStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('캐시된 위치 로드 실패:', error);
    }
  }

  // 위치를 캐시에 저장
  private async saveCachedLocation(location: UserLocation) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(location));
    } catch (error) {
      console.warn('위치 캐시 저장 실패:', error);
    }
  }

  // 위치 리스너 등록
  addLocationListener(listener: (location: UserLocation | null) => void) {
    this.listeners.push(listener);
    // 현재 위치가 있으면 즉시 호출
    if (this.currentLocation) {
      listener(this.currentLocation);
    }
  }

  // 위치 리스너 제거
  removeLocationListener(listener: (location: UserLocation | null) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 로딩 상태 리스너 등록
  addLoadingListener(listener: (isLoading: boolean) => void) {
    this.loadingListeners.push(listener);
    // 현재 로딩 상태를 즉시 호출
    listener(this.isUserLocationLoading);
  }

  // 로딩 상태 리스너 제거
  removeLoadingListener(listener: (isLoading: boolean) => void) {
    this.loadingListeners = this.loadingListeners.filter(l => l !== listener);
  }

  // 리스너들에게 위치 변경 알림
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentLocation);
      } catch (error) {
        console.warn('위치 리스너 호출 오류:', error);
      }
    });
  }

  // 로딩 리스너들에게 로딩 상태 알림
  private notifyLoadingListeners() {
    this.loadingListeners.forEach(listener => {
      try {
        listener(this.isUserLocationLoading);
      } catch (error) {
        console.warn('로딩 리스너 호출 오류:', error);
      }
    });
  }

  // 현재 위치 반환
  getCurrentLocation(): UserLocation | null {
    return this.currentLocation;
  }

  // 위치가 유효한지 확인
  isLocationValid(): boolean {
    if (!this.currentLocation) return false;
    const now = Date.now();
    return now - this.currentLocation.timestamp < this.CACHE_DURATION;
  }

  // 사용자 위치 로딩 상태 확인 (화면에 표시되는 로딩)
  isLoading(): boolean {
    return this.isUserLocationLoading;
  }

  // Android 위치 권한 요청
  private async requestAndroidLocationPermission(): Promise<boolean> {
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const fineResult =
        results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const coarseResult =
        results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

      return (
        fineResult === PermissionsAndroid.RESULTS.GRANTED ||
        coarseResult === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.warn('위치 권한 요청 실패:', error);
      return false;
    }
  }

  // 위치 업데이트 (단일 요청)
  async updateLocation(
    options: {
      showAlert?: boolean;
      forceUpdate?: boolean;
      timeout?: number;
      isUserRequest?: boolean; // 사용자가 직접 요청한 것인지 (화면 로딩 표시 여부)
    } = {},
  ): Promise<UserLocation | null> {
    const {
      showAlert = false,
      forceUpdate = false,
      timeout = 15000,
      isUserRequest = true,
    } = options;

    // 이미 로딩 중이고 강제 업데이트가 아닌 경우 현재 위치 반환
    if (
      (this.isUserLocationLoading || this.isBackgroundLocationLoading) &&
      !forceUpdate
    ) {
      console.log('위치 업데이트가 이미 진행 중');
      return this.currentLocation;
    }

    // 최근에 업데이트했고 강제 업데이트가 아닌 경우
    const now = Date.now();
    if (
      !forceUpdate &&
      this.isLocationValid() &&
      now - this.lastLocationUpdate < 30000
    ) {
      console.log('최근 위치 사용 (30초 이내)');
      return this.currentLocation;
    }

    // 로딩 상태 설정 (백그라운드 vs 사용자 요청)
    if (isUserRequest) {
      this.isUserLocationLoading = true;
      this.notifyLoadingListeners();
    } else {
      this.isBackgroundLocationLoading = true;
      console.log('백그라운드 위치 업데이트 시작 (화면 로딩 표시 없음)');
    }

    this.notifyListeners();

    try {
      // Android 권한 확인
      if (Platform.OS === 'android') {
        const hasPermission = await this.requestAndroidLocationPermission();
        if (!hasPermission) {
          if (showAlert) {
            Alert.alert(
              '위치 권한 필요',
              '현재 위치를 사용하려면 위치 권한이 필요합니다.',
              [
                {text: '취소', style: 'cancel'},
                {text: '설정으로 이동', onPress: () => Linking.openSettings()},
              ],
            );
          }
          return null;
        }
      }

      // 위치 가져오기 (정밀도 우선, 실패 시 저정밀도)
      const location = await this.getCurrentPositionWithFallback(timeout);

      if (location) {
        const userLocation: UserLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: now,
          accuracy: location.accuracy,
        };

        this.currentLocation = userLocation;
        this.lastLocationUpdate = now;

        // 캐시에 저장
        await this.saveCachedLocation(userLocation);

        console.log('위치 업데이트 성공:', userLocation);
        this.notifyListeners();

        return userLocation;
      } else {
        if (showAlert) {
          Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
        }
        return null;
      }
    } catch (error) {
      console.error('위치 업데이트 실패:', error);
      if (showAlert) {
        Alert.alert('위치 오류', '위치 서비스에 문제가 발생했습니다.');
      }
      return null;
    } finally {
      // 로딩 상태 해제
      if (isUserRequest) {
        this.isUserLocationLoading = false;
        this.notifyLoadingListeners();
      } else {
        this.isBackgroundLocationLoading = false;
        console.log('백그라운드 위치 업데이트 완료');
      }
      this.notifyListeners();
    }
  }

  // 위치 가져오기 (정밀도 우선, 실패 시 저정밀도)
  private getCurrentPositionWithFallback(timeout: number): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null> {
    return new Promise(resolve => {
      // 첫 번째 시도: 고정밀 GPS
      const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 60000,
      };

      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        error => {
          console.warn('고정밀 위치 실패, 저정밀도로 재시도:', error);

          // 두 번째 시도: 저정밀도 (네트워크/WiFi)
          const lowAccuracyOptions = {
            enableHighAccuracy: false,
            timeout: timeout + 5000,
            maximumAge: 120000,
          };

          Geolocation.getCurrentPosition(
            position => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
            },
            lowAccuracyError => {
              console.error('저정밀도 위치도 실패:', lowAccuracyError);
              resolve(null);
            },
            lowAccuracyOptions,
          );
        },
        highAccuracyOptions,
      );
    });
  }

  // 백그라운드 위치 추적 시작 (선택적)
  startLocationTracking() {
    if (this.watchId !== null) {
      console.log('위치 추적이 이미 시작됨');
      return;
    }

    console.log('백그라운드 위치 추적 시작');

    this.watchId = Geolocation.watchPosition(
      position => {
        const now = Date.now();
        const userLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: now,
          accuracy: position.coords.accuracy,
        };

        // 위치가 크게 변경된 경우에만 업데이트
        if (this.shouldUpdateLocation(userLocation)) {
          this.currentLocation = userLocation;
          this.lastLocationUpdate = now;
          this.saveCachedLocation(userLocation);
          this.notifyListeners();
          console.log('백그라운드 위치 업데이트:', userLocation);
        }
      },
      error => {
        console.warn('백그라운드 위치 추적 오류:', error);
      },
      {
        enableHighAccuracy: false, // 배터리 절약을 위해 저정밀도 사용
        distanceFilter: 100, // 100m 이상 이동 시에만 업데이트
        interval: this.UPDATE_INTERVAL,
        fastestInterval: 60000, // 최소 1분 간격
      },
    );
  }

  // 위치 업데이트가 필요한지 확인
  private shouldUpdateLocation(newLocation: UserLocation): boolean {
    if (!this.currentLocation) return true;

    // 거리 계산 (간단한 유클리드 거리)
    const latDiff = newLocation.latitude - this.currentLocation.latitude;
    const lngDiff = newLocation.longitude - this.currentLocation.longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // 대략적인 미터 변환

    // 100m 이상 이동했거나 2분 이상 지났으면 업데이트
    const timeDiff = newLocation.timestamp - this.currentLocation.timestamp;
    return distance > 100 || timeDiff > this.UPDATE_INTERVAL;
  }

  // 위치 추적 중지
  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('백그라운드 위치 추적 중지');
    }
  }

  // 서비스 초기화 (앱 시작 시 호출)
  async initialize() {
    console.log('LocationService 초기화 시작');

    // 캐시된 위치가 없거나 만료된 경우 백그라운드에서 위치 업데이트
    if (!this.isLocationValid()) {
      console.log('유효한 캐시 위치가 없음, 백그라운드 위치 업데이트 시작');
      await this.updateLocation({
        showAlert: false,
        isUserRequest: false, // 백그라운드 요청이므로 화면에 로딩 표시 안함
      });
    }

    // 백그라운드 추적 시작 (선택적)
    // this.startLocationTracking();
  }

  // 서비스 정리
  cleanup() {
    this.stopLocationTracking();
    this.listeners = [];
    this.currentLocation = null;
  }
}

// 싱글톤 인스턴스
export const locationService = new LocationService();
export default locationService;
