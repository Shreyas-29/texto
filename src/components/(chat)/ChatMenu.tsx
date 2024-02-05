import { View, Text, TouchableOpacity, Animated } from 'react-native'
import React from 'react'
import { Colors, Sizes } from '@/src/constants'
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { auth } from '@/src/lib/firebase';
import { Message } from '@/src/types/message';

interface Props {
    friendId: string;
    selectedMessage: Message;
    setShowMenu: (value: React.SetStateAction<boolean>) => void;
    handleDeleteMessage: () => void;
}

const ChatMenu = ({ friendId, selectedMessage, setShowMenu, handleDeleteMessage }: Props) => {

    const router = useRouter();

    const currentUser = auth.currentUser;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: Colors.white, borderBottomColor: Colors.lightGray3, borderBottomWidth: 1, paddingHorizontal: Sizes.padding4, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ backgroundColor: Colors.lightGray6, width: 40, height: 40, borderRadius: Sizes.margin, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: [{ scale: new Animated.Value(1) }], }}
                        onPress={() => setShowMenu(false)}
                    >
                        <Ionicons name="close" size={20} color={Colors.darkgray} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Sizes.base }}>
                    {selectedMessage?.senderId === currentUser?.uid && (
                        <TouchableOpacity style={{ backgroundColor: Colors.lightGray6, width: 40, height: 40, borderRadius: Sizes.margin, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onPress={() => handleDeleteMessage()}>
                            <Feather name='trash' size={20} color={Colors.darkgray} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={{ backgroundColor: Colors.lightGray6, width: 40, height: 40, borderRadius: Sizes.margin, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onPress={() => setShowMenu(false)}>
                        <Ionicons name='ellipsis-vertical' size={20} color={Colors.darkgray} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default ChatMenu