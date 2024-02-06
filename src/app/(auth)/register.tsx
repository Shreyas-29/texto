import { useAuth } from '@/src/components';
import { Colors, Fonts, Sizes } from '@/src/constants';
import { auth, storage } from '@/src/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';

const Register = ({ navigation }: any) => {

    const { width, height } = Dimensions.get('window');

    const toast = useToast();


    // @ts-ignore
    const { register } = useAuth();

    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('');
    const [photoUrl, setPhotoUrl] = useState<string | null>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleRegister2 = async () => {
        setIsLoading(true);

        try {
            if (name && email && password && photoUrl) {
                const credentials = await createUserWithEmailAndPassword(auth, email, password);

                await updateProfile(credentials.user, { displayName: name, });

                const storage = getStorage();
                const profilePhotoRef = ref(storage, `profile_photos/${credentials.user?.uid}`);
                await uploadString(profilePhotoRef, photoUrl, 'data_url');

                const photoURL = await getDownloadURL(profilePhotoRef);

                updateProfile(credentials.user, { photoURL: photoURL });

                await AsyncStorage.setItem('@texto_token', credentials.user?.refreshToken || '');

                toast.show('You are Registered! 🎉');

                navigation.navigate('(tabs)');

                setName('');
                setEmail('');
                setPassword('');
                setPhotoUrl(null);
            } else {
                toast.show('Please fill all the fields!');
            }
        } catch (error: any) {
            if (error.code === 'auth/weak-password') {
                toast.show('The password is too weak.');
            } else if (error.code === 'auth/invalid-email') {
                toast.show('The email address is not valid.');
            } else {
                toast.show('Could not register, Please try again!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !photoUrl) {
            toast.show('Please fill all the fields!');
            return;
        }

        setIsLoading(true);

        try {
            let response = await register(name, photoUrl, email, password);

            if (response.success) {
                toast.show('You are Registered! 🎉');
                navigation.navigate('(tabs)');
            } else {
                toast.show(response.message);
            }
        } catch (error) {
            console.log('Error @handleRegister: ', error);
        } finally {
            setIsLoading(false);
        }
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
            // setPhotoUrl(result.assets[0].uri);

            setIsUploading(true);

            try {
                const uploadTask = await uploadProfilePhoto(result.assets[0]?.uri, auth.currentUser?.uid! || `@texto_token${Date.now()}${Math.random()}`);
                const photoURL = await getDownloadURL(uploadTask.ref);

                setPhotoUrl(photoURL);
            } catch (error) {
                console.log('Error @handleProfilePhotoPicker: ', error);
                toast.show('Could not upload profile photo. Please try again!');
            } finally {
                setIsUploading(false);
            }
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, padding: Sizes.small, alignItems: 'center', justifyContent: 'center' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : 'padding'}>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: Fonts.xl, textAlign: 'center', fontFamily: 'Bold' }}>
                        Sign Up
                    </Text>
                    <Text style={{ fontSize: Fonts.md, textAlign: 'center', color: Colors.gray, marginTop: 4, fontFamily: 'Regular' }}>
                        Create an account
                    </Text>
                </View>

                <View style={{ marginTop: Sizes.margin3 }}>
                    <View>
                        <Text style={{ fontSize: Fonts.sm, color: Colors.gray2, marginBottom: 4, marginLeft: 2, fontFamily: 'Medium' }}>
                            Name
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={(text) => setName(text)}
                            keyboardType='default'
                            textContentType='name'
                            placeholder='Enter your name'
                            placeholderTextColor={Colors.gray}
                            style={{ paddingHorizontal: Sizes.padding5, paddingTop: Sizes.base, paddingBottom: Sizes.base, width: width - 40, fontFamily: 'Regular', backgroundColor: Colors.lightGray4, borderRadius: Sizes.base }}
                        />
                    </View>

                    <View style={{ marginTop: Sizes.padding5 }}>
                        <Text style={{ fontSize: Fonts.sm, color: Colors.gray2, marginBottom: 4, marginLeft: 2, fontFamily: 'Medium' }}>
                            Email
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            keyboardType='email-address'
                            textContentType='emailAddress'
                            placeholder='Enter your email'
                            placeholderTextColor={Colors.gray}
                            style={{ paddingHorizontal: Sizes.padding5, paddingTop: Sizes.base, paddingBottom: Sizes.base, width: width - 40, fontFamily: 'Regular', backgroundColor: Colors.lightGray4, borderRadius: Sizes.base, textTransform: 'lowercase' }}
                        />
                    </View>

                    <View style={{ marginTop: Sizes.padding5 }}>
                        <Text style={{ fontSize: Fonts.sm, color: Colors.gray2, marginBottom: 4, marginLeft: 2, fontFamily: 'Medium' }}>
                            Password
                        </Text>
                        <TextInput
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            secureTextEntry={true}
                            textContentType='password'
                            placeholder='Enter your password'
                            placeholderTextColor={Colors.gray}
                            style={{ paddingHorizontal: Sizes.padding5, paddingTop: Sizes.base, paddingBottom: Sizes.base, width: width - 40, fontFamily: 'Regular', backgroundColor: Colors.lightGray4, borderRadius: Sizes.base }}
                        />
                    </View>

                    <View style={{ marginTop: Sizes.padding5 }}>
                        <TouchableOpacity onPress={handleProfilePhotoPicker}>
                            <View>
                                <Text style={{ fontSize: Fonts.sm, color: Colors.gray2, marginBottom: 4, marginLeft: 2, fontFamily: 'Medium' }}>
                                    Profile Photo
                                </Text>
                                {isUploading ? (
                                    <ActivityIndicator size='small' color={Colors.gray} />
                                ) : (
                                    <>
                                        {photoUrl ? (
                                            <Image source={{ uri: photoUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                                        ) : (
                                            <Text style={{ fontSize: Fonts.sm, color: Colors.gray, fontFamily: 'Regular' }}>Pick a profile photo</Text>
                                        )}
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: Colors.primary2, width: '100%', padding: Sizes.padding4, marginTop: Sizes.padding6, marginLeft: 'auto', marginRight: 'auto', borderRadius: Sizes.base, height: 44 }}
                        onPress={handleRegister}
                    >
                        {isLoading ? (
                            <ActivityIndicator size='small' color={Colors.white} />
                        ) : (
                            <Text style={{ color: Colors.white, fontFamily: 'Medium', textAlign: 'center' }}>
                                Register
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Sizes.padding5, justifyContent: 'center' }}>
                        <Text style={{ color: Colors.gray, fontFamily: 'Regular', textAlign: 'center' }}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: Colors.primary3, fontFamily: 'Medium', textAlign: 'center', marginLeft: 4 }}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Register