import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AuthProvider, Header, ToasterProvider, useAuth } from '../components';
import { Colors } from '../constants';
import AuthLayout from './(auth)/_layout';
import TabLayout from './(tabs)/_layout';
import Welcome from '.';
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from './user';
import { Slot, useRouter } from 'expo-router';
import Chat from './chat';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ImagePreview from './image';

const Stack = createNativeStackNavigator();
// const a = createStackNavigator

export default function RootLayout() {
    // useEffect(() => {
    // const getUser = async () => {
    //     const token = await AsyncStorage.getItem('@texto_token');
    //     if (token) {
    //         setUser(true);
    //     } else {
    //         setUser(false);
    //     }
    // };
    // getUser(); if (typeof isAuthenticated === 'undefined') return;

    // }, []);

    const [loaded, error] = useFonts({
        'Light': require('@/src/assets/fonts/DMSans-Light.ttf'),
        'Regular': require('@/src/assets/fonts/DMSans-Regular.ttf'),
        'Medium': require('@/src/assets/fonts/DMSans-Medium.ttf'),
        'Semibold': require('@/src/assets/fonts/DMSans-SemiBold.ttf'),
        'Bold': require('@/src/assets/fonts/DMSans-Bold.ttf'),
        'Extrabold': require('@/src/assets/fonts/DMSans-ExtraBold.ttf'),
        'Title': require('@/src/assets/fonts/GrandHotel-Regular.ttf'),
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    // if (!isUser) {
    //     return (
    //         <AuthProvider>
    //             <ToasterProvider>
    //                 <RootLayoutNavAuth />
    //             </ToasterProvider>
    //         </AuthProvider>
    //     );
    // }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <ToasterProvider>
                    <RootLayoutNav />
                </ToasterProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
};

function RootLayoutNav() {

    const { isAuthenticated } = useAuth();

    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('(tabs)' as never);
        } else {
            router.replace('(auth)' as never);
        }
    }, [isAuthenticated]);

    return (
        <Stack.Navigator
            initialRouteName='(tabs)'
            screenOptions={{
                // animation: 'slide_from_right',
                animationTypeForReplace: 'pop',
            }}
        >
            <Stack.Screen
                name='index'
                component={Welcome}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='(tabs)'
                component={TabLayout}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    header: () => (
                        <Header />
                    ),
                }}
            />
            <Stack.Screen
                name='user'
                component={User}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    headerShown: false,
                    presentation: 'modal',
                    gestureEnabled: true,
                    gestureDirection: 'vertical',
                }}
            />
            <Stack.Screen
                name='chat'
                component={Chat}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    headerShown: false,
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name='image'
                component={ImagePreview}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name='(auth)'
                component={AuthLayout}
                options={{
                    statusBarColor: Colors.white,
                    statusBarStyle: 'dark',
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );

    // return (
    //     <Slot />
    // );
};

// function RootLayoutNavAuth() {
//     return (
//         <Stack.Navigator
//             initialRouteName='index'
//             screenOptions={{
//                 animation: 'slide_from_right',
//             }}
//         >
//             <Stack.Screen
//                 name='index'
//                 component={Welcome}
//                 options={{
//                     statusBarColor: Colors.white,
//                     statusBarStyle: 'dark',
//                     headerShown: false,
//                 }}
//             />
//             <Stack.Screen
//                 name='(auth)'
//                 component={AuthLayout}
//                 options={{
//                     statusBarColor: Colors.white,
//                     statusBarStyle: 'dark',
//                     headerShown: false,
//                 }}
//             />
//             <Stack.Screen
//                 name='(tabs)'
//                 component={TabLayout}
//                 options={{
//                     statusBarColor: Colors.white,
//                     statusBarStyle: 'dark',
//                     header: () => (
//                         <Header />
//                     ),
//                     headerTitle: '',
//                 }}
//             />
//         </Stack.Navigator>
//     );
// };
