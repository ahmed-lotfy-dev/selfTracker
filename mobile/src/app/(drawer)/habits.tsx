import React from 'react';
import HabitsScreen from '@/src/features/habits/HabitsScreen';
import { Stack } from 'expo-router';

export default function HabitsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HabitsScreen />
    </>
  );
}
