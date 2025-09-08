import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import AttractionCard from '../components/common/AttractionCard';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {CardType, PlaceListItem, PlaceType, FestivalListItem} from '../types/place';
import {SearchService, mapKoreanCategoryToSearchOption, mapKoreanSortToSearchSort} from '../services/searchService';
import {SearchSortType, NormalizedSearchItem} from '../types/search';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SearchResult'>;

const SearchResultScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {keyword, option} = route.params;
  const categories = ['전체', '관광명소', '맛집/카페', '문화시설', '축제'];
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // option 값으로 초기 카테고리 선택
    const byOption: Record<string, string> = {
      ALL: '전체',
      SIGHT: '관광명소',
      RESTAURANT: '맛집/카페',
      CULTURE: '문화시설',
      FESTIVAL: '축제',
    };
    return byOption[String(option)] || '전체';
  });
  const sortItems = ['기본순', '추천순', '혼잡도순', '좋아요순'];
  const [selectedSort, setSelectedSort] = useState<string>('기본순');
  const [sortOpen, setSortOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<
    {cardType: CardType; data: PlaceListItem | FestivalListItem}[]
  >([]);

  const title = useMemo(() => `"${keyword}" 검색 결과`, [keyword]);

  const mapToCardItem = (item: NormalizedSearchItem): {
    cardType: CardType;
    data: PlaceListItem | FestivalListItem;
  } => {
    const isFestival = item.typeEn === 'FESTIVAL' || !!item.startDate;
    if (isFestival) {
      const f: any = {
        id: item.id,
        festival_id: item.id,
        name: item.name,
        img: item.imageUrl,
        start_date: item.startDate || '',
        end_date: item.endDate || '',
        is_like: item.isLike,
        like_amount: item.likeCount || 0,
        address: item.address,
      } as FestivalListItem;
      return {cardType: CardType.FESTIVAL, data: f as FestivalListItem};
    }

    const toPlaceType = (t: string): PlaceType => {
      switch (t) {
        case 'SIGHT':
          return PlaceType.SIGHT;
        case 'RESTAURANT':
          return PlaceType.RESTAURANT;
        case 'CULTURE':
          return PlaceType.CULTURE;
        default:
          return PlaceType.SIGHT;
      }
    };

    const p: PlaceListItem = {
      id: item.id,
      name: item.name,
      congestion_level: item.congestionLevel ?? 0,
      is_like: item.isLike,
      type: toPlaceType(String(item.typeEn)),
      address: item.address,
      img: item.imageUrl,
      latitude: item.latitude,
      longitude: item.longitude,
    };
    return {cardType: CardType.PLACE, data: p};
  };

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiOption = mapKoreanCategoryToSearchOption(selectedCategory);
      const apiSort = mapKoreanSortToSearchSort(selectedSort);
      const res = await SearchService.search({
        option: apiOption as any,
        sort: apiSort,
        keyword,
      });
      setResults(res.list.map(mapToCardItem));
    } catch (e) {
      console.error('검색 결과 조회 오류:', e);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedCategory, selectedSort]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title={title} showBackButton={true} />
      ),
    });
  }, [navigation, title]);

  return (
    <View style={styles.container}>
      {/* 카테고리 버튼 */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
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
        </ScrollView>
      </View>

      {/* 정렬 드롭다운 (간단한 토글 리스트) */}
      <View style={styles.sortRow}>
        <TouchableOpacity onPress={() => setSortOpen(!sortOpen)}>
          <Text style={styles.sortLabel}>{selectedSort} ▼</Text>
        </TouchableOpacity>
      </View>
      {sortOpen && (
        <View style={styles.sortMenu}>
          {sortItems.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.sortItem}
              onPress={() => {
                setSelectedSort(item);
                setSortOpen(false);
              }}>
              <Text style={styles.sortItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!isLoading && (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={results}
          renderItem={({item}) => (
            <AttractionCard place={item.data} cardType={item.cardType} />
          )}
          keyExtractor={(item) => {
            if (item.cardType === CardType.PLACE) {
              return `PLACE-${(item.data as PlaceListItem).id}`;
            }
            const f = item.data as FestivalListItem as any;
            return `FESTIVAL-${f.festival_id ?? f.id}`;
          }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>검색된 데이터가 없습니다</Text>
          )}
        />
      )}
      {isLoading && <Text style={styles.loading}>검색 중...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryWrapper: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#8cb6ee',
  },
  unselectedCategory: {
    backgroundColor: '#eaeaea',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#ffffff',
  },
  unselectedText: {
    color: '#000000',
  },
  sortRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  sortMenu: {
    position: 'absolute',
    right: 16,
    top: 96,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 24,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sortItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortItemText: {
    fontSize: 16,
    color: '#222',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loading: {
    padding: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    color: '#666',
  },
});

export default SearchResultScreen;


