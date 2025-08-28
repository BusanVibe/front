import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomHeader from '../components/CustomHeader';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {SearchService, mapKoreanCategoryToSearchOption} from '../services/searchService';
import {SearchSortType} from '../types/search';

const recentSearches = [
  {id: '1', term: '해운대'},
  {id: '2', term: '이재모피자'},
];

const popularSearches = [
  {id: '1', term: '부산 맛집'},
  {id: '2', term: '해운대 해수욕장'},
  {id: '3', term: '돼지국밥'},
  {id: '4', term: '부산 축제'},
  {id: '5', term: '이기대'},
];

const SearchScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [recentSearchList, setRecentSearchList] = useState(recentSearches);
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const categories = ['전체', '관광명소', '맛집/카페', '문화시설', '축제'];

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSearch = useCallback(async () => {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return;
      }
      setIsLoading(true);
      const option = mapKoreanCategoryToSearchOption(selectedCategory);
      const response = await SearchService.search({
        option,
        sort: SearchSortType.DEFAULT,
        keyword: keyword.trim(),
      });
      console.log('검색 응답:', response);
      setResultCount(response.list.length);
      // 최근 검색어 업데이트
      setRecentSearchList(prev => {
        const exists = prev.find(p => p.term === keyword.trim());
        if (exists) return prev;
        const newItem = {id: Date.now().toString(), term: keyword.trim()};
        return [newItem, ...prev].slice(0, 10);
      });
    } catch (e) {
      console.error('검색 오류:', e);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedCategory]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          showSearchInput={true}
          searchPlaceholder="관광지 · 장소 · 축제 검색"
          searchValue={keyword}
          onSearchChange={setKeyword}
          onPressSearch={handleSearch}
        />
      ),
    });
  }, [navigation, keyword, handleSearch]);

  const removeRecentSearch = (id: string) => {
    setRecentSearchList(recentSearchList.filter(item => item.id !== id));
  };

  const clearAllRecentSearches = () => {
    setRecentSearchList([]);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* 카테고리 버튼들 */}
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

        <View style={styles.sectionContainer}>
          {isLoading && (
            <Text style={styles.sectionTitle}>검색 중...</Text>
          )}
          {resultCount !== null && !isLoading && (
            <Text style={styles.sectionTitle}>검색 결과 {resultCount}건</Text>
          )}
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
                  style={styles.recentSearchButton}>
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
            <Text style={styles.emptyText}>
              지금 궁금한 장소를 검색해보세요!
            </Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>인기 검색어</Text>
          <FlatList
            data={popularSearches}
            renderItem={({item}) => (
              <View style={styles.popularItem}>
                <Text style={styles.itemNumber}>{item.id}</Text>
                <Text style={styles.itemText}>{item.term}</Text>
                <Text style={styles.trendIcon}>🔺</Text>
              </View>
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
    marginBottom: 24,
    gap: 8,
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
  },
  clearAllText: {
    fontSize: 14,
    color: '#999',
  },
  recentSearchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    flex: 0.5,
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
  },
  trendIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default SearchScreen;
