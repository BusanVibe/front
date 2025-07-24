import React from 'react';
import {StyleSheet, Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CongestionScreen from '../screens/CongestionScreen';
import AttractionScreen from '../screens/AttractionScreen';
import HomeScreen from '../screens/HomeScreen';
import FestivalScreen from '../screens/FestivalScreen';
import BusanTalkScreen from '../screens/BusanTalkScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={({route}) => ({
        header: () => <CustomHeader title={route.name} />,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0057cc',
        tabBarInactiveTintColor: '#000000',
      })}>
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

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
  },
});

export default TabNavigator;
