import { Link, Stack } from "expo-router"
import { StyleSheet } from "react-native"

import { Text, View } from "react-native"
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={{ fontSize: 18, color: "#2e78b7" }}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
