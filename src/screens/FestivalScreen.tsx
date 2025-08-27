import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CurationComponent from '../components/common/Curration';
import AttractionCard from '../components/common/AttractionCard';
import FilterComponent from '../components/common/Filter';
import {CardType} from '../types/place';
import {FestivalService} from '../services/festivalService';
import {
  FestivalListItem,
  FestivalSortType,
  FestivalStatusType,
} from '../types/festival';
import colors from '../styles/colors';

const categories = ['전체', '진행중', '진행예정', '종료'];

const FestivalScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본순');
  const [festivalData, setFestivalData] = useState<FestivalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sortOptions = ['기본순', '좋아요순', '시작일순', '종료일순'];

  const fetchFestivals = async (isRefresh = false) => {
    try {
      console.log('=== FestivalScreen API 요청 시작 ===');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let status = FestivalStatusType.ALL;
      switch (selectedCategory) {
        case '진행중':
          status = FestivalStatusType.IN_PROGRESS;
          break;
        case '진행예정':
          status = FestivalStatusType.UPCOMING;
          break;
        case '종료':
          status = FestivalStatusType.COMPLETE;
          break;
        default:
          status = FestivalStatusType.ALL;
      }

      let sort = FestivalSortType.DEFAULT;
      switch (selectedSort) {
        case '좋아요순':
          sort = FestivalSortType.LIKE;
          break;
        case '시작일순':
          sort = FestivalSortType.START;
          break;
        case '종료일순':
          sort = FestivalSortType.END;
          break;
        default:
          sort = FestivalSortType.DEFAULT;
      }

      console.log('API 파라미터:', {sort, status});

      const response = await FestivalService.getFestivalList({sort, status});

      console.log('=== FestivalScreen API 응답 ===');
      console.log('response.is_success:', response.is_success);
      console.log('response.message:', response.message);
      console.log(
        '축제 데이터 개수:',
        response.result?.festival_list?.[1]?.length || 0,
      );

      if (response.is_success && response.result) {
        setFestivalData(response.result.festival_list?.[1] || []);
        console.log('축제 데이터 설정 완료');
      } else {
        console.error('API 응답 실패:', response);
        setFestivalData([]);
        Alert.alert(
          '오류',
          response.message || '축제 데이터를 불러오는 중 오류가 발생했습니다.',
        );
      }
    } catch (error) {
      console.error('=== FestivalScreen API 에러 ===');
      console.error('에러 상세:', error);
      setFestivalData([]);
      Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      console.log('=== FestivalScreen API 요청 완료 ===');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchFestivals();
    }
  }, [selectedCategory, selectedSort]);

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowFilter(false);
  };

  const handleRefresh = () => {
    fetchFestivals(true);
  };

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const filteredData = useMemo(() => {
    return festivalData;
  }, [festivalData]);

  const headerData = useMemo(
    () => [
      {type: 'curation', id: 'curation'},
      {type: 'filter', id: 'filter'},
      ...filteredData.map(item => ({
        type: 'festival',
        id: item.id,
        data: item,
      })),
    ],
    [filteredData],
  );

  const renderItem = ({item}: {item: any; index: number}) => {
    switch (item.type) {
      case 'curation':
        return (
          <View style={styles.curationWrapper}>
            <CurationComponent />
          </View>
        );
      case 'filter':
        return (
          <FilterComponent
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedSort={selectedSort}
            onSortSelect={handleSortSelect}
            showFilter={showFilter}
            onToggleFilter={handleToggleFilter}
            sortOptions={sortOptions}
          />
        );
      case 'festival':
        return (
          <View style={styles.itemContainer}>
            <AttractionCard
              place={
                {
                  id: item.data.id,
                  name: item.data.name,
                  is_like: item.data.is_like,
                  address: item.data.address,
                  img: item.data.img,
                  start_date: item.data.start_date,
                  end_date: item.data.end_date,
                  like_amount: item.data.like_amount,
                } as any
              }
              cardType={CardType.FESTIVAL}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderEmpty = () => (
    <View>
      <View style={styles.curationWrapper}>
        <CurationComponent />
      </View>
      <FilterComponent
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        selectedSort={selectedSort}
        onSortSelect={handleSortSelect}
        showFilter={showFilter}
        onToggleFilter={handleToggleFilter}
        sortOptions={sortOptions}
      />
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          해당 카테고리에 표시할 축제가 없습니다.
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <View style={styles.curationWrapper}>
            <CurationComponent />
          </View>
          <FilterComponent
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedSort={selectedSort}
            onSortSelect={handleSortSelect}
            showFilter={showFilter}
            onToggleFilter={handleToggleFilter}
            sortOptions={sortOptions}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>축제 정보를 불러오는 중...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <FlatList
          data={headerData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    flexGrow: 1,
  },
  curationWrapper: {
    height: 400,
    backgroundColor: colors.white,
  },
  itemContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default FestivalScreen;
