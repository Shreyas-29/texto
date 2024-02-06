import { Colors, Fonts, Sizes } from '@/src/constants';
import { auth } from '@/src/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, LayoutAnimation, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';

interface Props {
    value: string;
    friendId: string;
    imageUrl: string;
    isUploading: boolean;
    onChangeText: (text: string) => void;
    handleClose: () => void;
    handleSendMessage: () => void;
    handleUploadImage: () => void;
}

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const ChatInput = ({ value, friendId, imageUrl, isUploading, onChangeText, handleClose, handleSendMessage, handleUploadImage }: Props) => {

    const currentUser = auth.currentUser;

    const inputRef = useRef(null);

    const toast = useToast();

    const [showSendButton, setShowSendButton] = useState<boolean>(false);

    useEffect(() => {
        LayoutAnimation.easeInEaseOut();
        setShowSendButton(value.trim() !== '');
    }, [value]);

    return (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingVertical: Sizes.padding3, paddingHorizontal: Sizes.padding4, borderTopColor: Colors.lightGray3, borderTopWidth: 1, height: 60, backgroundColor: Colors.white, width: '100%' }}>

            {imageUrl && (
                <View style={{ position: 'absolute', bottom: Sizes.margin4, right: Sizes.padding4, width: '100%', height: 200, backgroundColor: Colors.transparentBlack1, borderRadius: Sizes.small }}>
                    {isUploading ? (
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'
                        }}>
                            <ActivityIndicator size="small" color={Colors.darkgray} />
                        </View>
                    ) : (
                        <View style={{
                            position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightGray, borderRadius: Sizes.small, width: '100%', height: '100%', marginRight: Sizes.padding3, marginBottom: Sizes.padding3
                        }}>
                            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: Sizes.small }} />
                            <TouchableOpacity style={{ position: 'absolute', right: Sizes.padding4, top: Sizes.padding4, zIndex: 50, backgroundColor: Colors.transparentBlack5, borderRadius: Sizes.margin, padding: Sizes.padding2 }} onPress={handleClose}>
                                <Ionicons name="close-outline" size={20} color={Colors.lightGray4} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            <Animated.View
                style={{
                    position: 'relative', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: 'rgba(229,231,235,0.5)', borderRadius: Sizes.margin5, paddingHorizontal: Sizes.padding5, paddingVertical: 0, height: 40,
                }}
            >
                <TouchableOpacity style={{ position: 'absolute', left: Sizes.padding4, zIndex: 50 }}>
                    <Image source={require('@/src/assets/images/happy.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>
                <TextInput
                    multiline
                    value={value}
                    ref={inputRef}
                    onChangeText={(text) => onChangeText(text)}
                    keyboardType='twitter'
                    placeholder='Type a message'
                    style={{ width: '100%', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding, marginVertical: Sizes.padding2, fontFamily: 'Regular', fontSize: Fonts.md }}
                />
                <TouchableOpacity style={{ position: 'absolute', right: Sizes.padding4, zIndex: 50 }} onPress={handleUploadImage}>
                    <Image source={require('@/src/assets/images/upload2.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>
            </Animated.View>

            {showSendButton && (
                <TouchableOpacity
                    onPress={handleSendMessage}
                    style={{ marginLeft: Sizes.padding3, height: 40, width: 40, borderRadius: Sizes.margin5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}
                >
                    <Image source={require('@/src/assets/images/send.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default ChatInput