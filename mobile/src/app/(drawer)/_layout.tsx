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
          drawerPosition: "right",
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.text,
          drawerStyle: {
            backgroundColor: colors.background,
            width: '80%',
          },
          drawerType: "front",
          overlayColor: "rgba(0,0,0,0.5)",
          swipeEdgeWidth: 100,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Main",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
