import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {PlaceListItem} from '../types/place';
import {useAuth} from '../contexts/AuthContext';
import {useFocusEffect} from '@react-navigation/native';
import {UserService} from '../services/userService';
import {useLikes} from '../contexts/LikesContext';
import AttractionCard from '../components/common/AttractionCard';
import colors from '../styles/colors';
import typography from '../styles/typography';

const categories = ['전체', '관광명소', '맛집/카페', '문화시설', '축제'];
const sortOptions = ['담은순', '기본순', '추천순', '좋아요순'];

type SortType = '담은순' | '기본순' | '추천순' | '좋아요순';

const FavoriteListScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [favorites, setFavorites] = useState<PlaceListItem[]>([]);
  const [sortType, setSortType] = useState<SortType>('담은순');
  const [showSortModal, setShowSortModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth();
  const {likedPlaceIds, isPlaceLiked, refreshLikes} = useLikes();

  const loadLikes = async (category: string = selectedCategory) => {
    try {
      setIsLoading(true);
      if (!user?.accessToken) {
        setFavorites([]);
        return;
      }

      // 카테고리에 따른 옵션 설정
      let option = 'ALL';
      switch (category) {
        case '관광명소':
          option = 'SIGHT';
          break;
        case '맛집/카페':
          option = 'RESTAURANT';
          break;
        case '문화시설':
          option = 'CULTURE';
          break;
        case '축제':
          option = 'FESTIVAL';
          break;
        case '전체':
        default:
          option = 'ALL';
          break;
      }

      const list = await UserService.getLikes(user.accessToken, option);

      setFavorites(list);
    } catch (e) {
      console.error('FavoriteList 로딩 실패:', e);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, [user?.accessToken, selectedCategory]);

  // 전역 좋아요 상태가 변경되면 즐겨찾기 목록에서도 해제된 항목 제거
  useEffect(() => {
    if (!favorites || favorites.length === 0) return;
    setFavorites(prev => prev.filter(item => isPlaceLiked(item.id)));
  }, [likedPlaceIds]);

  // 화면 진입 시 전역 좋아요 동기화 보강
  useEffect(() => {
    refreshLikes();
  }, [user?.accessToken]);

  // 화면 포커스 시 좋아요 상태 새로고침
  useFocusEffect(
    useCallback(() => {
      refreshLikes();
      return () => {};
    }, [refreshLikes]),
  );

  const sortFavorites = (
    data: PlaceListItem[],
    sortType: SortType,
  ): PlaceListItem[] => {
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
    // 서버에서 이미 좋아요된 항목들만 가져오므로 바로 정렬만 적용
    return sortFavorites(favorites, sortType);
  };

  const renderFavoriteItem = ({item}: {item: PlaceListItem}) => (
    <AttractionCard place={item} />
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
            onPress={() => setShowSortModal(true)}>
            <Text style={styles.sortText}>{sortType} ▼</Text>
          </TouchableOpacity>
        </View>

        {/* 좋아요 목록 */}
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>로딩 중...</Text>
          </View>
        ) : getFilteredAndSortedData().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>좋아요한 장소가 없습니다</Text>
            <Text style={styles.emptySubText}>
              관심있는 장소에 하트를 눌러보세요
            </Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredAndSortedData()}
            renderItem={renderFavoriteItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}

        {/* 정렬 드롭다운 */}
        {showSortModal && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}>
            <View style={styles.dropdownContent}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortOption,
                    sortType === option && styles.sortOptionActive,
                  ]}
                  onPress={() => {
                    setSortType(option as SortType);
                    setShowSortModal(false);
                  }}>
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortType === option && styles.sortOptionTextActive,
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
    gap: 2,
  },
  categoryButton: {
    paddingHorizontal: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    ...typography.bodyLg,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    ...typography.bodyMd,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

export default FavoriteListScreen;
