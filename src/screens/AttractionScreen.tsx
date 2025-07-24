import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

const categories = ['전체', '관광명소', '맛집', '카페'];

// 큐레이션 데이터
const curationData = [
  {
    id: '1',
    title: '해변의 낭만과 아름다운 자연 경관, 해운대 해수욕장',
    time: '매일 09:00 - 18:00',
    image: 'https://via.placeholder.com/300x200/87CEEB/000000?text=Curation1',
  },
  {
    id: '2',
    title: '부산의 대표 관광지와 맛집 투어',
    time: '매일 10:00 - 17:00',
    image: 'https://via.placeholder.com/300x200/98FB98/000000?text=Curation2',
  },
];

// 명소 리스트 데이터
const attractionData = [
  {
    id: '1',
    name: '광안리 해수욕장',
    category: '관광명소',
    congestionLevel: '혼잡',
    distance: '15m',
    location: '부산 수영구 광안해변로',
    image: 'https://via.placeholder.com/80x80/87CEEB/000000?text=Beach',
  },
  {
    id: '2',
    name: '위챙콜리데이',
    category: '카페',
    congestionLevel: '혼잡',
    distance: '315m',
    location: '부산 수영구 광안해변로',
    image: 'https://via.placeholder.com/80x80/DEB887/000000?text=Cafe',
  },
  {
    id: '3',
    name: '광안리 해수욕장',
    category: '관광명소',
    congestionLevel: '혼잡',
    distance: '15m',
    location: '부산 수영구 광안해변로',
    image: 'https://via.placeholder.com/80x80/87CEEB/000000?text=Beach',
  },
  {
    id: '4',
    name: '위챙콜리데이',
    category: '카페',
    congestionLevel: '혼잡',
    distance: '315m',
    location: '부산 수영구 광안해변로',
    image: 'https://via.placeholder.com/80x80/DEB887/000000?text=Cafe',
  },
];

const AttractionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본순');

  const sortOptions = ['기본순', '좋아요순', '혼잡도순'];

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowFilter(false);
  };

  const renderCurationItem = ({item}: {item: any}) => (
    <View style={styles.curationCard}>
      <View style={styles.curationImageContainer}>
        <View style={styles.curationImagePlaceholder}>
          <Text style={styles.curationImageText}>큐레이션 이미지</Text>
        </View>
        <View style={styles.curationOverlay}>
          <Text style={styles.curationTitle}>{item.title}</Text>
          <View style={styles.curationTimeContainer}>
            <Text style={styles.curationTimeIcon}>🕐</Text>
            <Text style={styles.curationTime}>{item.time}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.curationArrow}>
          <Text style={styles.curationArrowText}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.curationDots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );

  const renderAttractionItem = ({item}: {item: any}) => (
    <View style={styles.attractionItem}>
      <View style={styles.attractionImageContainer}>
        <View style={styles.attractionImagePlaceholder}>
          <Text style={styles.attractionImageText}>이미지</Text>
        </View>
      </View>
      <View style={styles.attractionInfo}>
        <View style={styles.attractionHeader}>
          <Text style={styles.attractionName}>{item.name}</Text>
          <View style={styles.congestionBadge}>
            <Text style={styles.congestionText}>{item.congestionLevel}</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>♡</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.attractionCategory}>{item.category}</Text>
        <View style={styles.attractionDetails}>
          <Text style={styles.attractionDistance}>{item.distance}</Text>
          <Text style={styles.attractionSeparator}>|</Text>
          <Text style={styles.attractionLocation}>{item.location}</Text>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandIcon}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 큐레이션 섹션 */}
      <FlatList
        data={curationData}
        renderItem={renderCurationItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.curationContainer}
      />

      {/* 카테고리 필터 */}
      <View style={styles.filterContainer}>
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
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}>
            <Text style={styles.filterText}>{selectedSort}</Text>
            <Text
              style={[
                styles.filterIcon,
                showFilter && styles.filterIconRotated,
              ]}>
              ⌄
            </Text>
          </TouchableOpacity>

          {showFilter && (
            <View style={styles.filterDropdown}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    selectedSort === option && styles.selectedFilterOption,
                  ]}
                  onPress={() => handleSortSelect(option)}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSort === option &&
                        styles.selectedFilterOptionText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 명소 리스트 */}
      <FlatList
        data={attractionData}
        renderItem={renderAttractionItem}
        keyExtractor={item => item.id}
        style={styles.attractionList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  curationContainer: {
    flex: 1,
    maxHeight: '45%',
  },
  curationCard: {
    width: 350,
    flex: 1,
    marginHorizontal: 8,
    paddingBottom: 20,
  },
  curationImageContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  curationImagePlaceholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  curationImageText: {
    fontSize: 16,
    color: '#666666',
  },
  curationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  curationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  curationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curationTimeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  curationTime: {
    fontSize: 14,
    color: '#ffffff',
  },
  curationArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{translateY: -12}],
  },
  curationArrowText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  curationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cccccc',
  },
  activeDot: {
    backgroundColor: '#333333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10000,
    position: 'relative',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#6bb6ff',
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
  filterWrapper: {
    position: 'relative',
    marginLeft: 'auto',
    zIndex: 10001,
    elevation: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  filterIcon: {
    fontSize: 12,
    color: '#666666',
    transform: [{rotate: '0deg'}],
  },
  filterIconRotated: {
    transform: [{rotate: '180deg'}],
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    minWidth: 120,
    zIndex: 9999,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFilterOption: {
    backgroundColor: '#f8f9fa',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedFilterOptionText: {
    color: '#6bb6ff',
    fontWeight: '500',
  },
  attractionList: {
    flex: 1,
    paddingHorizontal: 16,
    maxHeight: '45%',
  },
  attractionItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attractionImageContainer: {
    marginRight: 12,
  },
  attractionImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#87CEEB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attractionImageText: {
    fontSize: 12,
    color: '#ffffff',
  },
  attractionInfo: {
    flex: 1,
  },
  attractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  congestionBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  congestionText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#cccccc',
  },
  attractionCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  attractionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionDistance: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  attractionSeparator: {
    fontSize: 14,
    color: '#cccccc',
    marginHorizontal: 8,
  },
  attractionLocation: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: '#cccccc',
  },
});

export default AttractionScreen;
