import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CurationComponent from '../components/common/Curration';
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

  // API 데이터 로드
  const loadPlaceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const category = getCategoryFromKorean(selectedCategory);
      const sort = getSortFromKorean(selectedSort);

      console.log('명소 데이터 로드 시작:', {category, sort});

      const data = await getPlaceList(category, sort);
      setPlaceData(data);

      console.log('명소 데이터 로드 완료:', data.length, '개');
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
      ...filteredData.map(item => ({
        type: 'attraction',
        id: item.place_id,
        data: item,
      })),
    ],
    [filteredData],
  );

  const renderItem = ({item, index}: {item: any; index: number}) => {
    switch (item.type) {
      case 'curation':
        return (
          <View style={styles.curationWrapper}>
            <CurationComponent />
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
  };

  const renderEmpty = () => (
    <View>
      <View style={styles.curationWrapper}>
        <CurationComponent />
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
            <CurationComponent />
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
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={styles.listContent}
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
