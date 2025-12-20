import React from "react"
import { View, ActivityIndicator, StyleSheet, Text } from "react-native"
import { Colors } from "../constants/Colors"

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.tint} />
      <Text style={styles.text}>Preparing your experience...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
})
