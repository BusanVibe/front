import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import {curationData} from '../../mocks/dummy';
import IcChevronRight from '../../assets/icon/ic_chevron_right.svg';
import IcClock from '../../assets/icon/ic_clock.svg';
import IcCalendar from '../../assets/icon/ic_calendar.svg';
import LinearGradient from 'react-native-linear-gradient';

const {width: screenWidth} = Dimensions.get('window');

interface CurationItem {
  id: string;
  title: string;
  time?: string;
  image?: string;
  period?: string;
}

const CurationComponent: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % curationData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCurationItem = ({item}: {item: CurationItem}) => (
    <TouchableOpacity style={styles.curationCard} activeOpacity={0.9}>
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

        <View style={styles.paginationContainer}>
          {curationData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
                setCurrentIndex(index);
              }}
            />
          ))}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={curationData}
        renderItem={renderCurationItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 24,
  },
  curationCard: {
    width: screenWidth,
    height: 360,
    paddingHorizontal: 16,
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
});

export default CurationComponent;
