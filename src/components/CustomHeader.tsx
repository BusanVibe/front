import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image, Text} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';

type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  MyPage: undefined;
};

interface CustomHeaderProps {
  title: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({title}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRightContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.headerButton}>
          <Image
            source={require('../assets/icon/ic_search.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyPage')}
          style={styles.headerButton}>
          <Image
            source={require('../assets/icon/ic_user_circle.png')}
            style={styles.headerIcon}
          />
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
});

export default CustomHeader;
