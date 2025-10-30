import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';

// Navigators
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * App Navigator (Root Stack Navigator)
 * 将来的に Splash / Auth 画面を追加予定
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        {/* TODO: Week 2 で Splash / Auth 画面を追加 */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
