import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CurationComponent from '../components/common/Curration';
import AttractionSection from '../components/attraction/AttractionSection';
import FilterComponent from '../components/common/Filter';
import {attractionData} from '../mocks/attraction';
import {PlaceType} from '../types/place';
import colors from '../styles/colors';

const categories = ['전체', '관광명소', '맛집', '카페'];

const AttractionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본순');

  const sortOptions = ['기본순', '좋아요순', '혼잡도순'];

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowFilter(false);
  };

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // 카테고리별 데이터 필터링
  const filteredData = useMemo(() => {
    let filtered = attractionData;

    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      const categoryTypeMap: {[key: string]: PlaceType} = {
        관광명소: PlaceType.SIGHT,
        맛집: PlaceType.RESTAURANT,
        카페: PlaceType.CAFE,
      };

      const targetType = categoryTypeMap[selectedCategory];
      if (targetType) {
        filtered = filtered.filter(place => place.type === targetType);
      }
    }

    // 정렬
    switch (selectedSort) {
      case '좋아요순':
        filtered = [...filtered].sort((a, b) => {
          if (a.is_like && !b.is_like) return -1;
          if (!a.is_like && b.is_like) return 1;
          return 0;
        });
        break;
      case '혼잡도순':
        filtered = [...filtered].sort(
          (a, b) => a.congestion_level - b.congestion_level,
        );
        break;
      case '기본순':
      default:
        break;
    }

    return filtered;
  }, [selectedCategory, selectedSort]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}>
        {/* 큐레이션 섹션 */}
        <View style={styles.curationWrapper}>
          <CurationComponent />
        </View>

        {/* 필터 컴포넌트 */}
        <FilterComponent
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedSort={selectedSort}
          onSortSelect={handleSortSelect}
          showFilter={showFilter}
          onToggleFilter={handleToggleFilter}
          sortOptions={sortOptions}
        />

        {/* 명소 리스트 */}
        <View style={styles.attractionContainer}>
          {filteredData.length > 0 ? (
            <AttractionSection
              places={filteredData}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                해당 카테고리에 표시할 장소가 없습니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  curationWrapper: {
    height: 400,
    backgroundColor: colors.white,
  },
  attractionContainer: {
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    minHeight: 600,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AttractionScreen;
