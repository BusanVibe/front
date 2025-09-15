import React, { useState, useRef } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMapHTML } from '../components/map/mapTemplate.ts';
import CongestionBadge from '../components/common/CongestionBadge';
import { useLocation } from '../contexts/LocationContext';

// 타입 정의
interface Location {
  latitude: number;
  longitude: number;
}

interface CachedLocation extends Location {
  timestamp: number;
}

interface PlaceMarker {
  latitude: string | number;
  longitude: string | number;
  name: string;
  congestion_level: number;
  type: string;
}

type CongestionScreenRouteProp = RouteProp<
  Record<string, { selectedPlaceId?: number }>,
  string
>;

const categories = ['전체', '관광명소', '맛집', '문화시설'];
const { height: screenHeight } = Dimensions.get('window');
// 혼잡도 응답 상세 로그 소음 방지용 플래그
const VERBOSE_CONGESTION_LOG = false;

// 혼잡도 시간별 데이터
const congestionData = [
  { time: '06시', level: 10 },
  { time: '09시', level: 30 },
  { time: '12시', level: 60 },
  { time: '15시', level: 100 }, // 현재 시간
  { time: '18시', level: 70 },
  { time: '21시', level: 40 },
  { time: '24시', level: 15 },
];

// 이용객 분포 데이터
const visitorData = [
  { age: '10-20대', male: 25, female: 20 },
  { age: '30-40대', male: 20, female: 25 },
  { age: '50-60대', male: 15, female: 20 },
  { age: '70대 이상', male: 10, female: 15 },
];

const locationData = [
  {
    id: '1',
    name: '광안리 해수욕장',
    congestionLevel: '혼잡',
    congestionLevelNum: 4,
    rating: 4.2,
    reviewCount: 157,
    distance: '210m',
    address: '부산 수영구 광안해변로 219',
    status: '상시 개방',
    images: [
      'https://via.placeholder.com/150x100/87CEEB/000000?text=Beach1',
      'https://via.placeholder.com/150x100/87CEEB/000000?text=Beach2',
      'https://via.placeholder.com/150x100/87CEEB/000000?text=Beach3',
      'https://via.placeholder.com/150x100/87CEEB/000000?text=Beach4',
    ],
  },
];

const DEFAULT_CENTER = { latitude: 35.15612306382287, longitude: 129.15400865768683 };

const CongestionScreen = () => {
  const route = useRoute<CongestionScreenRouteProp>();
  const navigation = useNavigation<any>();
  const selectedPlaceId = route.params?.selectedPlaceId;
  const { userLocation, isLocationLoading, fastRefreshLocation, refreshLocation } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState(locationData[0]);
  const [mapKey, setMapKey] = useState(0); // WebView 강제 리렌더링용
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<Location | null>(null); // 현재 위치 로드 후 설정
  const [placeMarkers, setPlaceMarkers] = useState<PlaceMarker[]>([]); // API에서 받은 장소들
  const [isMapDragging, setIsMapDragging] = useState(false); // 지도 드래그 상태
  const [shouldShowCurrentLocation, setShouldShowCurrentLocation] = useState(false); // 현재위치 표시 여부
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로드 상태
  // isLocationLoading은 LocationContext에서 관리
  const [realtimeStandardHour, setRealtimeStandardHour] = useState<number | null>(null);
  const [realtimeLevel, setRealtimeLevel] = useState<number | null>(null);
  const [realtimeByPercent, setRealtimeByPercent] = useState<number[] | null>(null);
  const [visitorDistribution, setVisitorDistribution] = useState<{ age: string; male: number; female: number }[] | null>(null);
  // 새로운 혼잡도 데이터 (주간/시간별)
  const [weekCongestionData, setWeekCongestionData] = useState<{
    standardDay: number;
    standardTime: number;
    realtimeLevel: number;
    congestionsByDay: number[];
    congestionsByTime: number[][];
  } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // JavaScript getDay(): 일요일=0, 월요일=1, ..., 토요일=6
    // API: 월요일=0, 화요일=1, ..., 일요일=6
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1; // 일요일(0)을 6으로, 나머지는 -1
  });
  const webViewRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // lastLocationRef는 LocationService에서 관리
  const isUpdatingMapRef = useRef(false); // 지도 업데이트 중인지 확인
  const lastMapBoundsRef = useRef<{lat1: number, lng1: number, lat2: number, lng2: number} | null>(null); // 마지막 지도 경계
  const webViewReloadReasonRef = useRef<string | null>(null); // WebView 재로딩 사유 추적
  const pendingMoveToLocationRef = useRef<{lat: number, lng: number, show: boolean} | null>(null); // WebView 로드 후 이동 예약
  const pendingCurrentLocationPingRef = useRef<{lat: number, lng: number} | null>(null); // WebView 로드 후 현재위치 핑 예약
  const initialBoundsRequestedRef = useRef(false); // 초기 렌더 후 최초 bounds fetch 여부
  const formatReviewCount = (value: any): string => {
    const num = typeof value === 'number' ? value : Number(value || 0);
    const safe = isFinite(num) && num > 0 ? Math.floor(num) : 0;
    try {
      return safe.toLocaleString('ko-KR');
    } catch {
      return String(safe);
    }
  };

  const formatRating = (value: any): string => {
    const num = typeof value === 'number' ? value : Number(value || 0);
    if (!isFinite(num) || num <= 0) return '0.0';
    return num.toFixed(1);
  };


  // 컴포넌트 마운트 시 기본 좌표로 초기화
  React.useEffect(() => {
    console.log('=== CongestionScreen 마운트 - 기본 좌표로 초기화 ===');
    // 항상 기본 좌표로 시작 (현재위치는 버튼 클릭 시에만 사용)
    setMapCenter({ latitude: DEFAULT_CENTER.latitude, longitude: DEFAULT_CENTER.longitude });
    setIsInitialLoad(false);
    // 데이터 조회는 WebView 렌더 완료 시점(onLoadEnd)에서 handleMapBoundsChange로 즉시 수행
  }, []);

  // selectedPlaceId가 전달되었을 때 해당 장소 정보 로드
  React.useEffect(() => {
    if (selectedPlaceId) {
      console.log('=== 선택된 장소 ID로 초기화 ===', selectedPlaceId);
      // 장소 상세 정보, 실시간 혼잡도, 이용객 분포, 주간 혼잡도를 모두 가져오기
      fetchPlaceDetail(selectedPlaceId);
      fetchRealtimeCongestion(selectedPlaceId);
      fetchVisitorDistribution(selectedPlaceId);
      fetchWeekCongestion(selectedPlaceId);
      setIsBottomSheetEnabled(true);
      changeBottomSheetMode('half');
    }
  }, [selectedPlaceId]);

  // 카테고리를 API 타입으로 변환
  const getCategoryType = (category: string): string => {
    const categoryMap: Record<string, string> = {
      '전체': 'ALL',
      '관광명소': 'SIGHT',
      '맛집': 'RESTAURANT',
      '카페': 'CAFE',
      '문화시설': 'CULTURE',
    };
    return categoryMap[category] || 'ALL';
  };

  const getCongestionTextLocal = (level: number): string => {
    if (level >= 4) return '매우혼잡';
    if (level >= 3) return '혼잡';
    if (level >= 2) return '보통';
    return '여유';
  };

  // 실시간 혼잡도 조회
  const fetchRealtimeCongestion = async (placeId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;
      const now = new Date();
      const iso = new Date(now.getTime() - now.getMilliseconds()).toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
      const url = `https://api.busanvibe.site/api/congestion/place/${placeId}/real-time?standard-time=${encodeURIComponent(iso)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
      });
      const txt = await res.text();
      console.log('실시간 혼잡도 응답:', txt);
      const data = JSON.parse(txt);
      const ok = !!(data && (data.isSuccess === true || data.is_success === true));
      if (res.ok && ok && data.result) {
        const r = data.result;
        const unwrapArrayList = (v: any) => (Array.isArray(v) && v.length === 2 && v[0] === 'java.util.ArrayList') ? v[1] : (Array.isArray(v) ? v : []);
        setRealtimeStandardHour(typeof r.standard_time === 'number' ? r.standard_time : Number(r.standard_time || 0));
        const levelRaw = (r.realtime_congestion_level !== undefined ? r.realtime_congestion_level : r.real_time_congestion_level);
        setRealtimeLevel(typeof levelRaw === 'number' ? levelRaw : Number(levelRaw || 0));
        const arr = unwrapArrayList(r.by_time_percent);
        setRealtimeByPercent(arr.map((n: any) => Number(n)));
      }
    } catch (e) {
      console.warn('실시간 혼잡도 조회 실패', e);
    }
  };

  // 성별·연령 분포 조회
  const fetchVisitorDistribution = async (placeId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;
      const url = `https://api.busanvibe.site/api/congestion/place/${placeId}/distribution`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
      });
      const txt = await res.text();
      console.log('이용객 분포 응답:', txt);
      const data = JSON.parse(txt);
      const ok = !!(data && (data.isSuccess === true || data.is_success === true));
      if (res.ok && ok && data.result) {
        const r = data.result;
        const toNum = (v: any) => typeof v === 'number' ? v : Number(v || 0);
        const mapped = [
          { age: '10·20대', male: toNum(r.male1020), female: toNum(r.female1020) },
          { age: '30·40대', male: toNum(r.male3040), female: toNum(r.female3040) },
          { age: '50·60대', male: toNum(r.male5060), female: toNum(r.female5060) },
          { age: '70대 이상', male: toNum(r.male70), female: toNum(r.female70) },
        ];
        setVisitorDistribution(mapped);
      }
    } catch (e) {
      console.warn('이용객 분포 조회 실패', e);
    }
  };

  // 주간/시간별 혼잡도 조회
  const fetchWeekCongestion = async (placeId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;
      const now = new Date();
      const iso = new Date(now.getTime() - now.getMilliseconds()).toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
      const url = `https://api.busanvibe.site/api/congestion/place/${placeId}/congestions?standard-time=${encodeURIComponent(iso)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
      });
      const txt = await res.text();
      console.log('주간 혼잡도 응답:', txt);
      const data = JSON.parse(txt);
      const ok = !!(data && (data.isSuccess === true || data.is_success === true));
      if (res.ok && ok && data.result) {
        const r = data.result;
        const unwrapArrayList = (v: any) => (Array.isArray(v) && v.length === 2 && v[0] === 'java.util.ArrayList') ? v[1] : (Array.isArray(v) ? v : []);
        
        const congestionsByDay = unwrapArrayList(r.congestions_by_day).map((n: any) => Number(n) || 0);
        const congestionsByTimeRaw = unwrapArrayList(r.congestions_by_time);
        const congestionsByTime = congestionsByTimeRaw.map((dayData: any) => 
          unwrapArrayList(dayData).map((n: any) => Number(n) || 0)
        );

        const standardDay = Number(r.standard_day) || 0;
        setWeekCongestionData({
          standardDay,
          standardTime: Number(r.standard_time) || 0,
          realtimeLevel: Number(r.real_time_congestion_level) || 0,
          congestionsByDay,
          congestionsByTime
        });
        
        // API의 standardDay를 기본 선택값으로 설정
        setSelectedDay(standardDay);

        console.log('주간 혼잡도 데이터 설정 완료:', {
          standardDay: r.standard_day,
          standardTime: r.standard_time,
          daysCount: congestionsByDay.length,
          timeDataCount: congestionsByTime.length
        });
      }
    } catch (e) {
      console.warn('주간 혼잡도 조회 실패', e);
    }
  };

  // 바텀시트 길찾기: 선택된 장소의 좌표 또는 주소로 네비게이션 실행
  const openDirections = async () => {
    try {
      const label = (selectedLocation as any)?.name || '';
      const address = (selectedLocation as any)?.address || '';
      let lat = Number((selectedLocation as any)?.latitude);
      let lng = Number((selectedLocation as any)?.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        // placeMarkers에서 동일 이름의 좌표 탐색 (보조 수단)
        const cand = placeMarkers.find(p => String(p.name) === String(label));
        if (cand) {
          const cLat = Number((cand as any).latitude);
          const cLng = Number((cand as any).longitude);
          if (!isNaN(cLat) && !isNaN(cLng)) {
            lat = cLat;
            lng = cLng;
          }
        }
      }

      let url = '';
      const encodedLabel = encodeURIComponent(label || address);
      const encodedAddress = encodeURIComponent(address || label);

      if (!isNaN(lat) && !isNaN(lng)) {
        if (Platform.OS === 'ios') {
          url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodedLabel}`;
        } else {
          url = `google.navigation:q=${lat},${lng}&mode=d`;
          const canOpen = await Linking.canOpenURL(url);
          if (!canOpen) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          }
        }
      } else if (address) {
        if (Platform.OS === 'ios') {
          url = `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d&q=${encodedLabel}`;
        } else {
          url = `google.navigation:q=${encodedAddress}&mode=d`;
          const canOpen = await Linking.canOpenURL(url);
          if (!canOpen) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
          }
        }
      } else {
        Alert.alert('알림', '위치 정보를 불러올 수 없습니다.');
        return;
      }

      await Linking.openURL(url);
    } catch (e) {
      console.error('길찾기 실행 실패:', e);
      Alert.alert('오류', '길찾기를 실행할 수 없습니다.');
    }
  };

  // 명소 화면으로 이동 후 해당 장소 상세 열기
  const openDetailInAttraction = () => {
    try {
      const placeParam: any = {
        id: Number((selectedLocation as any)?.id) || 0,
        name: (selectedLocation as any)?.name || '',
        congestion_level: Number((selectedLocation as any)?.congestionLevelNum || 0),
        is_like: false,
        type: 'SIGHT',
        address: (selectedLocation as any)?.address || '',
        img: undefined,
        latitude: Number((selectedLocation as any)?.latitude) || undefined,
        longitude: Number((selectedLocation as any)?.longitude) || undefined,
      };
      navigation.navigate('Main', { screen: '명소' });
      setTimeout(() => {
        navigation.navigate('PlaceDetail', { place: placeParam });
      }, 0);
    } catch (e) {
      console.error('상세 이동 실패', e);
    }
  };

  // 장소 상세 조회
  const fetchPlaceDetail = async (placeId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('알림', '로그인이 필요합니다.');
        return;
      }
      const url = `https://api.busanvibe.site/api/congestion/place/${placeId}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      const text = await res.text();
      console.log('장소 상세 응답 원본:', text);
      const data = JSON.parse(text);
      const isSuccess = !!(data && (data.isSuccess === true || data.is_success === true));
      if (res.ok && isSuccess && data.result) {
        const unwrapBigDecimal = (v: any) => (Array.isArray(v) && v[0] === 'java.math.BigDecimal') ? v[1] : v;
        const unwrapArrayList = (v: any) => (Array.isArray(v) && v.length === 2 && v[0] === 'java.util.ArrayList') ? v[1] : (Array.isArray(v) ? v : []);
        const r = data.result;
        const congestionText = (lvl: number) => {
          if (lvl >= 4) return '혼잡';
          if (lvl >= 3) return '약간혼잡';
          if (lvl >= 2) return '보통';
          return '여유';
        };
        const lat = unwrapBigDecimal(r.latitude);
        const lng = unwrapBigDecimal(r.longitude ?? r.longtitude);
        const images = unwrapArrayList(r.img_list);
        const mapped = {
          id: String(r.id),
          name: r.name,
          congestionLevel: congestionText(r.congestion_level),
          congestionLevelNum: Number(r.congestion_level || 0),
          rating: typeof r.grade === 'number' ? r.grade : Number(r.grade || 0),
          reviewCount: typeof r.review_amount === 'number' ? r.review_amount : Number(r.review_amount || 0),
          distance: '',
          address: r.address,
          status: r.is_open ? '상시 개방' : '운영 종료',
          images: images,
          latitude: lat == null ? undefined : Number(lat),
          longitude: lng == null ? undefined : Number(lng)
        } as any;
        setSelectedLocation(mapped);
        setIsBottomSheetEnabled(true);
        changeBottomSheetMode('half');
        
        // 장소 위치로 지도 이동
        const latitude = Number(lat);
        const longitude = Number(lng);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          if (webViewRef.current) {
            // 지도를 해당 장소 위치로 이동
            webViewRef.current.postMessage(JSON.stringify({
              type: 'moveToLocation',
              latitude,
              longitude,
              showCurrentLocation: false
            }));
            // 해당 장소에 핑 표시
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updatePlacePings',
              places: [{
                id: r.id,
                name: r.name,
                type: r.type || 'PLACE',
                congestion_level: Number(r.congestion_level || 0),
                latitude,
                longitude
              }]
            }));
          } else {
            // WebView가 아직 로드되지 않은 경우 예약
            pendingMoveToLocationRef.current = { lat: latitude, lng: longitude, show: false };
          }
          
          // API 호출로 주변 장소들도 가져오기
          setTimeout(() => {
            const bounds = calculateBounds(latitude, longitude, 15);
            fetchCongestionData(bounds, selectedCategory);
          }, 1000);
        }
      } else {
        console.warn('장소 상세 비정상 응답:', data);
      }
    } catch (e) {
      console.error('장소 상세 API 오류:', e);
      // 실패 시에도 알림은 띄우지 않음
    }
  };

  // 중심 좌표와 줌 레벨을 기반으로 bounds 계산
  const calculateBounds = (centerLat: number, centerLng: number, zoomLevel: number = 15) => {
    // 줌 레벨에 따른 대략적인 범위 계산 (킬로미터 단위)
    const kmPerDegree = 111; // 위도 1도당 약 111km
    const latRange = Math.pow(2, 20 - zoomLevel) * 0.01; // 줌 레벨에 따른 위도 범위
    const lngRange = latRange / Math.cos(centerLat * Math.PI / 180); // 경도는 위도에 따라 조정

    return {
      lat1: centerLat + latRange, // 좌상단 위도 (북쪽)
      lng1: centerLng - lngRange, // 좌상단 경도 (서쪽)
      lat2: centerLat - latRange, // 우하단 위도 (남쪽)
      lng2: centerLng + lngRange  // 우하단 경도 (동쪽)
    };
  };

  // 혼잡도 API 호출 (경계 좌표 사용)
  const fetchCongestionData = async (bounds: {lat1: number, lng1: number, lat2: number, lng2: number}, category: string, zoomLevel?: number) => {
    try {
      console.log('=== 혼잡도 API 호출 ===');
      console.log('좌상단 좌표 (lat1, lng1):', bounds.lat1, bounds.lng1);
      console.log('우하단 좌표 (lat2, lng2):', bounds.lat2, bounds.lng2);
      console.log('선택된 카테고리:', category);
      console.log('API 타입 변환:', getCategoryType(category));
      console.log('🔍 현재 줌 레벨:', zoomLevel || '알 수 없음');

      // AsyncStorage에서 Access Token 가져오기
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('Access Token 확인:', accessToken ? '있음' : '없음');

      if (!accessToken) {
        console.error('Access Token이 없습니다. 로그인이 필요합니다.');
        return;
      }

      const apiType = getCategoryType(category);
      const url = `https://api.busanvibe.site/api/congestion?type=${apiType}&lat1=${bounds.lat1}&lng1=${bounds.lng1}&lat2=${bounds.lat2}&lng2=${bounds.lng2}`;
      // console.log('요청 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('응답 상태:', response.status);
      const responseText = await response.text();
      console.log('응답 원본:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('=== 혼잡도 데이터 ===');

        if (data.is_success) {
          console.log('✅ API 호출 성공!');
          if (VERBOSE_CONGESTION_LOG) console.log('원본 result 구조:', data.result);
          
          // 백엔드에서 Java 객체 형태로 오는 데이터 파싱
          let placeList = data.result?.place_list;
          
          // place_list가 특수 형태인 경우 처리
          if (placeList && Array.isArray(placeList) && placeList.length === 2 && placeList[0] === "java.util.ArrayList") {
            placeList = placeList[1]; // 실제 배열 데이터는 두 번째 요소
            if (VERBOSE_CONGESTION_LOG) console.log('Java ArrayList 형태 감지 - 실제 데이터 추출');
          }

          if (Array.isArray(placeList)) {
            console.log('장소 개수:', placeList.length);
            
            // 받아진 장소들 로그로 출력 (소음 방지)
            if (VERBOSE_CONGESTION_LOG) {
              console.log('=== 받아진 장소 목록 ===');
              console.log(`요청한 카테고리: ${category} → API 타입: ${getCategoryType(category)}`);
            }
            
            // Java 객체 형태의 장소 데이터를 일반 객체로 변환
            const normalizedPlaces = placeList.map((place: any) => {
              // latitude와 longitude가 ["java.math.BigDecimal", 값] 형태인 경우 처리
              const normalizedPlace = {
                id: place.id,
                name: place.name,
                type: place.type,
                congestion_level: place.congestion_level,
                latitude: Array.isArray(place.latitude) && place.latitude[0] === "java.math.BigDecimal" 
                  ? place.latitude[1] 
                  : place.latitude,
                longitude: Array.isArray(place.longitude) && place.longitude[0] === "java.math.BigDecimal" 
                  ? place.longitude[1] 
                  : place.longitude
              };
              return normalizedPlace;
            });

            if (VERBOSE_CONGESTION_LOG) console.log('정규화된 장소 데이터 샘플:', normalizedPlaces.slice(0, 2));

            // 타입별 분류해서 로그 출력
            const typeGroups: Record<string, any[]> = {};
            normalizedPlaces.forEach((place) => {
              if (!typeGroups[place.type]) {
                typeGroups[place.type] = [];
              }
              typeGroups[place.type].push(place);
            });
            
            if (VERBOSE_CONGESTION_LOG) {
              Object.keys(typeGroups).forEach(type => {
                console.log(`\n📍 ${type} 타입 (${typeGroups[type].length}개):`);
                typeGroups[type].forEach((place, index) => {
                  console.log(`  ${index + 1}. ${place.name} - 혼잡도: ${place.congestion_level} - 위치: ${place.latitude}, ${place.longitude}`);
                });
              });
              console.log('========================');
            }

            // WebView에 장소 핑 데이터 전송 (정규화된 데이터 사용) - 장소가 있을 때만
            if (webViewRef.current && normalizedPlaces.length > 0) {
              const updateMessage = JSON.stringify({
                type: 'updatePlacePings',
                places: normalizedPlaces
              });
              console.log('📤 WebView로 메시지 전송 중...', {
                messageType: 'updatePlacePings',
                placesCount: normalizedPlaces.length,
                firstPlace: normalizedPlaces[0]
              });
              webViewRef.current.postMessage(updateMessage);
              console.log('✅ WebView에 정규화된 장소 핑 데이터 전송 완료');
            } else if (!webViewRef.current) {
              console.log('❌ WebView 전송 실패 - webViewRef 없음');
            } else if (normalizedPlaces.length === 0) {
              console.log('ℹ️ 반환된 장소 없음 - WebView로 핑 전송 생략');
            }

            // 상태는 정규화된 데이터로 업데이트
            setPlaceMarkers(normalizedPlaces);
          } else {
            console.error('❌ place_list가 배열이 아님:', typeof placeList, placeList);
          }
        } else {
          console.error('❌ API 응답 실패:', data.message);
        }
      } else {
        console.error('API 호출 실패:', response.status);
      }
    } catch (error) {
      console.error('혼잡도 API 오류:', error);
    }
  };

  // 지도 변경 완료 시 API 호출 (bounds 사용)
  const handleMapBoundsChange = (bounds: {lat1: number, lng1: number, lat2: number, lng2: number}, isZoomOnly: boolean = false, zoomLevel?: number) => {

    // 마지막 지도 경계 저장
    lastMapBoundsRef.current = bounds;

    // 지도 재렌더링 방지: mapCenter 상태는 변경하지 않음
    // 현재 위치 핑은 드래그/줌과 무관하게 계속 보이도록, 숨기지 않음

    // 기존 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // API 호출 (줌 변경은 더 짧은 딜레이, 드래그는 기존 딜레이)
    const delay = isZoomOnly ? 500 : 1000;
    debounceTimerRef.current = setTimeout(() => {
      console.log(isZoomOnly ? '줌 변경 완료 - API 호출 시작' : '드래그 완료 - API 호출 시작');
      fetchCongestionData(bounds, selectedCategory, zoomLevel);
    }, delay);
  };

  // 현재 위치 가져오기 (새로운 LocationService 사용)
  const getCurrentLocation = async () => {
    console.log('=== 빠른 현재 위치 가져오기 시작 ===');
    
    try {
      // fastRefreshLocation을 사용하여 캐시된 위치를 우선 사용
      const location = await fastRefreshLocation();
      
      if (location) {
        console.log('✅ 위치 획득 성공 (캐시 또는 새로 요청):', location.latitude, location.longitude);
        
        const currentPos = { latitude: location.latitude, longitude: location.longitude };
        
        // 기존 state 업데이트
        setCurrentLocation(currentPos);
        setShouldShowCurrentLocation(true);
        
        // 지도 이동 및 현재위치 핑 표시
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'setCurrentLocationPing',
            latitude: location.latitude,
            longitude: location.longitude
          }));
          webViewRef.current.postMessage(JSON.stringify({
            type: 'moveToLocation',
            latitude: location.latitude,
            longitude: location.longitude,
            showCurrentLocation: false
          }));
        } else {
          pendingCurrentLocationPingRef.current = { lat: location.latitude, lng: location.longitude };
          pendingMoveToLocationRef.current = { lat: location.latitude, lng: location.longitude, show: false };
        }

        // API 호출 (bounds 사용)
        setTimeout(() => {
          const bounds = calculateBounds(location.latitude, location.longitude, 15);
          fetchCongestionData(bounds, selectedCategory);
        }, 1000);

        console.log('📍 현재 위치로 이동 완료');
      } else {
        console.warn('위치를 가져올 수 없음');
        Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해 주세요.');
      }
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      Alert.alert('위치 오류', '위치 서비스에 문제가 발생했습니다.');
    }
  };

  // 혼잡도 레벨에 따른 마커 색상 결정
  const getCongestionColor = (level: number): string => {
    if (level >= 4) return '#ff4444'; // 매우 혼잡 - 빨간색
    if (level >= 3) return '#ff8800'; // 혼잡 - 주황색
    if (level >= 2) return '#ffcc00'; // 보통 - 노란색
    return '#44ff44'; // 여유 - 초록색
  };

  // 지도 HTML 생성
  const getMapHTML = () => {
    if (!mapCenter) return '<html><body>Loading...</body></html>';
    // 초기 렌더는 중심좌표만 넘기고, 현재위치/마커는 postMessage로만 제어 (재로딩 방지)
    return createMapHTML({
      centerLat: mapCenter.latitude,
      centerLng: mapCenter.longitude,
      currentLocation: null,
      shouldShowCurrentLocation: false,
      placeMarkers: []
    });
  };

  // 바텀시트 3단계 모드: 'minimized', 'half', 'full'
  const [bottomSheetMode, setBottomSheetMode] = useState<'minimized' | 'half' | 'full'>('minimized');
  const bottomSheetHeight = useRef(
    new Animated.Value(40), // 초기에는 최소화된 상태로 시작 (핸들만 보이게)
  ).current;
  const [isBottomSheetEnabled, setIsBottomSheetEnabled] = useState(false);

  // 바텀시트 높이 계산
  const getBottomSheetHeight = (mode: 'minimized' | 'half' | 'full') => {
    switch (mode) {
      case 'minimized':
        return 40; // 핸들만 보이는 높이
      case 'half':
        return screenHeight * 0.5; // 화면의 절반
      case 'full':
        return screenHeight * 0.9; // 거의 전체 화면
      default:
        return 40;
    }
  };

  // 바텀시트 모드 변경 함수
  const changeBottomSheetMode = (mode: 'minimized' | 'half' | 'full') => {
    setBottomSheetMode(mode);
    Animated.spring(bottomSheetHeight, {
      toValue: getBottomSheetHeight(mode),
      useNativeDriver: false,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      const currentHeight = getBottomSheetHeight(bottomSheetMode);
      const newHeight = currentHeight - gestureState.dy;
      
      // 최소 40px, 최대 90% 높이로 제한
      if (newHeight >= 40 && newHeight <= screenHeight * 0.9) {
        bottomSheetHeight.setValue(newHeight);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const currentHeight = getBottomSheetHeight(bottomSheetMode);
      const finalHeight = currentHeight - gestureState.dy;
      
      // 드래그 거리에 따라 모드 결정
      if (gestureState.dy > 100) {
        // 아래로 많이 드래그 - 한 단계 아래로
        if (bottomSheetMode === 'full') {
          changeBottomSheetMode('half');
        } else if (bottomSheetMode === 'half') {
          changeBottomSheetMode('minimized');
        } else {
          changeBottomSheetMode('minimized');
        }
      } else if (gestureState.dy < -100) {
        // 위로 많이 드래그 - 한 단계 위로
        if (bottomSheetMode === 'minimized') {
          changeBottomSheetMode('half');
        } else if (bottomSheetMode === 'half') {
          changeBottomSheetMode('full');
        } else {
          changeBottomSheetMode('full');
        }
      } else {
        // 드래그 거리가 적으면 현재 위치에서 가장 가까운 모드로
        const halfHeight = screenHeight * 0.5;
        const fullHeight = screenHeight * 0.9;
        
        if (finalHeight < halfHeight / 2) {
          changeBottomSheetMode('minimized');
        } else if (finalHeight < (halfHeight + fullHeight) / 2) {
          changeBottomSheetMode('half');
        } else {
          changeBottomSheetMode('full');
        }
      }
    },
  });

  const handleOpenDirections = async () => {
    try {
      const label = selectedLocation?.name || '';
      const address = selectedLocation?.address || '';
      const lat = Number((selectedLocation as any)?.latitude);
      const lng = Number((selectedLocation as any)?.longitude);
      const hasCoords = !isNaN(lat) && !isNaN(lng);

      let url = '';
      if (hasCoords) {
        if (Platform.OS === 'ios') {
          url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodeURIComponent(label)}`;
        } else {
          url = `google.navigation:q=${lat},${lng}&mode=d`;
          const canOpen = await Linking.canOpenURL(url);
          if (!canOpen) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          }
        }
      } else if (address) {
        const encodedAddress = encodeURIComponent(address);
        const encodedLabel = encodeURIComponent(label || address);
        if (Platform.OS === 'ios') {
          url = `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d&q=${encodedLabel}`;
        } else {
          url = `google.navigation:q=${encodedAddress}&mode=d`;
          const canOpen = await Linking.canOpenURL(url);
          if (!canOpen) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
          }
        }
      } else {
        Alert.alert('알림', '위치 정보를 불러올 수 없습니다.');
        return;
      }

      await Linking.openURL(url);
    } catch (e) {
      console.error('길찾기 실행 실패', e);
      Alert.alert('오류', '길찾기 앱을 열 수 없습니다.');
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category
                ? styles.selectedCategory
                : styles.unselectedCategory,
            ]}
            onPress={() => {
              setSelectedCategory(category);
              // 카테고리 변경 시 현재 지도 경계로 API 호출 (즉시 호출)
              if (lastMapBoundsRef.current) {
                fetchCongestionData(lastMapBoundsRef.current, category);
              } else if (mapCenter) {
                // 초기 로드 시에만 mapCenter 사용
                const bounds = calculateBounds(mapCenter.latitude, mapCenter.longitude, 15);
                fetchCongestionData(bounds, category);
              }
            }}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {isLocationLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0057cc" style={{ marginBottom: 8 }} />
            <Text style={styles.loadingText}>현재 위치를 가져오는 중...</Text>
          </View>
        ) : mapCenter ? (
          <WebView
            key={mapKey} // 강제 리렌더링
            ref={webViewRef}
            source={{ html: getMapHTML() }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false} // 더 부드러운 로딩을 위해 false로 변경
            cacheEnabled={false} // 지도 캐싱 비활성화 (줌/드래그 이슈 방지)
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="compatibility"
            androidLayerType="software"
            // mixedContentMode="always"
            // androidHardwareAccelerationDisabled={false}
            bounces={false} // iOS에서 바운스 효과 비활성화
            scrollEnabled={false} // WebView 자체 스크롤 비활성화
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scalesPageToFit={false} // 페이지 스케일링 비활성화
            originWhitelist={['*']} // 모든 origin 허용
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>지도 로딩 중...</Text>
              </View>
            )}
            onLoadStart={() => {
              console.log('WebView 로딩 시작', {
                reason: webViewReloadReasonRef.current || 'unknown',
                mapCenter,
                isInitialLoad,
                isLocationLoading
              });
            }}
            onLoadEnd={() => {
              console.log('WebView 로딩 완료', {
                reason: webViewReloadReasonRef.current || 'unknown',
                mapCenter
              });
              // 로드 완료 후 대기 중이던 moveToLocation 실행
              if (webViewRef.current && pendingMoveToLocationRef.current) {
                const { lat, lng, show } = pendingMoveToLocationRef.current;
                webViewRef.current.postMessage(JSON.stringify({
                  type: 'moveToLocation',
                  latitude: lat,
                  longitude: lng,
                  showCurrentLocation: show
                }));
                pendingMoveToLocationRef.current = null;
              }
              // 초기 렌더 직후 현재 지도 중심 기준 경계로 즉시 API 호출 및 표시
              if (!initialBoundsRequestedRef.current && mapCenter) {
                initialBoundsRequestedRef.current = true;
                const initialBounds = calculateBounds(mapCenter.latitude, mapCenter.longitude, 15);
                lastMapBoundsRef.current = initialBounds;
                fetchCongestionData(initialBounds, selectedCategory);
              }
              // 로드 완료 후 현재위치 핑 예약 실행
              if (webViewRef.current && pendingCurrentLocationPingRef.current) {
                const { lat, lng } = pendingCurrentLocationPingRef.current;
                webViewRef.current.postMessage(JSON.stringify({
                  type: 'setCurrentLocationPing',
                  latitude: lat,
                  longitude: lng
                }));
                pendingCurrentLocationPingRef.current = null;
              }
              // 혹시 예약이 없더라도 현재위치가 있다면 점을 보장
              if (webViewRef.current && currentLocation) {
                webViewRef.current.postMessage(JSON.stringify({
                  type: 'setCurrentLocationPing',
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude
                }));
              }
              webViewReloadReasonRef.current = null;
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView 오류:', nativeEvent);
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'dragStart') {
                  setIsMapDragging(true);
                  console.log('드래그 시작 - API 호출 일시 중단');
                } else if (data.type === 'dragEnd') {
                  setIsMapDragging(false);
                  console.log('📍 드래그 종료 - API 호출 재개, 줌 레벨:', data.zoomLevel || '알 수 없음');
                  // 드래그 완료 후 API 호출 (bounds 사용)
                  if (data.bounds) {
                    handleMapBoundsChange(data.bounds, false, data.zoomLevel);
                  }
                } else if (data.type === 'zoomChanged') {
                  console.log('🔍 줌 변경 감지 - 줌 레벨:', data.zoomLevel || '알 수 없음');
                  // 줌 변경 시에도 API 호출 (단, 드래그 중이 아닐 때만)
                  if (!isMapDragging && data.bounds) {
                    handleMapBoundsChange(data.bounds, true, data.zoomLevel); // 줌만 변경됨을 표시
                  }
                } else if (data.type === 'poiClicked') {
                  console.log('📌 장소 핑 클릭 수신:', data);
                  // 우선 이름이라도 보이게 즉시 바텀시트 열기
                  if (data && data.name) {
                    setSelectedLocation({
                      id: String(data.placeId || data.id || ''),
                      name: data.name,
                      congestionLevel: '',
                      rating: 0,
                      reviewCount: 0,
                      distance: '',
                      address: '',
                      status: '',
                      images: []
                    } as any);
                    setIsBottomSheetEnabled(true);
                    changeBottomSheetMode('half');
                  }
                  const pid = typeof data.placeId === 'number' ? data.placeId : (typeof data.id === 'string' && data.id.startsWith('poi-') ? Number(data.id.replace('poi-', '')) : NaN);
                  if (!isNaN(pid)) {
                    // 상세 + 실시간 + 분포 + 주간 혼잡도 병렬 호출
                    fetchPlaceDetail(pid);
                    fetchRealtimeCongestion(pid);
                    fetchVisitorDistribution(pid);
                    fetchWeekCongestion(pid);
                  }
                }
              } catch (error) {
                console.error('WebView 메시지 파싱 오류:', error);
              }
            }}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>지도 초기화 중...</Text>
          </View>
        )}

        {/* Current Location Button */}
        <Animated.View
          style={[
            styles.currentLocationButtonContainer,
            {
              bottom: isBottomSheetEnabled ? Animated.add(bottomSheetHeight, 20) : 20,
            },
          ]}>
          <TouchableOpacity
            style={[styles.currentLocationButton, isLocationLoading && { opacity: 0.6 }]}
            onPress={getCurrentLocation}
            disabled={isLocationLoading}>
            {isLocationLoading ? (
              <ActivityIndicator size="small" color="#333333" />
            ) : (
              <Text style={styles.compassText}>⊕</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Sheet */}
      {isBottomSheetEnabled && (
      <Animated.View
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.bottomSheetHandle}
          onPress={() => {
            if (bottomSheetMode === 'minimized') {
              changeBottomSheetMode('half');
            } else if (bottomSheetMode === 'half') {
              changeBottomSheetMode('full');
            } else {
              changeBottomSheetMode('minimized');
            }
          }}
          activeOpacity={0.7}>
          <View style={styles.handle} />
          {bottomSheetMode === 'minimized' && (
            <Text style={styles.minimizedText}>위로 드래그하여 장소 정보 보기</Text>
          )}
        </TouchableOpacity>

        {bottomSheetMode !== 'minimized' && (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <View style={styles.nameAndBadge}>
                  <Text style={styles.locationName}>{selectedLocation.name}</Text>
                  <CongestionBadge level={selectedLocation.congestionLevelNum || 0} style={{ marginRight: 8 }} />
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => changeBottomSheetMode('minimized')}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.locationDetails}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.rating}>4.2</Text>
                  <Text style={styles.reviewCount}>리뷰 157개</Text>
                  {selectedLocation.distance ? (
                    <Text style={styles.distance}>
                      | {selectedLocation.distance}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressIcon}>📍</Text>
                  <Text style={styles.address}>{selectedLocation.address}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.clockIcon}>🕐</Text>
                  <Text style={styles.status}>{selectedLocation.status || '상시 개방'}</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}>
                {selectedLocation.images && selectedLocation.images.length > 0 ? (
                  selectedLocation.images.map((uri: string, index: number) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                    </View>
                  ))
                ) : (
                  [0,1,2,3].map((i) => (
                    <View key={i} style={styles.imageContainer}>
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.imageText}>이미지 없음</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* 주간/시간별 혼잡도 */}
              <View style={styles.chartSection}>
                <View style={styles.realtimeSection}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>혼잡도 정보</Text>
                    <Text style={styles.weekSummarySubtitle}>최근 한달 기준</Text>
                  </View>
                  
                  {/* 실시간 혼잡도 상태 */}
                  <View style={styles.congestionStatus}>
                    <View style={[styles.congestionIndicator, { backgroundColor: weekCongestionData ? getCongestionColor(weekCongestionData.realtimeLevel) : '#ff4444' }]} />
                    <Text style={[styles.congestionStatusText, { color: weekCongestionData ? getCongestionColor(weekCongestionData.realtimeLevel) : '#ff4444' }]}>
                      {weekCongestionData ? getCongestionTextLocal(weekCongestionData.realtimeLevel) : '혼잡'}
                    </Text>
                  </View>

                  {/* 요일별 평균 혼잡도 */}
                  {weekCongestionData && weekCongestionData.congestionsByDay.length > 0 && (
                    <View style={styles.weekSummary}>
                      <Text style={styles.weekSummaryTitle}>요일별 혼잡도</Text>
                      <View style={styles.weekBars}>
                        {weekCongestionData.congestionsByDay.map((val: number, index: number) => {
                          const max = Math.max(...weekCongestionData.congestionsByDay, 1);
                          const height = Math.max(8, Math.round((val / max) * 60));
                          const isSelected = selectedDay === index;
                          const isToday = index === weekCongestionData.standardDay;
                          
                          return (
                            <TouchableOpacity 
                              key={index} 
                              style={styles.weekBarContainer}
                              onPress={() => setSelectedDay(index)}>
                              <View style={[
                                styles.weekBar, 
                                { 
                                  height, 
                                  backgroundColor: isSelected ? getCongestionColor(val) : (isToday ? '#ffcccc' : '#d0d0d0')
                                }
                              ]} />
                              <Text style={[
                                styles.weekBarLabel, 
                                isSelected && styles.selectedWeekLabel,
                                isToday && styles.todayLabel
                              ]}>
                                {['월', '화', '수', '목', '금', '토', '일'][index]}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* 시간별 혼잡도 차트 */}
                  {weekCongestionData && weekCongestionData.congestionsByTime.length > 0 && (
                    <View style={styles.timeSection}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.timeSectionTitle}>예상 시간별 혼잡도</Text>
                        <Text style={{ color: '#999999', fontSize: 11 }}>(명/시간)</Text>
                      </View>
                      <View style={styles.chartWrapper}>
                        {(() => {
                          const dayDataRaw = weekCongestionData.congestionsByTime[selectedDay] || [];
                          const timeDataRaw = dayDataRaw.slice(6, 24).map((v: any) => Number(v) || 0);
                          // 값(1~5미만)을 1000배 하여 '명' 단위의 정수로 환산
                          const timeDataCounts = timeDataRaw.map(v => Math.round(v * 1000));
                          const maxCount = Math.max(...timeDataCounts, 1);
                          const topTick = Math.ceil(maxCount / 1000) * 1000;
                          const step = Math.max(1000, Math.ceil(topTick / 5 / 1000) * 1000);
                          const ticks: number[] = [];
                          for (let t = topTick; t >= 0; t -= step) {
                            ticks.push(t);
                          }
                          const formatCount = (n: number) => {
                            const thousands = Math.round(Math.max(0, n));
                            return thousands.toLocaleString('ko-KR');
                          };
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%' }}>
                              <View style={[styles.yAxisContainer, { height: 130, marginRight: 8 }]}>
                                <View style={{ height: 80, marginTop: 20, marginBottom: 20, justifyContent: 'space-between' }}>
                                  {ticks.map((t, i) => (
                                    <Text key={i} style={styles.yAxisLabel}>{formatCount(t)}</Text>
                                  ))}
                                </View>
                              </View>
                              <View style={styles.timeChartContainer}>
                                {timeDataCounts.map((count: number, idx: number) => {
                                  const actualHour = idx + 6;
                                  const height = Math.max(1, Math.round((count / (topTick || 1)) * 80));
                                  // 현재 시간인지 확인 (선택된 요일이 오늘이고, 현재 시간과 같을 때)
                                  const isCurrentTime = selectedDay === weekCongestionData.standardDay && actualHour === weekCongestionData.standardTime;
                                  const backgroundColor = isCurrentTime ? getCongestionColor(timeDataRaw[idx]) : '#b7b7b7';
                                  // 06, 09, 12, 15, 18, 21시 라벨 표시
                                  const shouldShowLabel = [6, 9, 12, 15, 18, 21].includes(actualHour);
                                  const label = shouldShowLabel ? String(actualHour).padStart(2, '0') : '';
                                  return (
                                    <View key={actualHour} style={styles.timeBarContainer}>
                                      <View style={[styles.timeBar, { height, backgroundColor }]} />
                                      {shouldShowLabel && <Text style={styles.timeBarLabel}>{label}</Text>}
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          );
                        })()}
                      </View>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  {(() => {
                    if (!selectedLocation?.name || !weekCongestionData?.congestionsByDay?.length) {
                      return "오후 7시 이후에는 비교적 여유로울 전망입니다.";
                    }
                    
                    // 가장 혼잡도가 낮은 요일 찾기
                    const congestionsByDay = weekCongestionData.congestionsByDay;
                    const minCongestionValue = Math.min(...congestionsByDay);
                    const minDayIndex = congestionsByDay.findIndex(val => val === minCongestionValue);
                    const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
                    const minDayName = dayNames[minDayIndex] || '평일';
                    
                    const placeName = selectedLocation.name;
                    const isVowel = /^[aeiouAEIOU가-기나-니다-디라-리마-미바-비사-시아-이자-지차-치카-키타-티파-피하-히]/.test(placeName);
                    const particle = isVowel ? '는' : '은';
                    
                    return `${placeName}${particle} ${minDayName}에 비교적 여유로울 전망입니다.`;
                  })()}
                </Text>
              </View>

              {/* 이용객 분포 */}
              <View style={styles.chartSection}>
                <View style={styles.visitorSection}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>이용객 분포</Text>
                    <View style={styles.legend}>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendColor, { backgroundColor: '#6bb6ff' }]}
                        />
                        <Text style={styles.legendText}>남성</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendColor, { backgroundColor: '#ff9999' }]}
                        />
                        <Text style={styles.legendText}>여성</Text>
                      </View>
                    </View>
                  </View>

                  {(() => {
                    const dist = visitorDistribution || visitorData;
                    const maxVal = Math.max(
                      ...dist.map((d: any) => Math.max(Number(d.male) || 0, Number(d.female) || 0)),
                      1
                    );
                    const topTick = Math.max(30, Math.ceil(maxVal / 10) * 10);
                    const ticks = Array.from({ length: Math.floor(topTick / 10) + 1 }, (_, i) => i * 10).reverse();
                    return (
                      <View style={styles.visitorChartRow}>
                        <View style={styles.yAxisContainer}>
                          {ticks.map((t, i) => (
                            <Text key={i} style={styles.yAxisLabel}>{t}%</Text>
                          ))}
                        </View>
                        <View style={styles.visitorChartContainer}>
                          {dist.map((item: any, index: number) => (
                            <View key={index} style={styles.visitorBarGroup}>
                              <View style={styles.visitorBars}>
                                <View
                                  style={[
                                    styles.visitorBar,
                                    { height: Math.max(4, Math.round(((Number(item.male) || 0) / topTick) * 100)), backgroundColor: '#6bb6ff' },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.visitorBar,
                                    { height: Math.max(4, Math.round(((Number(item.female) || 0) / topTick) * 100)), backgroundColor: '#ff9999' },
                                  ]}
                                />
                              </View>
                              <Text style={styles.visitorLabel}>{item.age}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </View>

              {/* 버튼들 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.detailButton} onPress={openDetailInAttraction}>
                  <Text style={styles.detailButtonText}>상세보기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} onPress={handleOpenDirections}>
                  <Text style={styles.favoriteButtonText}>길찾기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </Animated.View>
      )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    zIndex: 5, // 바텀시트보다 낮게 설정
    elevation: 5, // elevation도 낮게
  },
  categoryButton: {
    flex: 1, // 균등하게 공간 분할
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4, // 버튼 간 작은 간격
  },
  selectedCategory: {
    backgroundColor: '#0057cc',
  },
  unselectedCategory: {
    backgroundColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#ffffff',
  },
  unselectedText: {
    color: '#333333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  currentLocationButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  currentLocationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  compassText: {
    fontSize: 20,
    color: '#333333',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 20, // elevation을 더 높게
    zIndex: 20, // zIndex 추가
  },
  scrollContent: {
    flex: 1,
  },
  bottomSheetHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#cccccc',
    borderRadius: 2,
  },
  minimizedText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  locationInfo: {
    paddingHorizontal: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8, // 이름과 배지 사이 간격
    lineHeight: 26,
  },
  congestionBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  congestionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '300',
  },
  locationDetails: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 16,
    color: '#ffd700',
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  distance: {
    fontSize: 14,
    color: '#666666',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  address: {
    fontSize: 14,
    color: '#666666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  status: {
    fontSize: 14,
    color: '#666666',
  },
  imageScrollView: {
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 8,
  },
  imagePlaceholder: {
    width: 120,
    height: 80,
    backgroundColor: '#87CEEB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eaeaea',
  },
  imageText: {
    fontSize: 12,
    color: '#ffffff',
  },
  chartSection: {
    marginTop: 24,
    paddingBottom: 8,
  },
  visitorSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  chartTime: {
    fontSize: 12,
    color: '#999999',
  },
  congestionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  congestionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  congestionStatusText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: '#cccccc',
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666666',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1976d2',
    flex: 1,
  },
  realtimeSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    paddingBottom: 5,
  },
  chartWrapper: {
    position: 'relative',
    height: 140,
  },
  chartBaseline: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 24,
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  visitorChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxisContainer: {
    width: 32,
    height: 100,
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'right',
    marginBottom: 1,
  },
  visitorChartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  visitorBarGroup: {
    alignItems: 'center',
    flex: 1,
  },
  visitorBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  visitorBar: {
    width: 16,
    borderRadius: 2,
  },
  visitorLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#6bb6ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  favoriteButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  // 새로운 차트 스타일들
  dayTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedDayTab: {
    backgroundColor: '#0057cc',
  },
  todayDayTab: {
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  dayTabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  selectedDayTabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  todayDayTabText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  timeChartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  timeBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 1,
    height: 120,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  timeBar: {
    width: 12,
    backgroundColor: '#b7b7b7',
    borderRadius: 1,
    position: 'absolute',
    bottom: 20,
  },
  timeBarLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  weekSummary: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  weekSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  weekSummarySubtitle: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 16,
  },
  weekBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  weekBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  weekBar: {
    width: 32,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    marginBottom: 8,
  },
  weekBarLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  todayLabel: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  selectedWeekLabel: {
    color: '#333333',
    fontWeight: 'bold',
  },
  timeSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
});

export default CongestionScreen;