
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="buy" name="buy">
        <Icon sf="hammer.fill" />
        <Label>Buy</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="sell" name="sell">
        <Icon sf="dollarsign.circle.fill" />
        <Label>Sell</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
