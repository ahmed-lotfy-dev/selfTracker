import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/constants/Colors';
import { authClient } from '@/src/lib/auth-client';
import { clearAllUserData } from '@/src/lib/storage';
import { queryClient } from '@/src/lib/react-query';

export default function HeaderMenu() {
  const [visible, setVisible] = useState(false);
  const { setUser } = useAuthActions();
  const { showToast } = useToast();
  const router = useRouter();
  const colors = useThemeColors();

  const toggleMenu = () => setVisible(!visible);
  const closeMenu = () => setVisible(false);

  const handleSignOut = async () => {
    closeMenu();
    try {
      await clearAllUserData();
      queryClient.removeQueries();
      await authClient.signOut();

      setUser(null);
      showToast('Signed out successfully', 'success');
      router.replace('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Failed to sign out', 'error');
    }
  };

  const menuItems = [
    {
      label: 'Export Data',
      icon: 'download-outline' as const,
      action: () => {
        closeMenu();
        showToast('Export feature coming soon!', 'info');
      },
    },
    {
      label: 'Help & Feedback',
      icon: 'help-circle-outline' as const,
      action: () => {
        closeMenu();
        showToast('Feedback feature coming soon!', 'info');
      },
    },
    {
      label: 'Sign Out',
      icon: 'log-out-outline' as const,
      action: handleSignOut,
      danger: true,
    },
  ];

  return (
    <View className="relative z-50 mr-4">
      <Pressable
        onPress={toggleMenu}
        className="active:opacity-50 p-1"
        hitSlop={10}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View className="flex-1 bg-black/20">
            <View
              style={{ position: 'absolute', top: 50, right: 16 }}
              className="bg-card rounded-xl shadow-xl border border-border min-w-[200px] overflow-hidden"
            >
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={item.action}
                  className={`flex-row items-center px-4 py-3 active:bg-border/50 ${index < menuItems.length - 1 ? 'border-b border-border' : ''
                    }`}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? colors.error : colors.text}
                  />
                  <Text
                    className={`ml-3 font-medium ${item.danger ? 'text-error' : 'text-text'
                      }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
