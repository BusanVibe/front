import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

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
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <FlatList
          data={recentSearches}
          renderItem={({ item }) => <Text style={styles.item}>{item.term}</Text>}
          keyExtractor={item => item.id}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>인기 검색어</Text>
        <FlatList
          data={popularSearches}
          renderItem={({ item }) => <Text style={styles.item}>{item.term}</Text>}
          keyExtractor={item => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
  },
  icon: {
    fontSize: 24,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    paddingVertical: 8,
  },
});

export default SearchScreen;
