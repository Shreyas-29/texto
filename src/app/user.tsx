import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../components'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Sizes, settings } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import AwesomeAlert from 'react-native-awesome-alerts';
import { StatusBar } from 'expo-status-bar';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../lib/firebase';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';

const User = () => {

    const { user, logout } = useAuth();

    const router = useRouter();

    const toast = useToast();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
            toast.show('You are Logged Out!');
        } catch (error: any) {
            console.log('Logout error: ', error.message);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const uploadProfilePhoto = async (uri: string, uid: string) => {
        const profilePhotoRef = ref(storage, `profile_photos/${uid}`);
        const response = await fetch(uri);
        const blob = await response.blob();

        return uploadBytes(profilePhotoRef, blob);
    };

    const handleProfilePhotoPicker = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setIsUploading(true);

            try {
                const uploadTask = await uploadProfilePhoto(result.assets[0]?.uri, auth.currentUser?.uid! || `@texto_token${Date.now()}${Math.random()}`);
                const photoURL = await getDownloadURL(uploadTask.ref);

                setPhotoUrl(photoURL);
                await updateProfile(auth.currentUser!, { photoURL });
                toast.show('Profile photo updated successfully!');
            } catch (error) {
                console.log('Error @handleProfilePhotoPicker: ', error);
                toast.show('Could not upload profile photo. Please try again!');
            } finally {
                setIsUploading(false);
            }
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>

            <StatusBar animated style="dark" backgroundColor={Colors.white} />

            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding5, width: '100%', borderBottomColor: Colors.lightGray3, borderBottomWidth: 1 }}
                >
                    <Ionicons name="arrow-back-outline" size={22} color={Colors.darkgray2} />
                    <Text style={{ fontSize: Fonts.lg, color: Colors.darkgray2, fontFamily: 'Medium', marginLeft: Sizes.padding3 }}>
                        Settings
                    </Text>
                </TouchableOpacity>

                <View style={{ alignItems: 'flex-start', marginTop: Sizes.padding4, width: '100%', }}>
                    {/* Profile */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Sizes.padding4, paddingHorizontal: Sizes.padding6, borderBottomColor: Colors.lightGray3, borderBottomWidth: 1, width: '100%' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={handleProfilePhotoPicker}
                                style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 50, backgroundColor: Colors.lightGray3 }}
                            >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color={Colors.darkgray4} />
                                ) : (
                                    <Image source={{ uri: user?.photoURL! }} style={{ width: 50, height: 50, borderRadius: 50 }} />
                                )}
                            </TouchableOpacity>
                            <View style={{ alignItems: 'flex-start', marginLeft: Sizes.padding2 }}>
                                <Text style={{ fontSize: Fonts.md, color: Colors.darkgray4, fontFamily: 'Semibold', marginLeft: Sizes.padding3 }}>
                                    {user?.displayName}
                                </Text>
                                <Text style={{ fontSize: Fonts.sm, color: Colors.darkgray2, fontFamily: 'Regular', marginLeft: Sizes.padding3 }}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Settings */}
                    <View style={{ alignItems: 'flex-start', width: '100%', marginTop: Sizes.padding4 }}>
                        {settings?.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding5, borderBottomColor: Colors.lightGray4, borderBottomWidth: 1 }}
                            >
                                {/* @ts-ignore */}
                                <Ionicons name={item.icon} size={20} color={Colors.darkgray2} />
                                <View style={{ alignItems: 'flex-start', marginLeft: Sizes.padding2 }}>
                                    <Text style={{ fontSize: Fonts.sm, color: Colors.darkgray4, fontFamily: 'Medium', marginLeft: Sizes.padding3 }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ fontSize: Fonts.xs, color: Colors.darkgray2, fontFamily: 'Regular', marginLeft: Sizes.padding3 }}>
                                        {item.about}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <View style={{ flexDirection: 'column', alignItems: 'center', marginHorizontal: 'auto', width: '100%' }}>
                            <TouchableOpacity
                                onPress={handleToggle}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding6, borderBottomColor: Colors.lightGray4, borderBottomWidth: 1 }}
                            >
                                <Ionicons name="log-out-outline" size={20} color={Colors.red} />
                                <View style={{ alignItems: 'flex-start', marginLeft: Sizes.padding2 }}>
                                    <Text style={{ fontSize: Fonts.sm, color: Colors.red, fontFamily: 'Medium', marginLeft: Sizes.padding3 }}>
                                        Logout
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {/* Add below text for defining version of app */}
                            <Text style={{ fontSize: Fonts.xs, color: Colors.darkgray2, fontFamily: 'Regular', marginLeft: Sizes.padding3, marginTop: Sizes.margin }}>
                                Version 1.0.0
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <AwesomeAlert
                    show={isOpen}
                    showProgress={false}
                    title='Do you want to logout?'
                    message='This action cannot be undone.'
                    closeOnTouchOutside={true}
                    showCancelButton={true}
                    showConfirmButton={true}
                    cancelText='Cancel'
                    confirmText='Logout'
                    confirmButtonColor='#DD6B55'
                    onCancelPressed={() => setIsOpen(false)}
                    onConfirmPressed={handleLogout}

                    contentContainerStyle={{ borderRadius: 16, paddingTop: 16, paddingBottom: 0, }}
                    titleStyle={{ fontFamily: 'Medium', color: '#374151', marginHorizontal: 'auto', paddingHorizontal: 24, }}
                    messageStyle={{ fontFamily: 'Regular', color: '#4b5563', paddingBottom: Sizes.padding5 }}
                    contentStyle={{ padding: 4, marginBottom: 0 }}

                    actionContainerStyle={{ display: 'none', marginTop: 0, width: '100%' }}
                    cancelButtonStyle={{ display: 'none', paddingVertical: Sizes.caption, borderRadius: 0, backgroundColor: Colors.transparent, width: 140, alignItems: 'center' }}
                    // cancelButtonTextStyle={{ fontFamily: 'Medium', color: Colors.gray }}
                    // confirmButtonStyle={{ paddingVertical: Sizes.caption, borderRadius: 0, backgroundColor: Colors.transparent, width: 140, alignItems: 'center', borderLeftColor: Colors.lightGray3, borderLeftWidth: 1 }}
                    // confirmButtonTextStyle={{ fontFamily: 'Medium', color: Colors.red }}
                    overlayStyle={{ backgroundColor: Colors.transparentBlack4 }}
                    customView={
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTopColor: Colors.lightGray3, borderTopWidth: 1 }}>
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '48%', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding4 }}
                            >
                                <Text style={{ fontSize: Fonts.sm, color: Colors.gray, fontFamily: 'Medium', marginLeft: Sizes.padding3 }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <View style={{ width: 1, height: 40, backgroundColor: Colors.lightGray3 }} />
                            <TouchableOpacity
                                onPress={handleLogout}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '48%', paddingHorizontal: Sizes.padding6, paddingVertical: Sizes.padding4, borderLeftColor: Colors.lightGray4, borderLeftWidth: 1 }}
                            >
                                <Text style={{ fontSize: Fonts.sm, color: Colors.red, fontFamily: 'Medium', marginLeft: Sizes.padding3 }}>
                                    Logout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    )
}

export default User