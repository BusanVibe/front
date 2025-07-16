import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity onPress={() => alert('Search Pressed!')} style={styles.headerButton}>
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert('My Page Pressed!')} style={styles.headerButton}>
              <Text style={styles.icon}>👤</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tab.Screen name="혼잡도" component={CongestionScreen} />
      <Tab.Screen name="명소" component={AttractionScreen} />
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="축제" component={FestivalScreen} />
      <Tab.Screen name="부산톡" component={BusanTalkScreen} />
    </Tab.Navigator>
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
  icon: {
    fontSize: 24,
  }
});

export default RootNavigator;
