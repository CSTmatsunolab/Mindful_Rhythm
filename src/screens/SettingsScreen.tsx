import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import type { SettingsNavigationProp } from '../types/navigation';

/**
 * 設定画面
 */
export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>設定</Text>
        <Text style={styles.subtitle}>アプリの設定と管理</Text>

        {/* スリーピン画像生成 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 スリーピン管理</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SleepinGenerator')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>画像生成</Text>
              <Text style={styles.menuItemSubtitle}>AI画像生成でスリーピンを作成</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 今後の設定項目 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ その他の設定</Text>
          <Text style={styles.comingSoon}>Coming Soon...</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: Colors.accent,
    marginLeft: 12,
  },
  comingSoon: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
