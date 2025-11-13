import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';

// Navigators
import TabNavigator from './TabNavigator';

// Screens
import SleepRecordingScreen from '../screens/SleepRecordingScreen';
import AlarmSettingScreen from '../screens/AlarmSettingScreen';

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
        <Stack.Screen
          name="SleepRecording"
          component={SleepRecordingScreen}
          options={{
            headerShown: true,
            title: '睡眠記録',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="AlarmSetting"
          component={AlarmSettingScreen}
          options={{
            headerShown: true,
            title: 'アラーム設定',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
