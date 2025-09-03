import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {PlaceListItem} from '../../types/place';
import AttractionCard from '../common/AttractionCard';
import colors from '../../styles/colors';
import typography from '../../styles/typography';

interface AttractionSectionProps {
  places: PlaceListItem[];
  showsVerticalScrollIndicator?: boolean;
  scrollEnabled?: boolean;
  onToggleLike?: (id: number) => Promise<void>;
}

const AttractionSection: React.FC<AttractionSectionProps> = ({
  places,
  showsVerticalScrollIndicator = false,
  scrollEnabled = true,
  onToggleLike,
}) => {
  const renderCard = ({item}: {item: PlaceListItem}) => (
    <AttractionCard place={item} onToggleLike={onToggleLike} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>추천 명소</Text>
      <FlatList
        data={places}
        renderItem={renderCard}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        style={styles.list}
      />
    </View>
  );
};

export default AttractionSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  sectionTitle: {
    ...typography.subHeadingLg,
    color: colors.black,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
});
