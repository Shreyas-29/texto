import { useAuth } from '@/src/components';
import { Colors, Fonts, Sizes } from '@/src/constants';
import { auth } from '@/src/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIdToken, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';

const Login = ({ navigation }: any) => {

    const { width, height } = Dimensions.get('window');

    const toast = useToast();

    // @ts-ignore
    const { login } = useAuth();

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin2 = async () => {
        setIsLoading(true);
        // Implement login with firebase using email and password
        try {
            if (email && password) {
                await signInWithEmailAndPassword(auth, email, password);

                await AsyncStorage.getItem('@texto_token');

                toast.show('You are Logged In! 🎉');

                // router.push('/(tabs)');
                navigation.navigate('(tabs)');

                setEmail('');
                setPassword('');
            } else {
                toast.show('Please fill all the fields!');
            }
        } catch (error) {
            console.log('Login error: ', error);
            toast.show('Could not login, Please try again!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            toast.show('Please enter email and password.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await login(email, password);

            if (response.success) {
                toast.show('You are Logged In! 🎉');
                navigation.navigate('(tabs)');
            } else {
                toast.show(response.message);
            }
        } catch (error) {
            console.log('Error @handleLogin: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, padding: Sizes.small, alignItems: 'center', justifyContent: 'center' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : 'padding'}>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: Fonts.xl, textAlign: 'center', fontFamily: 'Bold' }}>
                        Sign In
                    </Text>
                    <Text style={{ fontSize: Fonts.sm, textAlign: 'center', color: Colors.gray, marginTop: 4, fontFamily: 'Regular' }}>
                        Sign In to your account
                    </Text>
                </View>

                <View style={{ marginTop: Sizes.margin3 }}>
                    <View>
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

                    <TouchableOpacity
                        style={{ backgroundColor: Colors.primary2, width: '100%', padding: Sizes.padding4, marginTop: Sizes.padding6, marginLeft: 'auto', marginRight: 'auto', borderRadius: Sizes.base, height: 44 }}
                        onPress={handleLogin}
                    >
                        {isLoading ? (
                            <ActivityIndicator size='small' color={Colors.white} />
                        ) : (
                            <Text style={{ color: Colors.white, fontFamily: 'Medium', textAlign: 'center' }}>
                                Login
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Sizes.padding5, justifyContent: 'center' }}>
                        <Text style={{ color: Colors.gray, fontFamily: 'Regular', textAlign: 'center' }}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={{ color: Colors.primary3, fontFamily: 'Medium', textAlign: 'center', marginLeft: 4 }}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Login