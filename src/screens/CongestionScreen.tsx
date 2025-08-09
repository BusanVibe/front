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
  const [currentLocation, setCurrentLocation] = useState(null);
  const webViewRef = useRef(null);

  // 서울로 이동하기
  const getCurrentLocation = () => {
    console.log('서울로 이동 시작');

    // 서울 좌표 (광화문 기준)
    const seoulLocation = {
      latitude: 37.5665,
      longitude: 126.9780
    };

    console.log('서울 좌표 설정:', seoulLocation.latitude, seoulLocation.longitude);

    // 서울 위치 저장
    setCurrentLocation(seoulLocation);

    // WebView 강제 리렌더링으로 새로운 지도 로드
    setMapKey(prev => prev + 1);
    console.log('서울 지도 리렌더링 시작');
  };

  // 동적 지도 HTML 생성
  const createMapHTML = () => {
    const centerLat = currentLocation ? currentLocation.latitude : 35.1532;
    const centerLng = currentLocation ? currentLocation.longitude : 129.1186;
    const isCurrentLocation = !!currentLocation;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>카카오 지도</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=0578d9aa78d051f1c0efa91fe3c2cb6d"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .loading { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            background: white; 
            padding: 10px; 
            border-radius: 5px; 
            font-size: 14px; 
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="map">
        <div class="loading">${isCurrentLocation ? '현재 위치 지도 로딩 중...' : '지도 로딩 중...'}</div>
    </div>
    <script>
        console.log('지도 초기화 시작 - 중심: ${centerLat}, ${centerLng}');
        
        function initMap() {
            try {
                if (typeof kakao === 'undefined') {
                    console.error('카카오 지도 API 로드 실패');
                    setTimeout(initMap, 1000);
                    return;
                }
                
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
                    level: 3
                };
                
                var map = new kakao.maps.Map(container, options);
                console.log('지도 생성 완료');
                
                // 로딩 메시지 제거
                var loading = document.querySelector('.loading');
                if (loading) {
                    loading.remove();
                }
                
                ${isCurrentLocation ? `
                // 현재 위치 마커
                var currentMarker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
                    title: '현재 위치'
                });
                currentMarker.setMap(map);
                console.log('현재 위치 마커 생성 완료');
                
                // 현재 위치 인포윈도우
                var infowindow = new kakao.maps.InfoWindow({
                    content: '<div style="padding:8px;font-size:12px;text-align:center;background:white;border:1px solid #ccc;border-radius:4px;">📍 현재 위치<br>위도: ${centerLat.toFixed(4)}<br>경도: ${centerLng.toFixed(4)}</div>'
                });
                infowindow.open(map, currentMarker);
                
                // 5초 후 인포윈도우 닫기
                setTimeout(function() {
                    infowindow.close();
                }, 5000);
                ` : `
                // 기본 마커들 (광안리 중심)
                var locations = [
                    { lat: 35.1532, lng: 129.1186, title: '광안리 해수욕장', content: '혼잡' },
                    { lat: 35.1542, lng: 129.1196, title: '카페', content: '보통' },
                    { lat: 35.1522, lng: 129.1176, title: '편의점', content: '여유' }
                ];
                
                locations.forEach(function(loc) {
                    var marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(loc.lat, loc.lng),
                        title: loc.title
                    });
                    marker.setMap(map);
                    
                    var infowindow = new kakao.maps.InfoWindow({
                        content: '<div style="padding:5px;font-size:12px;text-align:center;">' + 
                                '<strong>' + loc.title + '</strong><br>' + loc.content + '</div>'
                    });
                    
                    kakao.maps.event.addListener(marker, 'click', function() {
                        infowindow.open(map, marker);
                    });
                });
                console.log('기본 마커들 생성 완료');
                `}
                
                console.log('지도 초기화 완료');
                
            } catch (error) {
                console.error('지도 초기화 오류:', error);
                setTimeout(initMap, 2000);
            }
        }
        
        // 지도 초기화 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMap);
        } else {
            initMap();
        }
    </script>
</body>
</html>`;
  };

  // 바텀시트 애니메이션
  const bottomSheetHeight = useRef(
    new Animated.Value(screenHeight * 0.75), // 기본 높이를 더 크게 (75%)
  ).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // 바텀시트 최소화 함수
  const minimizeBottomSheet = () => {
    setIsMinimized(true);
    setIsExpanded(false);
    Animated.spring(bottomSheetHeight, {
      toValue: 30, // 더 작은 높이 (핸들만 살짝 보이게)
      useNativeDriver: false,
    }).start();
  };

  // 바텀시트 복원 함수
  const restoreBottomSheet = () => {
    setIsMinimized(false);
    Animated.spring(bottomSheetHeight, {
      toValue: screenHeight * 0.75, // 기본 크기를 더 크게
      useNativeDriver: false,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isMinimized) {
        // 최소화 상태에서는 위로만 드래그 가능
        if (gestureState.dy < 0) {
          const newHeight = 40 - gestureState.dy;
          if (newHeight <= screenHeight * 0.75) {
            bottomSheetHeight.setValue(newHeight);
          }
        }
      } else {
        const newHeight = isExpanded
          ? screenHeight * 0.9 - gestureState.dy // 확장 시 더 크게 (90%)
          : screenHeight * 0.75 - gestureState.dy; // 기본 크기 더 크게 (75%)

        if (newHeight >= 40 && newHeight <= screenHeight * 0.9) {
          bottomSheetHeight.setValue(newHeight);
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (isMinimized) {
        // 최소화 상태에서 위로 드래그하면 복원
        if (gestureState.dy < -30) {
          restoreBottomSheet();
        } else {
          // 원래 최소화 위치로 복귀
          Animated.spring(bottomSheetHeight, {
            toValue: 40,
            useNativeDriver: false,
          }).start();
        }
      } else {
        if (gestureState.dy < -50) {
          // 위로 드래그 - 확장
          setIsExpanded(true);
          Animated.spring(bottomSheetHeight, {
            toValue: screenHeight * 0.9, // 확장 시 더 크게
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy > 50) {
          // 아래로 드래그
          if (isExpanded) {
            // 확장 상태에서 아래로 드래그 - 기본 크기로
            setIsExpanded(false);
            Animated.spring(bottomSheetHeight, {
              toValue: screenHeight * 0.75, // 기본 크기 더 크게
              useNativeDriver: false,
            }).start();
          } else {
            // 기본 상태에서 아래로 드래그 - 최소화
            minimizeBottomSheet();
          }
        } else {
          // 원래 위치로 복귀
          Animated.spring(bottomSheetHeight, {
            toValue: isExpanded ? screenHeight * 0.9 : screenHeight * 0.75,
            useNativeDriver: false,
          }).start();
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
            onPress={() => setSelectedCategory(category)}>
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
        <WebView
          key={mapKey} // 강제 리렌더링
          ref={webViewRef}
          source={{ html: createMapHTML() }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
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
        />

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}>
          <Text style={styles.compassText}>⊕</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.bottomSheetHandle}
          onPress={isMinimized ? restoreBottomSheet : undefined}
          activeOpacity={isMinimized ? 0.7 : 1}>
          <View style={styles.handle} />

        </TouchableOpacity>

        {!isMinimized && (
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
                  onPress={minimizeBottomSheet}>
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
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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