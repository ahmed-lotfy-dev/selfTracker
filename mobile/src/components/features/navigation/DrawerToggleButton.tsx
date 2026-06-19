import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/constants/Colors";

export default function DrawerToggleButton() {
  const colors = useThemeColors();

  return (
    <Pressable onPress={() => {}} style={{ marginRight: 15 }}>
      <Ionicons name="menu" size={24} color={colors.text} />
    </Pressable>
  );
}
