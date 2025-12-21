import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useThemeColors } from "@/src/constants/Colors";

export default function DrawerToggleButton() {
  const navigation = useNavigation();
  const colors = useThemeColors();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <Pressable onPress={toggleDrawer} style={{ marginRight: 15 }}>
      <Ionicons name="menu" size={24} color={colors.text} />
    </Pressable>
  );
}
