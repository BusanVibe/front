import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, FlatList, StatusBar} from 'react-native';
import CurationComponent from '../components/common/Curration';
import AttractionCard from '../components/common/AttractionCard';
import FilterComponent from '../components/common/Filter';
import {festivalData} from '../mocks/festival';
import {CardType} from '../types/place';
import colors from '../styles/colors';

const categories = ['전체', '진행중', '진행예정', '종료'];

const FestivalScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본순');

  const sortOptions = ['기본순', '좋아요순', '시작일순', '종료일순'];

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setShowFilter(false);
  };

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // 카테고리별 데이터 필터링
  const filteredData = useMemo(() => {
    let filtered = festivalData.festival_list;
    const currentDate = new Date();

    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(festival => {
        const startDate = new Date(festival.start_date);
        const endDate = new Date(festival.end_date);

        switch (selectedCategory) {
          case '진행중':
            return currentDate >= startDate && currentDate <= endDate;
          case '진행예정':
            return currentDate < startDate;
          case '종료':
            return currentDate > endDate;
          default:
            return true;
        }
      });
    }

    // 정렬
    switch (selectedSort) {
      case '좋아요순':
        filtered = [...filtered].sort((a, b) => {
          if (a.is_like && !b.is_like) return -1;
          if (!a.is_like && b.is_like) return 1;
          return 0;
        });
        break;
      case '시작일순':
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        );
        break;
      case '종료일순':
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
        );
        break;
      case '기본순':
      default:
        break;
    }

    return filtered;
  }, [selectedCategory, selectedSort]);

  const headerData = useMemo(
    () => [
      {type: 'curation', id: 'curation'},
      {type: 'filter', id: 'filter'},
      ...filteredData.map(item => ({
        type: 'festival',
        id: item.festival_id,
        data: item,
      })),
    ],
    [filteredData],
  );

  const renderItem = ({item, index}: {item: any; index: number}) => {
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
                  place_id: item.data.festival_id,
                  name: item.data.name,
                  is_like: item.data.is_like,
                  address: item.data.address,
                  img: item.data.img,
                  start_date: item.data.start_date,
                  end_date: item.data.end_date,
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
});

export default FestivalScreen;
