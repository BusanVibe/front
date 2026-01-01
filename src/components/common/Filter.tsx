/**
 * 카테고리 및 정렬 필터 컴포넌트
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import ChevronDown from '../../assets/icon/ic_chevron_down';

interface FilterComponentProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedSort: string;
  onSortSelect: (sort: string) => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  sortOptions: string[];
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedSort,
  onSortSelect,
  showFilter,
  onToggleFilter,
  sortOptions,
}) => {
  return (
    <View style={styles.filterContainer}>
      <View style={styles.mainRow}>
        {/* 카테고리 버튼들 */}
        <View style={styles.categoriesRow}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category
                  ? styles.selectedCategory
                  : styles.unselectedCategory,
              ]}
              onPress={() => onCategorySelect(category)}>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category
                    ? styles.selectedText
                    : styles.unselectedText,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 정렬 필터 */}
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onToggleFilter}>
            <Text style={styles.filterText}>{selectedSort}</Text>
            <View
              style={[styles.iconContainer, showFilter && styles.iconRotated]}>
              <ChevronDown />
            </View>
          </TouchableOpacity>

          {showFilter && (
            <View style={styles.filterDropdown}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    selectedSort === option && styles.selectedFilterOption,
                  ]}
                  onPress={() => onSortSelect(option)}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSort === option &&
                        styles.selectedFilterOptionText,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default FilterComponent;

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: colors.primary[500],
  },
  unselectedCategory: {
    backgroundColor: colors.gray[400],
  },
  categoryText: {
    ...typography.bodyMd,
    fontSize: 12,
  },
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.gray[900],
  },
  filterWrapper: {
    position: 'relative',
    alignSelf: 'flex-end',
    zIndex: 10001,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    color: colors.gray[800],
    marginRight: 0,
  },
  iconContainer: {
    transform: [{rotate: '0deg'}],
  },
  iconRotated: {
    transform: [{rotate: '180deg'}],
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    minWidth: 90,
    zIndex: 9999,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[500],
  },
  selectedFilterOption: {
    backgroundColor: colors.primary[100],
  },
  filterOptionText: {
    ...typography.bodyLg,
    color: colors.gray[900],
  },
  selectedFilterOptionText: {
    color: colors.secondary[500],
    fontWeight: '500',
  },
});
