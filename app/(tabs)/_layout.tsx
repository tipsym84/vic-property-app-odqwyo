
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'buy',
      route: '/buy',
      icon: 'gavel',
      label: 'Buy',
    },
    {
      name: 'sell',
      route: '/sell',
      icon: 'attach-money',
      label: 'Sell',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
