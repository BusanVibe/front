import React from 'react';
import {View, Text, StyleSheet, ScrollView, StatusBar} from 'react-native';
import CurationComponent from '../components/common/Curration';
import CrowdedPlacesSection from '../components/home/CrowdedPlacesSection';
import AttractionSection from '../components/home/AttractionSection';
import {suggestAttractionData} from '../mocks/attraction';
import typography from '../styles/typography';
import colors from '../styles/colors';

const HomeScreen = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container}>
      <View style={styles.curationSection}>
        <CurationComponent />
      </View>

      <View style={styles.crowdedSection}>
        <CrowdedPlacesSection places={suggestAttractionData} />
      </View>

      <View style={styles.attractionSection}>
        <AttractionSection
          places={suggestAttractionData}
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
