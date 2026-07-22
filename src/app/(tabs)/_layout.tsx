import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../components/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="fridge" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
