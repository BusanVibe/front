import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {PlaceListItem, PlaceType} from '../types/place';
import {getPlaceTypeText} from '../utils/placeUtils';
import {favoriteData} from '../mocks/dummy';
import CongestionBadge from '../components/common/CongestionBadge';
import colors from '../styles/colors';
import typography from '../styles/typography';

const categories = ['전체', '관광명소', '맛집', '카페'];
const sortOptions = ['담은순', '기본순', '추천순', '좋아요순'];

type SortType = '담은순' | '기본순' | '추천순' | '좋아요순';

const FavoriteListScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [favorites, setFavorites] = useState(favoriteData);
  const [sortType, setSortType] = useState<SortType>('담은순');
  const [showSortModal, setShowSortModal] = useState(false);

  const toggleLike = (placeId: number) => {
    setFavorites(prev =>
      prev.map(item =>
        item.place_id === placeId ? {...item, is_like: !item.is_like} : item,
      ),
    );
  };

  const sortFavorites = (data: PlaceListItem[], sortType: SortType): PlaceListItem[] => {
    const sortedData = [...data];
    
    switch (sortType) {
      case '담은순':
        // 담은 순서대로 (기본 순서)
        return sortedData;
      case '기본순':
        // place_id 순서대로
        return sortedData.sort((a, b) => a.place_id - b.place_id);
      case '추천순':
        // 혼잡도가 낮은 순서대로 (추천)
        return sortedData.sort((a, b) => {
          if (a.congestion_level === 0) return 1;
          if (b.congestion_level === 0) return -1;
          return a.congestion_level - b.congestion_level;
        });
      case '좋아요순':
        // 이름 순서대로 (임시로 알파벳 순)
        return sortedData.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sortedData;
    }
  };

  const getFilteredAndSortedData = () => {
    let filteredData = favorites.filter(item => item.is_like);
    
    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      const typeMap: {[key: string]: PlaceType} = {
        '관광명소': PlaceType.SIGHT,
        '맛집': PlaceType.RESTAURANT,
        '카페': PlaceType.CAFE,
      };
      filteredData = filteredData.filter(item => item.type === typeMap[selectedCategory]);
    }
    
    return sortFavorites(filteredData, sortType);
  };



  const renderFavoriteItem = ({item}: {item: PlaceListItem}) => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        {item.img ? (
          <Image source={{uri: item.img}} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>이미지</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          {item.congestion_level > 0 && (
            <CongestionBadge level={item.congestion_level} />
          )}
        </View>

        <Text style={styles.itemType}>{getPlaceTypeText(item.type)}</Text>

        <View style={styles.locationRow}>
          <Text style={styles.distance}>15m</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.address}>{item.address}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => toggleLike(item.place_id)}>
        <Text style={[styles.heart, item.is_like && styles.heartActive]}>
          {item.is_like ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortText}>{sortType} ▼</Text>
        </TouchableOpacity>
      </View>

      {/* 좋아요 목록 */}
      <FlatList
        data={getFilteredAndSortedData()}
        renderItem={renderFavoriteItem}
        keyExtractor={item => item.place_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* 정렬 모달 */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortType === option && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortType(option as SortType);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortType === option && styles.sortOptionTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
  },
  categoryText: {
    ...typography.bodyMd,
    color: colors.gray[700],
  },
  categoryTextActive: {
    color: colors.white,
  },
  sortButton: {
    marginLeft: 'auto',
  },
  sortText: {
    ...typography.bodyMd,
    color: colors.gray[600],
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.bodyMd,
    color: colors.gray[500],
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  itemTitle: {
    ...typography.subHeadingMd,
    color: colors.black,
    flex: 1,
  },

  itemType: {
    ...typography.bodyMd,
    color: colors.gray[600],
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    ...typography.bodyMd,
    color: colors.gray[600],
  },
  separator: {
    ...typography.bodyMd,
    color: colors.gray[600],
    marginHorizontal: 4,
  },
  address: {
    ...typography.bodyMd,
    color: colors.gray[600],
    flex: 1,
  },
  heartButton: {
    padding: 4,
  },
  heart: {
    fontSize: 20,
  },
  heartActive: {
    color: colors.red[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sortOptionActive: {
    backgroundColor: colors.primary[100],
  },
  sortOptionText: {
    ...typography.bodyMd,
    color: colors.gray[700],
    textAlign: 'center',
  },
  sortOptionTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default FavoriteListScreen;