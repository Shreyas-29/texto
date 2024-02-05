import { View, Text, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router'
import { useRoute } from '@react-navigation/native';
import { Colors, Sizes } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useToast } from 'react-native-toast-notifications';
import { Feather, Ionicons } from '@expo/vector-icons';

const ImagePreview = () => {

    const { width } = Dimensions.get('screen');

    const route = useRoute();
    const { imageUrl } = route?.params as any;

    const router = useRouter();

    const toast = useToast();

    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status === 'granted') {
                const fileUri = FileSystem.cacheDirectory + 'TextoImage.jpg';

                // Download the image to the local file system
                await FileSystem.downloadAsync(imageUrl, fileUri);

                // Save the image to the media library
                await MediaLibrary.saveToLibraryAsync(fileUri);

                toast.show('Image saved to gallery!');
            } else {
                toast.show('Permission denied!');
            }
        } catch (error) {
            console.error('Error downloading image:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            // Download the image to the local file system
            const { uri } = await FileSystem.downloadAsync(imageUrl, FileSystem.documentDirectory + 'image.jpg');

            // Share the local file
            await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share this image' });
        } catch (error) {
            console.error('Error sharing image:', error);
            toast.show('Could not share image at the moment!');
        } finally {
            setIsSharing(false);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <StatusBar style='dark' backgroundColor={Colors.transparentBlack1} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', position: 'absolute', top: Sizes.padding4, left: Sizes.padding4 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: Sizes.padding4 }}>
                    <Ionicons name='arrow-back-outline' size={24} color={Colors.darkgray2} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: width, height: 400, padding: Sizes.padding4 }}>
                <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: Sizes.padding6 }} />
            </View>
            <View style={{ flexDirection: 'row', marginTop: Sizes.padding4, paddingHorizontal: Sizes.padding4, gap: Sizes.padding4 }}>
                <TouchableOpacity onPress={handleDownload} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Sizes.padding4, backgroundColor: Colors.transparentBlack1, borderRadius: Sizes.small }}>
                    {isDownloading ? (
                        <ActivityIndicator size='small' color={Colors.darkgray2} />
                    ) : (
                        <>
                            <Feather name='download' size={16} color={Colors.darkgray2} style={{ marginRight: Sizes.padding2 }} />
                            <Text style={{ color: Colors.darkgray2, fontFamily: 'Medium' }}>
                                Download
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Sizes.padding4, backgroundColor: Colors.transparentBlack1, borderRadius: Sizes.small }}>
                    {isSharing ? (
                        <ActivityIndicator size='small' color={Colors.darkgray2} />
                    ) : (
                        <>
                            <Feather name='share-2' size={16} color={Colors.darkgray2} style={{ marginRight: Sizes.padding2 }} />
                            <Text style={{ color: Colors.darkgray2, fontFamily: 'Medium' }}>
                                Share
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ImagePreview
