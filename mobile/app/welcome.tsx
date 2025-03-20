import { View, Text, Button, Image } from "tamagui"
import { useRouter } from "expo-router"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View flex={1} justify="center" items="center" bg="white">
      {/* <Image
        source={require("../assets/welcome.png")} // Replace with your image
        style={{ width: 200, height: 200 }}
      /> */}
      <Text fontSize={20} fontWeight="bold" marginBlockEnd={20}>
        Welcome to Self Tracker!
      </Text>
      <View flexDirection="row" gap={10}>
        <Button onPress={() => router.replace("/login")} flex={1}>
          Login
        </Button>
        <Button onPress={() => router.replace("/register")} flex={1}>
          Register
        </Button>
      </View>
    </View>
  )
}
