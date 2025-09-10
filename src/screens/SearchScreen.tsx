import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomHeader, { CustomHeaderRef } from '../components/CustomHeader';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {mapKoreanCategoryToSearchOption} from '../services/searchService';

const recentSearches: {id: string; term: string}[] = [];

const popularSearches: {id: string; term: string; trend: 'up' | 'down'}[] = [
  {id: '1', term: '이재모피자', trend: 'up'},
  {id: '2', term: '해운대', trend: 'down'},
  {id: '3', term: '요트', trend: 'up'},
  {id: '4', term: '국밥', trend: 'down'},
  {id: '5', term: '불꽃축제', trend: 'up'},
  {id: '6', term: '더베이 101', trend: 'up'},
  {id: '7', term: '케이블카', trend: 'down'},
  {id: '8', term: '공원', trend: 'up'},
  {id: '9', term: '해변', trend: 'up'},
  {id: '10', term: '미포집', trend: 'down'},
];

const SearchScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [recentSearchList, setRecentSearchList] = useState(recentSearches);
  const [keyword, setKeyword] = useState('');
  const headerRef = React.useRef<CustomHeaderRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const categories = ['전체', '관광명소', '맛집/카페', '문화시설', '축제'];

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSearch = useCallback(async (textParam?: string) => {
    try {
      const term = (textParam ?? keyword).trim();
      if (!term || term.length === 0) {
        return;
      }
      const option = mapKoreanCategoryToSearchOption(selectedCategory);
      // 결과 화면으로 이동
      navigation.navigate('SearchResult', {
        keyword: term,
        option,
      } as any);
      // 최근 검색어 업데이트
      setRecentSearchList(prev => {
        const exists = prev.find(p => p.term === term);
        if (exists) return prev;
        const newItem = {id: Date.now().toString(), term};
        return [newItem, ...prev].slice(0, 10);
      });
    } catch (e) {
      console.error('검색 오류:', e);
    }
  }, [keyword, selectedCategory, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          ref={headerRef}
          showSearchInput={true}
          searchPlaceholder="관광지 · 장소 · 축제 검색"
          searchValue={keyword}
          onSearchChange={setKeyword}
          onPressSearch={handleSearch}
        />
      ),
    });
    // 의도적으로 의존성에서 keyword를 제외하여 헤더 재생성을 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, handleSearch]);

  const removeRecentSearch = (id: string) => {
    setRecentSearchList(recentSearchList.filter(item => item.id !== id));
  };
  const handleSelectKeyword = (term: string) => {
    // 키워드 상태를 즉시 업데이트하고 검색 실행
    setKeyword(term);
    headerRef.current?.setText(term);
    handleSearch(term);
  };

  const clearAllRecentSearches = () => {
    setRecentSearchList([]);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* 카테고리 버튼들 */}
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

        <View style={styles.sectionContainer}>
          {isLoading && (
            <Text style={styles.sectionTitle}>검색 중...</Text>
          )}
          {resultCount !== null && !isLoading && (
            <Text style={styles.sectionTitle}>검색 결과 {resultCount}건</Text>
          )}
          {/* 결과 리스트는 SearchResultScreen에서 렌더링 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 검색어</Text>
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text style={styles.clearAllText}>전체 삭제</Text>
            </TouchableOpacity>
          </View>
          {recentSearchList.length > 0 ? (
            <View style={styles.recentSearchContainer}>
              {recentSearchList.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentSearchButton}
                  onPress={() => handleSelectKeyword(item.term)}>
                  <Text style={styles.recentSearchText}>{item.term}</Text>
                  <TouchableOpacity
                    onPress={() => removeRecentSearch(item.id)}
                    style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>지금 궁금한 장소를 검색해보세요!</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>인기 검색어</Text>
          <FlatList
            data={popularSearches}
            renderItem={({item}) => (
              <TouchableOpacity style={styles.popularItem} onPress={() => handleSelectKeyword(item.term)}>
                <Text style={styles.itemNumber}>{item.id}</Text>
                <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.term}</Text>
                <Text
                  style={[
                    styles.trendIcon,
                    item.trend === 'up' ? styles.trendUp : styles.trendDown,
                  ]}
                >
                  {item.trend === 'up' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            numColumns={2}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryWrapper: {
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#3b82f6',
  },
  unselectedCategory: {
    backgroundColor: '#f2f4f6',
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 25,
  },
  clearAllText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 18,
    includeFontPadding: false,
  },
  recentSearchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  recentSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  removeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
    transform: [{translateY: 2}],
  },
  emptyCard: {
    backgroundColor: '#f7f7f8',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    flex: 0.5,
    paddingRight: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    width: 20,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 4,
  },
  trendIcon: {
    fontSize: 12,
    marginLeft: 4,
    width: 12,
    textAlign: 'right',
  },
  trendUp: {
    color: '#ef4444',
  },
  trendDown: {
    color: '#3b82f6',
  },
});

export default SearchScreen;
