import { View, ActivityIndicator, Text } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Valid route handler for "selftracker://auth" deep links.
 * 
 * This prevents Expo Router from showing a 404 page when the deep link opens.
 * The actual token logic is handled globally by useDeepLinkHandler, but this
 * component provides a visual interface while that happens.
 */
export default function AuthRoute() {
  const router = useRouter();

  useEffect(() => {
    // Failsafe: If stuck here for too long, go home
    const timeout = setTimeout(() => {
      router.replace("/(home)/home");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-500 font-medium">Finishing sign in...</Text>
    </View>
  );
}
