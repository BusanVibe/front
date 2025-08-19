import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import MyPageScreen from '../screens/MyPageScreen';
import FavoriteListScreen from '../screens/FavoriteListScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import CustomHeader from '../components/CustomHeader';

type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  MyPage: undefined;
  FavoriteList: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
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
      <Stack.Screen
        name="FavoriteList"
        component={FavoriteListScreen}
        options={{
          header: () => (
            <CustomHeader 
              title="좋아요"
              showBackButton={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
