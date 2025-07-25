import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import IcChevronLeft from '../assets/icon/ic_chevron_left.svg';
import IcSearch from '../assets/icon/ic_search.svg';
import IcUserCircle from '../assets/icon/ic_user_circle.svg';

type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  MyPage: undefined;
};

interface CustomHeaderProps {
  title?: string;
  showSearchInput?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showSearchInput = false,
  searchPlaceholder = '검색어를 입력하세요',
  onSearchChange,
  searchValue,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (showSearchInput) {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <IcChevronLeft width={24} height={24} fill="#666666" stroke="none" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#999999"
            value={searchValue}
            onChangeText={onSearchChange}
            autoFocus={true}
          />
          <TouchableOpacity style={styles.searchIconContainer}>
            <IcSearch width={20} height={20} fill="#999999" stroke="none" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRightContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.headerButton}>
          <IcSearch width={24} height={24} fill="#666666" stroke="none" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyPage')}
          style={styles.headerButton}>
          <IcUserCircle width={24} height={24} fill="#666666" stroke="none" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerRightContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  backButton: {
    marginRight: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
  },
  searchIconContainer: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#666666',
  },
});

export default CustomHeader;
