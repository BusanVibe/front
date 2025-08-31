import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {PlaceListItem, PlaceType} from '../types/place';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/userService';
import AttractionCard from '../components/common/AttractionCard';
import colors from '../styles/colors';
import typography from '../styles/typography';

const categories = ['전체', '관광명소', '맛집', '카페'];
const sortOptions = ['담은순', '기본순', '추천순', '좋아요순'];

type SortType = '담은순' | '기본순' | '추천순' | '좋아요순';

const FavoriteListScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [favorites, setFavorites] = useState<PlaceListItem[]>([]);
  const [sortType, setSortType] = useState<SortType>('담은순');
  const [showSortModal, setShowSortModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadLikes = async () => {
      try {
        if (!user?.accessToken) return;
        const list = await UserService.getLikes(user.accessToken, 'RESTAURANT');
        setFavorites(list);
        console.log('=== FavoriteList loaded ===', { count: list.length });
      } catch (e) {
        // 실패 시 빈 목록 유지
        console.log('FavoriteList load failed');
      }
    };
    loadLikes();
  }, [user?.accessToken]);

  const toggleLike = async (id: number) => {
    setFavorites(prev =>
      prev.map(item =>
        item.id === id ? {...item, is_like: !item.is_like} : item,
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
        // id 순서대로
        return sortedData.sort((a, b) => a.id - b.id);
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
        '카페': PlaceType.CULTURE,
      };
      filteredData = filteredData.filter(item => item.type === typeMap[selectedCategory]);
    }
    
    return sortFavorites(filteredData, sortType);
  };



  const renderFavoriteItem = ({item}: {item: PlaceListItem}) => (
    <AttractionCard place={item} onToggleLike={toggleLike} />
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* 정렬 드롭다운 */}
      {showSortModal && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.dropdownContent}>
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
      )}
      </View>
    </>
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdownContent: {
    position: 'absolute',
    top: 40, // 카테고리 컨테이너 높이보다 조금 위로 올림
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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