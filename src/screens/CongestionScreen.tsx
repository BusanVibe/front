import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const categories = ['관광명소', '맛집', '카페', '편의점'];
const {height: screenHeight} = Dimensions.get('window');

// 혼잡도 시간별 데이터
const congestionData = [
  {time: '06시', level: 10},
  {time: '09시', level: 30},
  {time: '12시', level: 60},
  {time: '15시', level: 100}, // 현재 시간
  {time: '18시', level: 70},
  {time: '21시', level: 40},
  {time: '24시', level: 15},
];

// 이용객 분포 데이터
const visitorData = [
  {age: '10-20대', male: 25, female: 20},
  {age: '30-40대', male: 20, female: 25},
  {age: '50-60대', male: 15, female: 20},
  {age: '70대 이상', male: 10, female: 15},
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

  // 바텀시트 애니메이션
  const bottomSheetHeight = useRef(
    new Animated.Value(screenHeight * 0.4),
  ).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      const newHeight = isExpanded
        ? screenHeight * 0.8 - gestureState.dy
        : screenHeight * 0.4 - gestureState.dy;

      if (newHeight >= screenHeight * 0.2 && newHeight <= screenHeight * 0.8) {
        bottomSheetHeight.setValue(newHeight);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -50) {
        // 위로 드래그 - 확장
        setIsExpanded(true);
        Animated.spring(bottomSheetHeight, {
          toValue: screenHeight * 0.8,
          useNativeDriver: false,
        }).start();
      } else if (gestureState.dy > 50) {
        // 아래로 드래그 - 축소 또는 닫기
        if (isExpanded) {
          setIsExpanded(false);
          Animated.spring(bottomSheetHeight, {
            toValue: screenHeight * 0.4,
            useNativeDriver: false,
          }).start();
        } else {
          // 완전히 닫기
          Animated.spring(bottomSheetHeight, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      } else {
        // 원래 위치로 복귀
        Animated.spring(bottomSheetHeight, {
          toValue: isExpanded ? screenHeight * 0.8 : screenHeight * 0.4,
          useNativeDriver: false,
        }).start();
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
        <View style={styles.mapPlaceholder}>
          {/* Location Markers */}
          <View
            style={[
              styles.locationMarker,
              styles.busyMarker,
              {top: 180, left: 120},
            ]}>
            <View style={styles.markerDot} />
            <Text style={styles.markerLabel}>보통</Text>
          </View>

          <View
            style={[
              styles.locationMarker,
              styles.normalMarker,
              {top: 420, left: 80},
            ]}>
            <View style={styles.markerDot} />
            <Text style={styles.markerLabel}>여유</Text>
          </View>

          <View style={styles.grayMarker}>
            <View style={styles.grayMarkerDot} />
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={() => {
              // 현재 위치로 이동하는 로직
              console.log('현재 위치로 이동');
            }}>
            <Text style={styles.compassText}>⊕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[styles.bottomSheet, {height: bottomSheetHeight}]}
        {...panResponder.panHandlers}>
        <View style={styles.bottomSheetHandle} />

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.locationInfo}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{selectedLocation.name}</Text>
              <View style={styles.congestionBadge}>
                <Text style={styles.congestionText}>
                  {selectedLocation.congestionLevel}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton}>
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
                      style={[styles.legendColor, {backgroundColor: '#6bb6ff'}]}
                    />
                    <Text style={styles.legendText}>남성</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendColor, {backgroundColor: '#ff9999'}]}
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
                          {height: item.male * 2, backgroundColor: '#6bb6ff'},
                        ]}
                      />
                      <View
                        style={[
                          styles.visitorBar,
                          {height: item.female * 2, backgroundColor: '#ff9999'},
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
    gap: 8,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    position: 'relative',
  },
  locationMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  busyMarker: {},
  normalMarker: {},
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  markerLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#333333',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  grayMarker: {
    position: 'absolute',
    top: 300,
    left: 200,
    alignItems: 'center',
  },
  grayMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#999999',
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  scrollContent: {
    flex: 1,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cccccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    paddingHorizontal: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
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
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999999',
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
