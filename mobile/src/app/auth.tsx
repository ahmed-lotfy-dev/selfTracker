
import { View, Text, ActivityIndicator } from 'react-native';
import { useDeepLinkHandler } from '../hooks/useDeepLinkHandler';
import { useEffect } from 'react';
import React from 'react';

/**
 * This page serves as a destination for the "selftracker://auth" or "exp+selftracker://auth" deep link.
 * It doesn't need to render much, as useDeepLinkHandler will capture the token and redirect.
 */
export default function AuthCallbackPage() {
  // Activate the deep link handler logic
  useDeepLinkHandler();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 20, fontSize: 16 }}>Verifying login...</Text>
    </View>
  );
}
