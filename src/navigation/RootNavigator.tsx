import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation, NavigationProp} from '@react-navigation/native';

import CongestionScreen from '../screens/CongestionScreen';
import AttractionScreen from '../screens/AttractionScreen';
import HomeScreen from '../screens/HomeScreen';
import FestivalScreen from '../screens/FestivalScreen';
import BusanTalkScreen from '../screens/BusanTalkScreen';
import SearchScreen from '../screens/SearchScreen';
import MyPageScreen from '../screens/MyPageScreen';

type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: 'bold',
        },
        headerRight: () => (
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
        ),
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0057cc',
        tabBarInactiveTintColor: '#000000',
      }}>
      <Tab.Screen
        name="혼잡도"
        component={CongestionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={require('../assets/icon/ic_map.png')}
              style={[styles.tabIcon, {tintColor: color}]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="명소"
        component={AttractionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={require('../assets/icon/ic_map_pin.png')}
              style={[styles.tabIcon, {tintColor: color}]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={require('../assets/icon/ic_home.png')}
              style={[styles.tabIcon, {tintColor: color}]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="축제"
        component={FestivalScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={require('../assets/icon/ic_calendar.png')}
              style={[styles.tabIcon, {tintColor: color}]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="부산톡"
        component={BusanTalkScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={require('../assets/icon/ic_message.png')}
              style={[styles.tabIcon, {tintColor: color}]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 15,
  },
  headerButton: {
    marginLeft: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});

export default RootNavigator;
