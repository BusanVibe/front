import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CongestionScreen from '../screens/CongestionScreen';
import AttractionScreen from '../screens/AttractionScreen';
import HomeScreen from '../screens/HomeScreen';
import FestivalScreen from '../screens/FestivalScreen';
import BusanTalkScreen from '../screens/BusanTalkScreen';

const Tab = createBottomTabNavigator();

const RootNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="혼잡도" component={CongestionScreen} />
      <Tab.Screen name="명소" component={AttractionScreen} />
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="축제" component={FestivalScreen} />
      <Tab.Screen name="부산톡" component={BusanTalkScreen} />
    </Tab.Navigator>
  );
};

export default RootNavigator;
