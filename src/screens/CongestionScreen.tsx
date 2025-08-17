import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMapHTML } from '../components/map/mapTemplate';

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

const categories = ['관광명소', '맛집', '카페', '편의점'];
const { height: screenHeight } = Dimensions.get('window');

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

const CongestionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('관광명소');
  const [selectedLocation, setSelectedLocation] = useState(locationData[0]);
  const [mapKey, setMapKey] = useState(0); // WebView 강제 리렌더링용
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<Location | null>(null); // 현재 위치 로드 후 설정
  const [placeMarkers, setPlaceMarkers] = useState<PlaceMarker[]>([]); // API에서 받은 장소들
  const [isMapDragging, setIsMapDragging] = useState(false); // 지도 드래그 상태
  const [shouldShowCurrentLocation, setShouldShowCurrentLocation] = useState(false); // 현재위치 표시 여부
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로드 상태
  const [isLocationLoading, setIsLocationLoading] = useState(true); // 위치 로딩 상태
  const webViewRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<CachedLocation | null>(null);
  const isUpdatingMapRef = useRef(false); // 지도 업데이트 중인지 확인

  // 컴포넌트 마운트 시 현재 위치 자동 획득
  React.useEffect(() => {
    console.log('=== CongestionScreen 마운트 - 현재 위치 자동 획득 시작 ===');
    getCurrentLocation();
  }, []);

  // 카테고리를 API 타입으로 변환
  const getCategoryType = (category: string): string => {
    const categoryMap: Record<string, string> = {
      '관광명소': 'SIGHT',
      '맛집': 'RESTAURANT',
      '카페': 'CAFE',
      '편의점': 'CONVSTORE',
    };
    return categoryMap[category] || 'ALL';
  };

  // 혼잡도 API 호출
  const fetchCongestionData = async (latitude: number, longitude: number, category: string) => {
    try {
      console.log('=== 혼잡도 API 호출 ===');
      console.log('위도:', latitude);
      console.log('경도:', longitude);
      console.log('카테고리:', category);

      // AsyncStorage에서 Access Token 가져오기
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('Access Token 확인:', accessToken ? '있음' : '없음');

      if (!accessToken) {
        console.error('Access Token이 없습니다. 로그인이 필요합니다.');
        return;
      }

      const apiType = getCategoryType(category);
      const url = `https://api.busanvibe.site/api/congestion?type=${apiType}&latitude=${latitude}&longitude=${longitude}`;
      console.log('요청 URL:', url);

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
          const placeList = data.result?.place_list;

          if (Array.isArray(placeList)) {
            console.log('장소 개수:', placeList.length);
            setPlaceMarkers(placeList);

            // WebView에 새로운 마커 데이터 전송 (WebView 재렌더링 없이)
            if (webViewRef.current && !isMapDragging) {
              const updateMessage = JSON.stringify({
                type: 'updateMarkers',
                markers: placeList
              });
              webViewRef.current.postMessage(updateMessage);
              console.log('WebView에 마커 업데이트 메시지 전송');
            }
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

  // 지도 드래그 완료 시 API 호출
  const handleMapCenterChange = (latitude: number, longitude: number) => {
    console.log('=== 지도 중심 좌표 변경 ===');
    console.log('새로운 중심:', latitude, longitude);

    setMapCenter({ latitude, longitude });
    
    // 사용자가 지도를 드래그했으므로 현재 위치 표시 비활성화
    setShouldShowCurrentLocation(false);
    
    // WebView에 현재 위치 마커 숨기기 메시지 전송
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'hideCurrentLocation'
      }));
    }

    // 기존 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 1초 후에 API 호출 (드래그가 완료된 후) - 시간 단축
    debounceTimerRef.current = setTimeout(() => {
      console.log('드래그 완료 - API 호출 시작');
      fetchCongestionData(latitude, longitude, selectedCategory);
    }, 1000);
  };

    // 현재 위치 가져오기 (실제 기기 위치)
  const getCurrentLocation = async () => {
    console.log('=== 현재 위치 가져오기 시작 ===');
    setIsLocationLoading(true);
    
    try {
      // 최근 위치 캐시 확인 (30초 이내) - 버튼 클릭 시에만 사용
      const now = Date.now();
      if (!isInitialLoad && lastLocationRef.current && now - lastLocationRef.current.timestamp < 30000) {
        console.log('캐시된 위치 사용');
        const cachedLocation = lastLocationRef.current;
        setCurrentLocation(cachedLocation);
        setShouldShowCurrentLocation(true);
        setMapCenter({ latitude: cachedLocation.latitude, longitude: cachedLocation.longitude });
        setIsLocationLoading(false);
        
        // 지도 중심을 캐시된 위치로 이동 (WebView 재렌더링 없이)
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'moveToLocation',
            latitude: cachedLocation.latitude,
            longitude: cachedLocation.longitude,
            showCurrentLocation: true
          }));
        }

        // API 호출
        setTimeout(() => {
          fetchCongestionData(cachedLocation.latitude, cachedLocation.longitude, selectedCategory);
        }, 1000);

        console.log('캐시된 현재 위치로 이동 완료');
        return;
      }

      // Android 권한 요청
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // 더 정확한 위치를 위해 FINE_LOCATION 사용
          {
            title: '위치 권한 요청',
            message: '현재 위치를 확인하기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('위치 권한이 거부됨');
          if (isInitialLoad) {
            // 초기 로드 시 권한이 거부되면 부산 중심으로 설정 (앱 주제에 맞게)
            const defaultLocation = { latitude: 35.1796, longitude: 129.0756 }; // 부산 중심
            setMapCenter(defaultLocation);
            setCurrentLocation(null);
            setShouldShowCurrentLocation(false);
            setIsInitialLoad(false);
            setIsLocationLoading(false);
            setMapKey(prev => prev + 1); // 초기 로드는 재렌더링 필요

            setTimeout(() => {
              fetchCongestionData(defaultLocation.latitude, defaultLocation.longitude, selectedCategory);
            }, 1000);

            console.log('권한 거부 - 부산 중심으로 설정');
          } else {
            Alert.alert('권한 거부', '위치 권한이 거부되었습니다.');
            setIsLocationLoading(false);
          }
          return;
        }
      }

      console.log('위치 정보 요청 중...');

      // 현재 위치 가져오기
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('✅ 현재 위치 획득 성공:', latitude, longitude, '정확도:', accuracy + 'm');

          const currentPos = { latitude, longitude };

          // 위치 캐시 저장
          lastLocationRef.current = {
            latitude,
            longitude,
            timestamp: Date.now(),
          };

          setCurrentLocation(currentPos);
          setShouldShowCurrentLocation(true);
          setMapCenter({ latitude, longitude });
          setIsInitialLoad(false);
          setIsLocationLoading(false);

          // 초기 로드가 아닌 경우 WebView 재렌더링 없이 지도 중심 이동
          if (isInitialLoad) {
            // 초기 로드 시에만 WebView 재렌더링
            isUpdatingMapRef.current = true;
            setMapKey(prev => prev + 1);
          } else {
            // 이후 현재위치 버튼 클릭 시에는 지도 중심만 이동
            if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'moveToLocation',
                latitude,
                longitude,
                showCurrentLocation: true
              }));
            }
          }

          // API 호출은 지도 로딩 후에
          setTimeout(() => {
            fetchCongestionData(latitude, longitude, selectedCategory);
            isUpdatingMapRef.current = false;
          }, 1000);

          console.log('현재 위치 지도 업데이트 완료');
        },
        (error) => {
          console.error('❌ 위치 가져오기 실패:', error.code, error.message);

          let defaultLocation: Location;
          let errorMessage = '';

          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = '위치 권한이 거부되었습니다.';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case 3: // TIMEOUT
              errorMessage = '위치 요청 시간이 초과되었습니다.';
              break;
            default:
              errorMessage = '위치를 가져올 수 없습니다.';
          }

          if (isInitialLoad) {
            // 초기 로드 시 실패하면 부산 중심으로 설정
            defaultLocation = { latitude: 35.1796, longitude: 129.0756 }; // 부산 중심
            console.log('초기 로드 실패 - 부산 중심으로 설정');
            
            setCurrentLocation(null);
            setShouldShowCurrentLocation(false);
            setMapCenter(defaultLocation);
            setIsInitialLoad(false);
            setIsLocationLoading(false);

            isUpdatingMapRef.current = true;
            setMapKey(prev => prev + 1);

            // API 호출은 지도 로딩 후에
            setTimeout(() => {
              fetchCongestionData(defaultLocation.latitude, defaultLocation.longitude, selectedCategory);
              isUpdatingMapRef.current = false;
            }, 1000);
          } else {
            // 버튼 클릭 시 실패하면 사용자에게 알림
            Alert.alert('위치 오류', errorMessage);
            setIsLocationLoading(false);
            return;
          }

          console.log('기본 위치로 설정 완료');
        },
        {
          enableHighAccuracy: true, // 더 정확한 위치 요청
          timeout: 15000, // 15초 타임아웃
          maximumAge: 60000, // 1분간 캐시된 위치 사용
        }
      );
    } catch (error) {
      console.error('위치 권한 요청 실패:', error);

      if (isInitialLoad) {
        // 초기 로드 시 오류가 발생하면 부산 중심으로 설정
        const defaultLocation: Location = { latitude: 35.1796, longitude: 129.0756 }; // 부산 중심
        setMapCenter(defaultLocation);
        setCurrentLocation(null);
        setShouldShowCurrentLocation(false);
        setIsInitialLoad(false);
        setIsLocationLoading(false);
        setMapKey(prev => prev + 1);

        setTimeout(() => {
          fetchCongestionData(defaultLocation.latitude, defaultLocation.longitude, selectedCategory);
        }, 1000);

        console.log('권한 요청 실패 - 부산 중심으로 설정');
      }
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
    
    return createMapHTML({
      centerLat: mapCenter.latitude,
      centerLng: mapCenter.longitude,
      currentLocation,
      shouldShowCurrentLocation,
      placeMarkers
    });
  };

  // 바텀시트 3단계 모드: 'minimized', 'half', 'full'
  const [bottomSheetMode, setBottomSheetMode] = useState<'minimized' | 'half' | 'full'>('minimized');
  const bottomSheetHeight = useRef(
    new Animated.Value(40), // 초기에는 최소화된 상태로 시작 (핸들만 보이게)
  ).current;

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

  return (
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
              // 카테고리 변경 시 현재 지도 중심으로 API 호출 (즉시 호출)
              if (mapCenter) {
                fetchCongestionData(mapCenter.latitude, mapCenter.longitude, category);
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
            startInLoadingState={true}
            cacheEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="compatibility"
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>지도 로딩 중...</Text>
              </View>
            )}
            onLoadStart={() => console.log('WebView 로딩 시작')}
            onLoadEnd={() => console.log('WebView 로딩 완료')}
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
                  console.log('드래그 종료 - API 호출 재개');
                  // 드래그 완료 후 API 호출
                  handleMapCenterChange(data.latitude, data.longitude);
                } else if (data.type === 'zoomChanged') {
                  // 줌 변경 시에도 API 호출
                  if (!isMapDragging) {
                    handleMapCenterChange(data.latitude, data.longitude);
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
              bottom: Animated.add(bottomSheetHeight, 20), // 바텀시트 높이 + 20px 여유공간
            },
          ]}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}>
            <Text style={styles.compassText}>⊕</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Sheet */}
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
                  <View style={styles.congestionBadge}>
                    <Text style={styles.congestionText}>
                      {selectedLocation.congestionLevel}
                    </Text>
                  </View>
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
                  <Text style={styles.rating}>{selectedLocation.rating}</Text>
                  <Text style={styles.reviewCount}>
                    ({selectedLocation.reviewCount})
                  </Text>
                  <Text style={styles.distance}>
                    | {selectedLocation.distance}
                  </Text>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressIcon}>📍</Text>
                  <Text style={styles.address}>{selectedLocation.address}</Text>
                </View>

                <View style={styles.statusContainer}>
                  <Text style={styles.clockIcon}>🕐</Text>
                  <Text style={styles.status}>{selectedLocation.status}</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}>
                {selectedLocation.images.map((_, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageText}>Image {index + 1}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* 실시간 혼잡도 */}
              <View style={styles.chartSection}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>실시간 혼잡도</Text>
                  <Text style={styles.chartTime}>16:00 기준</Text>
                </View>
                <View style={styles.congestionStatus}>
                  <View style={styles.congestionIndicator} />
                  <Text style={styles.congestionStatusText}>혼잡</Text>
                </View>

                <View style={styles.chartContainer}>
                  {congestionData.map((item, index) => (
                    <View key={index} style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: item.level,
                            backgroundColor: index === 3 ? '#ff4444' : '#cccccc',
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{item.time}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <Text style={styles.infoText}>
                    오후 7시 이후에는 비교적 여유로울 전망입니다.
                  </Text>
                </View>
              </View>

              {/* 이용객 분포 */}
              <View style={styles.chartSection}>
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

                <View style={styles.visitorChartContainer}>
                  {visitorData.map((item, index) => (
                    <View key={index} style={styles.visitorBarGroup}>
                      <View style={styles.visitorBars}>
                        <View
                          style={[
                            styles.visitorBar,
                            { height: item.male * 2, backgroundColor: '#6bb6ff' },
                          ]}
                        />
                        <View
                          style={[
                            styles.visitorBar,
                            { height: item.female * 2, backgroundColor: '#ff9999' },
                          ]}
                        />
                      </View>
                      <Text style={styles.visitorLabel}>{item.age}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 버튼들 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>상세보기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton}>
                  <Text style={styles.favoriteButtonText}>길찾기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8, // 이름과 배지 사이 간격
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
    fontSize: 14,
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
  imageText: {
    fontSize: 12,
    color: '#ffffff',
  },
  chartSection: {
    marginTop: 24,
    paddingBottom: 16,
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
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
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
    marginTop: 8,
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
  visitorChartContainer: {
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
});

export default CongestionScreen;