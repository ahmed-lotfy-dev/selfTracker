import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { Feather } from "@expo/vector-icons"
import { PremiumCard } from "@/src/components/ui/PremiumCard"
import Input from "@/src/components/ui/Input"
import { User } from "@/src/types/userType"

interface ProfileHeroProps {
  user: User | null
  name: string
  setName: (name: string) => void
  isImageUploading: boolean
  onPickImage: () => void
}

export default function ProfileHero({ 
  user, 
  name, 
  setName, 
  isImageUploading, 
  onPickImage 
}: ProfileHeroProps) {
  return (
    <PremiumCard 
      gradientColors={['#1e1b4b', '#312e81']}
      containerStyle="pt-10 pb-10 items-center justify-center"
    >
      <View className="items-center justify-center w-full">
        <Pressable 
          onPress={onPickImage} 
          className="relative mb-6" 
          disabled={isImageUploading}
        >
          <View className="h-40 w-40 rounded-full items-center justify-center border-4 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden bg-white/5">
            {isImageUploading ? (
              <View className="flex-1 items-center justify-center bg-black/20 w-full h-full">
                <Feather name="loader" size={24} color="white" className="animate-spin" />
              </View>
            ) : user?.image ? (
              <Image source={{ uri: user.image }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <Text className="text-6xl font-black text-white/20 tracking-tighter">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            )}
          </View>
          <View className="absolute bottom-2 right-2 bg-white p-3 rounded-full border-4 border-[#1e1b4b] shadow-lg">
            <Feather name="camera" size={16} color="black" />
          </View>
        </Pressable>
        
        <View className="items-center w-full px-4">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="User Name"
            placeholderTextColor="rgba(255,255,255,0.2)"
            className="text-center font-black text-4xl text-white border-0 bg-transparent w-full tracking-tighter"
            containerClassName="mb-1"
          />
          <View className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 mt-1">
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">
              {user?.email}
            </Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  )
}
