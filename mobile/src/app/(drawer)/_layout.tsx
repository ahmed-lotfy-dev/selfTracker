import { Drawer } from "expo-router/drawer";
import { useThemeColors } from "@/src/constants/Colors";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "@/src/components/navigation/CustomDrawerContent";

export default function DrawerLayout() {
  const colors = useThemeColors();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerPosition: "right", // Right side drawer
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.text,
          drawerStyle: {
            backgroundColor: colors.background,
            width: '80%', // Make it wider for better look
          },
          drawerType: "front",
          overlayColor: "rgba(0,0,0,0.5)",
          swipeEdgeWidth: 100, // Make it easier to swipe from edge
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            // Icon handled in CustomDrawerContent
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
