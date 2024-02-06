import { Colors, Sizes } from '@/src/constants';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    imageUrl: string;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageModal = ({ imageUrl, isOpen, setIsOpen }: Props) => {

    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status === 'granted') {
                await MediaLibrary.saveToLibraryAsync(imageUrl);
                // Provide feedback to the user if needed
            } else {
                // Handle the case where permission is not granted
            }
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const handleShare = async () => {
        try {
            await Sharing.shareAsync(imageUrl, { mimeType: 'image/jpeg', dialogTitle: 'Share this image' });
        } catch (error) {
            console.error('Error sharing image:', error);
        }
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={isOpen}
            onDismiss={() => setIsOpen(false)}
            onTouchCancel={() => setIsOpen(false)}
        >
            <View style={{ flex: 1, backgroundColor: Colors.transparentBlack2 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Pressable onPress={() => setIsOpen((prev) => !prev)} style={{ flex: 1 }} />
                    <View style={{ backgroundColor: 'white', padding: Sizes.padding4, width: '100%', alignItems: 'center', position: 'relative' }}>
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 200, borderRadius: Sizes.small }} />
                        <View style={{ flexDirection: 'row', marginTop: Sizes.padding4 }}>
                            <TouchableOpacity onPress={handleDownload} style={{ flex: 1, alignItems: 'center' }}>
                                <Text>Download</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={{ flex: 1, alignItems: 'center' }}>
                                <Text>Share</Text>
                            </TouchableOpacity>
                        </View>
                        <Pressable onPress={() => setIsOpen(false)} style={{ backgroundColor: Colors.transparentWhite1, position: 'absolute', top: Sizes.padding4, right: Sizes.padding4, flexDirection: 'column', alignItems: 'center', padding: Sizes.padding, zIndex: 50 }} >
                            <Ionicons name="close" size={20} color={Colors.darkgray2} style={{ position: 'absolute', top: Sizes.padding5, right: Sizes.padding5 }} />
                        </Pressable>
                    </View>
                    <Pressable onPress={() => setIsOpen(false)} style={{ flex: 1 }} />
                </View>
            </View>
        </Modal>
    )
}

export default ImageModal