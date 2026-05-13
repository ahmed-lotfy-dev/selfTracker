import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="weights" />
      <Stack.Screen name="workouts" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="habits_stack" />
    </Stack>
  );
}
