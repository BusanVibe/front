import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* 큐레이션 영역 */}
      <View style={styles.curationSection}>
        <Text style={styles.sectionTitle}>큐레이션 영역</Text>
        <View style={styles.curationCard}>
          <Text style={styles.cardText}>큐레이션 콘텐츠</Text>
        </View>
      </View>

      {/* 지금 붐비는 곳 영역 */}
      <View style={styles.crowdedSection}>
        <Text style={styles.sectionTitle}>지금 붐비는 곳</Text>
        <View style={styles.crowdedCard}>
          <Text style={styles.cardText}>붐비는 장소 정보</Text>
        </View>
      </View>

      {/* 추천 명소 영역 */}
      <View style={styles.attractionSection}>
        <Text style={styles.sectionTitle}>추천 명소</Text>
        <View style={styles.attractionCard}>
          <Text style={styles.cardText}>추천 명소 리스트</Text>
        </View>
        <View style={styles.attractionCard}>
          <Text style={styles.cardText}>추천 명소 리스트</Text>
        </View>
        <View style={styles.attractionCard}>
          <Text style={styles.cardText}>추천 명소 리스트</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  curationSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  crowdedSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  attractionSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  curationCard: {
    height: 200,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  crowdedCard: {
    height: 120,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attractionCard: {
    height: 80,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
  },
});
