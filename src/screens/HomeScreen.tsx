import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, StatusBar, Alert, TouchableOpacity} from 'react-native';
import CurationComponent from '../components/common/Curration';
import CrowdedPlacesSection from '../components/home/CrowdedPlacesSection';
import AttractionSection from '../components/home/AttractionSection';
import {useLocation} from '../contexts/LocationContext';
import {getHomeData} from '../services/placeService';
import {PlaceListItem} from '../types/place';
import typography from '../styles/typography';
import colors from '../styles/colors';

const HomeScreen = () => {
  const [mostCrowdedPlaces, setMostCrowdedPlaces] = useState<PlaceListItem[]>([]);
  const [recommendPlaces, setRecommendPlaces] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {userLocation, hasLocationPermission, refreshLocation} = useLocation();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const data = await getHomeData();
      setMostCrowdedPlaces(data.mostCrowded);
      setRecommendPlaces(data.recommendPlace);
    } catch (error) {
      console.error('홈 데이터 로드 실패:', error);
      Alert.alert('오류', '홈 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container}>


        <View style={styles.curationSection}>
          <CurationComponent />
        </View>

        <View style={styles.crowdedSection}>
          <CrowdedPlacesSection places={mostCrowdedPlaces} />
        </View>

        <View style={styles.attractionSection}>
          <AttractionSection
            places={recommendPlaces}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  curationSection: {
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
    ...typography.subHeadingLg,
    color: colors.black,
    marginBottom: 12,
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
