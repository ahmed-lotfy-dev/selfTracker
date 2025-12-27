import BackButton from '@/src/components/Buttons/BackButton';
import { Stack } from 'expo-router';
import React from 'react';

export default function HabitsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" options={{
        title: "Add Habit",
        headerTitleAlign: "center",
        presentation: "formSheet",
        headerShown: false,
        animation: "slide_from_bottom",
        headerLeft: () => <BackButton backTo="/habits" />,
      }} />
    </Stack>
  );
}
