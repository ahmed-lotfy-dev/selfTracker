import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useThemeColors } from "@/src/constants/Colors";

export default function DrawerToggleButton() {
  const navigation = useNavigation();
  const colors = useThemeColors();

  const toggleDrawer = () => {
    // expo-router drawer navigation supports toggleDrawer via dispatch
    try {
      // @ts-ignore
      navigation.dispatch({ type: "TOGGLE_DRAWER" });
    } catch {
      // fallback: try calling toggleDrawer directly
      // @ts-ignore
      if (typeof navigation.toggleDrawer === "function") {
        navigation.toggleDrawer();
      }
    }
  };

  return (
    <Pressable onPress={toggleDrawer} style={{ marginRight: 15 }}>
      <Ionicons name="menu" size={24} color={colors.text} />
    </Pressable>
  );
}
