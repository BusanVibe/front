import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import CongestionScreen from '../screens/CongestionScreen';
import AttractionScreen from '../screens/AttractionScreen';
import HomeScreen from '../screens/HomeScreen';
import FestivalScreen from '../screens/FestivalScreen';
import BusanTalkScreen from '../screens/BusanTalkScreen';
import CustomHeader from '../components/CustomHeader';

import IcMap from '../assets/icon/ic_map.svg';
import IcMapPin from '../assets/icon/ic_map_pin.svg';
import IcHome from '../assets/icon/ic_home.svg';
import IcCalendar from '../assets/icon/ic_calendar.svg';
import IcMessage from '../assets/icon/ic_message.svg';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={({route}) => ({
        header: () => <CustomHeader title={route.name} />,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0057cc',
        tabBarInactiveTintColor: '#999999',
      })}>
      <Tab.Screen
        name="혼잡도"
        component={CongestionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <IcMap width={24} height={24} fill="white" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="명소"
        component={AttractionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <IcMapPin width={24} height={24} fill="white" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => (
            <IcHome width={24} height={24} fill="white" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="축제"
        component={FestivalScreen}
        options={{
          tabBarIcon: ({color}) => (
            <IcCalendar width={24} height={24} fill="white" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="부산톡"
        component={BusanTalkScreen}
        options={{
          tabBarIcon: ({color}) => (
            <IcMessage width={24} height={24} fill="white" color={color} />
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
