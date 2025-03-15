
import { Text, View } from "tamagui"

export default function HomeScreen() {
  return (
      <View
        bg={"white"}
        height={"100%"}
        flex={1}
        justify={"center"}
        items={"center"}
      >
        <Text marginStart={50} color="black" fontWeight={"bold"}>
          Home
        </Text>
      </View>
  )
}
