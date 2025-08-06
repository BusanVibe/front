import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {PlaceListItem} from '../../types/place';
import AttractionCard from '../common/AttractionCard';
import colors from '../../styles/colors';

interface AttractionSectionProps {
  places: PlaceListItem[];
  showsVerticalScrollIndicator?: boolean;
  scrollEnabled?: boolean;
}

const AttractionSection: React.FC<AttractionSectionProps> = ({
  places,
  showsVerticalScrollIndicator = false,
  scrollEnabled = true,
}) => {
  const renderCard = ({item}: {item: PlaceListItem}) => (
    <AttractionCard place={item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        renderItem={renderCard}
        keyExtractor={item => item.place_id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={false}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
};

export default AttractionSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  listContent: {
    paddingVertical: 8,
  },
});
