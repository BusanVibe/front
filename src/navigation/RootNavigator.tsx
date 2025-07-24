import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import MyPageScreen from '../screens/MyPageScreen';
import CustomHeader from '../components/CustomHeader';

type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  MyPage: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          header: () => (
            <CustomHeader 
              showSearchInput={true}
              searchPlaceholder="관광지 · 장소 · 축제 검색"
            />
          ),
        }}
      />
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

export default RootNavigator;
