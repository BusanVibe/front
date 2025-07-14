import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import CongestionScreen from './screens/CongestionScreen';
import AttractionScreen from './screens/AttractionScreen';
import HomeScreen from './screens/HomeScreen';
import FestivalScreen from './screens/FestivalScreen';
import BusanTalkScreen from './screens/BusanTalkScreen';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="혼잡도" component={CongestionScreen} />
        <Tab.Screen name="명소" component={AttractionScreen} />
        <Tab.Screen name="홈" component={HomeScreen} />
        <Tab.Screen name="축제" component={FestivalScreen} />
        <Tab.Screen name="부산톡" component={BusanTalkScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
