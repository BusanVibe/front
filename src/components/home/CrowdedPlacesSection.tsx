import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {PlaceListItem} from '../../types/place';
import CrowdedPlaceCard from './CrowdedPlaceCard';
import colors from '../../styles/colors';
import typography from '../../styles/typography';

interface CrowdedPlacesSectionProps {
  places: PlaceListItem[];
}

const CrowdedPlacesSection: React.FC<CrowdedPlacesSectionProps> = ({
  places,
}) => {
  const renderCard = ({item}: {item: PlaceListItem}) => (
    <View style={styles.cardWrapper}>
      <CrowdedPlaceCard place={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>지금 붐비는 곳</Text>
      <FlatList
        data={places}
        renderItem={renderCard}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={266}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 16,
  },
  sectionTitle: {
    ...typography.subHeadingLg,
    color: colors.black,
    marginBottom: 12,
  },
  listContent: {
    paddingRight: 8,
    paddingBottom: 8,
  },
  cardWrapper: {
    marginRight: 16,
  },
});

export default CrowdedPlacesSection;
