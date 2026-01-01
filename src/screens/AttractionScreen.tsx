import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CurationComponent from '../components/common/Curation';
import AttractionCard from '../components/common/AttractionCard';
import FilterComponent from '../components/common/Filter';
import {PlaceListItem} from '../types/place';
import {
  getPlaceList,
  getCategoryFromKorean,
  getSortFromKorean,
} from '../services/placeService';
import colors from '../styles/colors';

const categories = ['전체', '관광명소', '맛집/카페', '문화시설'];

const AttractionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본순');
  const [placeData, setPlaceData] = useState<PlaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortOptions = ['기본순', '좋아요순', '혼잡도순'];

  // 화면 크기와 아이템 높이 상수 정의
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const CURATION_HEIGHT = 400;
  const FILTER_HEIGHT = 60;
  const ITEM_HEIGHT = 112; // 패딩 포함 아이템 높이

  // 가상화 최적화 설정
  const INITIAL_NUM_TO_RENDER = Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT);
  const WINDOW_SIZE = 10;
  const MAX_TO_RENDER_PER_BATCH = 5;

  // API 데이터 로드
  const loadPlaceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const category = getCategoryFromKorean(selectedCategory);
      const sort = getSortFromKorean(selectedSort);

      const data = await getPlaceList(category, sort);
      setPlaceData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '데이터를 불러오는 중 오류가 발생했습니다.';
      console.error('명소 데이터 로드 오류:', err);
      setError(errorMessage);

      // 오류 시 사용자에게 알림
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSort]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPlaceData();
  }, [loadPlaceData]);

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowFilter(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // API에서 이미 필터링과 정렬이 적용된 데이터를 사용
  const filteredData = placeData;

  const headerData = useMemo(
    () => [
      {type: 'curation', id: 'curation'},
      {type: 'filter', id: 'filter'},
      ...filteredData
        .filter(item => item && item.id)
        .map(item => ({
          type: 'attraction',
          id: item.id,
          data: item,
        })),
    ],
    [filteredData],
  );

  // 메모이제이션된 렌더 아이템 함수
  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      switch (item.type) {
        case 'curation':
          return (
            <View style={styles.curationWrapper}>
              <CurationComponent type="PLACE" />
            </View>
          );
        case 'filter':
          return (
            <FilterComponent
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              selectedSort={selectedSort}
              onSortSelect={handleSortSelect}
              showFilter={showFilter}
              onToggleFilter={handleToggleFilter}
              sortOptions={sortOptions}
            />
          );
        case 'attraction':
          return (
            <View style={styles.itemContainer}>
              <AttractionCard place={item.data} />
            </View>
          );
        default:
          return null;
      }
    },
    [
      categories,
      selectedCategory,
      selectedSort,
      showFilter,
      sortOptions,
      handleCategorySelect,
      handleSortSelect,
      handleToggleFilter,
    ],
  );

  // getItemLayout으로 스크롤 성능 최적화
  const getItemLayout = useCallback((data: any, index: number) => {
    if (index === 0) {
      // Curation component
      return {
        length: CURATION_HEIGHT,
        offset: 0,
        index,
      };
    } else if (index === 1) {
      // Filter component
      return {
        length: FILTER_HEIGHT,
        offset: CURATION_HEIGHT,
        index,
      };
    } else {
      // Attraction items
      const offset =
        CURATION_HEIGHT + FILTER_HEIGHT + (index - 2) * ITEM_HEIGHT;
      return {
        length: ITEM_HEIGHT,
        offset,
        index,
      };
    }
  }, []);

  // 최적화된 keyExtractor
  const keyExtractor = useCallback((item: any, index: number) => {
    if (item.type === 'curation') return 'curation';
    if (item.type === 'filter') return 'filter';
    return `attraction_${item.id}`;
  }, []);

  const renderEmpty = () => (
    <View>
      <View style={styles.curationWrapper}>
        <CurationComponent type="PLACE" />
      </View>
      <FilterComponent
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        selectedSort={selectedSort}
        onSortSelect={handleSortSelect}
        showFilter={showFilter}
        onToggleFilter={handleToggleFilter}
        sortOptions={sortOptions}
      />
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          해당 카테고리에 표시할 장소가 없습니다.
        </Text>
      </View>
    </View>
  );

  // 로딩 중일 때 렌더링
  if (loading) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <View style={styles.curationWrapper}>
            <CurationComponent type="PLACE" />
          </View>
          <FilterComponent
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            selectedSort={selectedSort}
            onSortSelect={handleSortSelect}
            showFilter={showFilter}
            onToggleFilter={handleToggleFilter}
            sortOptions={sortOptions}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>명소 정보를 불러오는 중...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <FlatList
          data={headerData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={styles.listContent}
          // 가상화 최적화 설정
          initialNumToRender={INITIAL_NUM_TO_RENDER}
          maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
          windowSize={WINDOW_SIZE}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          // 성능 최적화
          legacyImplementation={false}
          disableVirtualization={false}
          // 스크롤 최적화
          scrollEventThrottle={16}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    flexGrow: 1,
  },
  curationWrapper: {
    height: 400,
    backgroundColor: colors.white,
  },
  itemContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default AttractionScreen;
