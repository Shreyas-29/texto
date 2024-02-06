import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Welcome from '.';
import { AuthProvider, Header, ToasterProvider, useAuth } from '../components';
import { Colors } from '../constants';
import AuthLayout from './(auth)/_layout';
import TabLayout from './(tabs)/_layout';
import Chat from './chat';
import ImagePreview from './image';
import Profile from './profile';
import User from './user';

const Stack = createNativeStackNavigator();

export default function RootLayout() {

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
        <Stack.Navigator initialRouteName='(tabs)'>
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
                name='profile'
                component={Profile}
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

};
