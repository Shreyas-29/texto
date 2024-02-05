import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { TapGestureHandler, State, LongPressGestureHandler, GestureEvent } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Sizes } from '@/src/constants';
import { Message as MessageProps } from '@/src/types/message';
import { Timestamp } from 'firebase/firestore';
import { LongPressGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/longPressGesture';
import ImageModal from '../(modals)/ImageModal';
import { useRouter } from 'expo-router';

interface Props {
    message: MessageProps;
    isCurrentUser: boolean;
    onLongPress: (event: any) => void;
    setShowMenu: (show: boolean) => void;
}

const Message = ({ message, isCurrentUser, onLongPress }: Props) => {

    const router = useRouter();

    const menuRef = useRef(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const gradientColors = isCurrentUser
        ? [Colors.primaryLight, Colors.primary2]
        : [Colors.lightGray3, Colors.lightGray3];

    const handleLongPress = (nativeEvent: GestureEvent) => {
        onLongPress(nativeEvent);
        // @ts-ignore
        menuRef?.current?.setShowMenu(false);
    };

    const formatTimestamp = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // console.log('message url', message?.imageUrl);

    return (
        <View style={{
            flex: 1,
            width: '100%',
            // position: 'relative',
            flexDirection: 'column',
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
            alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        }}>
            <LongPressGestureHandler onHandlerStateChange={handleLongPress} minDurationMs={800}>
                <LinearGradient
                    style={{
                        maxWidth: '80%',
                        borderRadius: Sizes.padding4,
                        paddingHorizontal: message?.imageUrl ? Sizes.padding4 : Sizes.padding5,
                        paddingVertical: message?.imageUrl ? Sizes.padding4 : Sizes.padding4,
                        // paddingTop: Sizes.padding2,
                        // paddingBottom: Sizes.padding5,
                        // paddingLeft: Sizes.padding3,
                        // paddingRight: Sizes.padding7,
                        // flexDirection: 'column',
                        // alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    }}
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                >
                    {message?.imageUrl && (
                        <TouchableOpacity
                            onPress={() => {
                                // setIsOpen(true);
                                router.push({
                                    pathname: '/image',
                                    params: { imageUrl: message?.imageUrl as string },
                                })
                            }}
                            style={{
                                width: 200, height: 200, backgroundColor: Colors.transparentBlack1, borderRadius: Sizes.small
                            }}
                        >
                            <Image source={{ uri: message?.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: Sizes.small }} />
                        </TouchableOpacity>
                    )}

                    {/* {isOpen && (
                        <ImageModal
                            imageUrl={message?.imageUrl!}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                        />
                    )} */}

                    <Text style={{ color: isCurrentUser ? Colors.white : Colors.darkgray3, fontFamily: 'Regular', fontSize: Fonts.sm, marginTop: message?.imageUrl ? Sizes.padding2 : 0 }}>
                        {message?.content}
                    </Text>
                </LinearGradient>
            </LongPressGestureHandler>
            {/* <Text style={{ color: Colors.lightGray4, marginTop: Sizes.padding, fontFamily: 'Regular', fontSize: Fonts.xxs, position: 'absolute', bottom: Sizes.padding2, right: Sizes.padding3 }}>
                {formatTimestamp(message?.timestamp)}
            </Text> */}
            <Text style={{ color: Colors.gray, marginTop: Sizes.padding, fontFamily: 'Regular', fontSize: Fonts.xxs, }}>
                {formatTimestamp(message?.timestamp)}
            </Text>
        </View>
    )
}

export default Message