/**
 * 큐레이션 컴포넌트
 */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import {getCurationData} from '../../services/placeService';
import {PlaceType} from '../../types/place';
import IcChevronRight from '../../assets/icon/ic_chevron_right.svg';
import IcClock from '../../assets/icon/ic_clock.svg';
import IcCalendar from '../../assets/icon/ic_calendar.svg';
import LinearGradient from 'react-native-linear-gradient';

const {width: screenWidth} = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CurationComponentProps {
  type: 'PLACE' | 'FESTIVAL';
}

interface CurationItemUI {
  id: string;
  title: string;
  time?: string;
  image?: string;
  period?: string;
}

const CurationComponent: React.FC<CurationComponentProps> = ({type}) => {
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [curationData, setCurationData] = useState<CurationItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 큐레이션 데이터 로드
  useEffect(() => {
    const loadCurationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCurationData(type);

        const transformedData: CurationItemUI[] = data.map(item => {
          let time: string | undefined;
          if (item.type_en === 'SIGHT' && item.duration !== '정보 없음') {
            time = item.duration.split('\n')[0];
          }

          let title = item.name;
          if (item.type_en === 'FESTIVAL' && title.includes('(')) {
            title = title.split('(')[0];
          }

          return {
            id: item.id.toString(),
            title,
            time,
            image: item.img_url,
            period: item.type_en === 'FESTIVAL' && item.duration !== '정보 없음' ? item.duration : undefined,
          };
        });

        setCurationData(transformedData);
      } catch (err) {
        setError('큐레이션 데이터를 불러올 수 없습니다.');
        setCurationData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCurationData();
  }, [type]);

  // 자동 슬라이드 기능
  useEffect(() => {
    if (curationData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % curationData.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [curationData.length]);

  const handleCurationPress = (item: CurationItemUI) => {
    if (type === 'FESTIVAL') {
      const festivalData = {
        id: parseInt(item.id),
        festival_id: parseInt(item.id),
        name: item.title,
        img: item.image || '',
        period: item.period || '',
        address: '부산광역시',
        is_like: false,
        start_date: '',
        end_date: '',
        like_amount: 0,
      };
      navigation.navigate('FestivalDetail', {festival: festivalData});
    } else {
      const placeData = {
        id: parseInt(item.id),
        place_id: parseInt(item.id),
        name: item.title,
        img: item.image || '',
        address: '부산광역시',
        type: PlaceType.SIGHT,
        congestion_level: 0,
        is_like: false,
      };
      navigation.navigate('PlaceDetail', {place: placeData});
    }
  };

  const renderCurationItem = (item: CurationItemUI) => (
    <TouchableOpacity
      style={styles.curationCard}
      activeOpacity={0.9}
      onPress={() => handleCurationPress(item)}>
      <ImageBackground
        source={item.image ? {uri: item.image} : undefined}
        style={styles.curationImageContainer}
        imageStyle={styles.curationImage}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
          locations={[0, 0.74]}
          style={styles.gradientOverlay}
        />

        <View style={styles.curationContent}>
          <View style={styles.curationInfo}>
            <View style={styles.currationTitleContainer}>
              <Text style={styles.curationTitle}>{item.title}</Text>
              <IcChevronRight />
            </View>

            <View style={styles.curationDetails}>
              {item.time && (
                <View style={styles.timeContainer}>
                  <IcClock width={16} height={16} color={colors.gray[500]} />
                  <Text style={styles.curationTime}>{item.time}</Text>
                </View>
              )}

              {item.period && (
                <View style={styles.periodContainer}>
                  <IcCalendar width={16} height={16} color={colors.gray[500]} />
                  <Text style={styles.curationPeriod}>{item.period}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>큐레이션 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || curationData.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          {error || '큐레이션 데이터가 없습니다.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideSize = screenWidth;
          const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="center">
        {curationData.map((item) => (
          <View key={item.id} style={styles.slideContainer}>
            {renderCurationItem(item)}
          </View>
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        {curationData.map((_, dotIndex) => (
          <TouchableOpacity
            key={dotIndex}
            style={[
              styles.paginationDot,
              dotIndex === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => setCurrentIndex(dotIndex)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 24,
  },
  slideContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  curationCard: {
    width: screenWidth - 32,
    height: 360,
  },
  curationImageContainer: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.gray[300],
  },
  curationImage: {
    borderRadius: 6,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 6,
  },
  curationContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 28,
  },
  curationInfo: {
    flex: 1,
    marginRight: 12,
  },
  currationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  curationTitle: {
    ...typography.title,
    color: colors.white,
    width: '80%',
    marginBottom: 8,
    lineHeight: 24,
  },
  curationDetails: {
    gap: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curationTime: {
    ...typography.bodyLg,
    color: colors.gray[500],
    lineHeight: 16.8,
    marginLeft: 6,
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curationPeriod: {
    ...typography.bodyLg,
    color: colors.gray[500],
    lineHeight: 16.8,
    marginLeft: 6,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.primary[300],
    width: 20,
  },
  inactiveDot: {
    backgroundColor: colors.gray[500],
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 360,
  },
  loadingText: {
    ...typography.bodyLg,
    color: colors.gray[600],
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 360,
    paddingHorizontal: 16,
  },
  errorText: {
    ...typography.bodyLg,
    color: colors.gray[600],
    textAlign: 'center',
  },
});

export default CurationComponent;
