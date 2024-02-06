import { Colors, Fonts, Sizes } from '@/src/constants'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { User } from 'firebase/auth'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

interface Props {
    isLoading: boolean;
    friendUser: User | null;
}

const ChatHeader = ({ isLoading, friendUser }: Props) => {

    const router = useRouter();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: Colors.white, borderBottomColor: Colors.lightGray3, borderBottomWidth: 1, paddingHorizontal: Sizes.padding4, shadowColor: Colors.lightGray, shadowOpacity: 0.2, shadowRadius: 1, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ backgroundColor: Colors.lightGray6, width: 40, height: 40, borderRadius: Sizes.margin, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color={Colors.darkgray} />
                    </TouchableOpacity>
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 36, height: 36, borderRadius: Sizes.margin, backgroundColor: Colors.lightGray3, marginRight: Sizes.padding3 }} />
                            <View style={{ width: 100, height: 24, borderRadius: Sizes.padding3, backgroundColor: Colors.lightGray3 }} />
                        </View>
                    ) : (
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: friendUser?.photoURL! }} style={{ width: 36, height: 36, borderRadius: Sizes.margin, marginLeft: Sizes.padding2 }} />
                            <Text style={{ fontFamily: 'Semibold', fontSize: Fonts.md, marginLeft: Sizes.padding3 }}>
                                {friendUser?.displayName}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={{ backgroundColor: Colors.lightGray6, width: 40, height: 40, borderRadius: Sizes.margin, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.darkgray} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ChatHeader