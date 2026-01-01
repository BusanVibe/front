import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  Image,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import IcChevronLeft from '../assets/icon/ic_chevron_left.svg';
import IcSearch from '../assets/icon/ic_search.svg';
import IcUserCircle from '../assets/icon/ic_user_circle.svg';
import IcTitle from '../assets/icon/ic_title.svg';
import IcX from '../assets/icon/ic_x.svg';
import {useAuth} from '../contexts/AuthContext';
import {UserService} from '../services/userService';

type RootStackParamList = {
  Main: {screen?: string} | undefined;
  Search: undefined;
  MyPage: undefined;
};

export interface CustomHeaderProps {
  title?: string;
  showSearchInput?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  onPressSearch?: (text?: string) => void;
  showBackButton?: boolean;
}

export interface CustomHeaderRef {
  setText: (text: string) => void;
  submit: () => void;
}

const CustomHeader = forwardRef<CustomHeaderRef, CustomHeaderProps>(
  (
    {
      title,
      showSearchInput = false,
      searchPlaceholder = '검색어를 입력하세요',
      onSearchChange,
      searchValue,
      onPressSearch,
      showBackButton = false,
    },
    ref,
  ) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const {user, isAuthenticated} = useAuth();
    const [profileUrl, setProfileUrl] = useState<string | null>(null);
    const [internalText, setInternalText] = useState<string>('');

    // 외부에서 전달된 searchValue가 바뀌면 내부 상태 동기화
    useEffect(() => {
      if (searchValue !== undefined && searchValue !== internalText) {
        setInternalText(searchValue);
      }
    }, [searchValue]);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          if (!isAuthenticated || !user?.accessToken) {
            setProfileUrl(null);
            return;
          }
          const me = await UserService.getMyPage(user.accessToken);
          if (mounted) {
            setProfileUrl(me.user_image_url || null);
          }
        } catch (e) {
          if (mounted) setProfileUrl(null);
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, [isAuthenticated, user?.accessToken]);

    // 외부에서 최근 검색어를 눌렀을 때 텍스트 세팅/제출을 사용할 수 있도록 ref 제공
    useImperativeHandle(
      ref,
      () => ({
        setText: (text: string) => {
          if (onSearchChange) onSearchChange(text);
          setInternalText(text);
        },
        submit: () => {
          const current = (searchValue ?? internalText)?.trim();
          if (onPressSearch) onPressSearch(current);
        },
      }),
      [onSearchChange, onPressSearch, searchValue, internalText],
    );

    if (showSearchInput) {
      const currentText = internalText;

      return (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.searchBackButton}>
            <IcChevronLeft
              width={20}
              height={20}
              fill="#666666"
              stroke="none"
            />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#999999"
              value={currentText}
              onChangeText={t => {
                if (onSearchChange) onSearchChange(t);
                setInternalText(t);
              }}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => {
                const current = (searchValue ?? internalText)?.trim();
                if (onPressSearch) onPressSearch(current);
              }}
            />
            {currentText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  if (onSearchChange) onSearchChange('');
                  setInternalText('');
                }}
                accessibilityRole="button"
                accessibilityLabel="텍스트 지우기">
                <IcX width={12} height={12} fill="none" stroke="#999999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchIconContainer}
            onPress={() => {
              const current = (searchValue ?? internalText)?.trim();
              if (onPressSearch) onPressSearch(current);
            }}
            accessibilityRole="button"
            accessibilityLabel="검색">
            <IcSearch width={20} height={20} fill="#999999" stroke="none" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <IcChevronLeft
                width={24}
                height={24}
                fill="#666666"
                stroke="none"
              />
            </TouchableOpacity>
          )}
          {title &&
          ['홈', '혼잡도', '명소', '축제', '부산톡'].includes(title) ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', {screen: '홈'})}
              accessibilityRole="button"
              accessibilityLabel="홈으로 이동">
              <IcTitle width={100} height={30} />
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.headerTitle,
                title === '부산스럽다' ? {color: '#0057CC'} : null,
              ]}>
              {title}
            </Text>
          )}
        </View>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerButton}>
            <IcSearch width={27} height={27} fill="#666666" stroke="none" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyPage')}
            style={styles.headerButton}>
            {profileUrl ? (
              <Image source={{uri: profileUrl}} style={styles.profileThumb} />
            ) : (
              <IcUserCircle
                width={24}
                height={24}
                fill="#666666"
                stroke="none"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

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
    fontWeight: '700',
    color: '#000000',
    // 귀여운 폰트 적용 (설치되어 있으면 Jua 사용, 없으면 시스템 폰트로 표시)
    fontFamily: 'Jua',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  profileThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    paddingHorizontal: 10,
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
  searchBackButton: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
