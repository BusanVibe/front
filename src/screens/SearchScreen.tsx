import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';

const recentSearches = [
  { id: '1', term: '해운대' },
  { id: '2', term: '광안리' },
  { id: '3', term: '태종대' },
  { id: '4', term: '감천문화마을' },
  { id: '5', term: '더베이101' },
];

const popularSearches = [
  { id: '1', term: '부산 맛집' },
  { id: '2', term: '해운대 해수욕장' },
  { id: '3', term: '돼지국밥' },
  { id: '4', term: '부산 축제' },
  { id: '5', term: '이기대' },
];

const SearchScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const categories = ['전체', '관광명소', '맛집', '카페', '축제'];

  return (
    <View style={styles.container}>
      {/* 검색 입력창 */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="관광지 · 장소 · 축제 검색"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchIconButton}>
            <Image 
              source={require('../assets/icon/ic_search.png')} 
              style={styles.searchIcon} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 카테고리 버튼들 */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category ? styles.selectedCategory : styles.unselectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category ? styles.selectedText : styles.unselectedText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <Text style={styles.emptyText}>지금 궁금한 장소를 검색해보세요!</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>인기 검색어</Text>
        <FlatList
          data={popularSearches}
          renderItem={({ item }) => (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchIconButton: {
    padding: 4,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
