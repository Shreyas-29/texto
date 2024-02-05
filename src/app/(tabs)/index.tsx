import { View, Text, Button, FlatList, ActivityIndicator } from 'react-native'
import React, { cloneElement, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { auth, db } from '@/src/lib/firebase'
import { useRouter } from 'expo-router'
import { User, deleteUser, signOut } from 'firebase/auth'
import { Toast, useToast } from 'react-native-toast-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import firestore, { collection, getDocs, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Item, useAuth } from '@/src/components'
import { Colors } from '@/src/constants'

const Home = ({ navigation }: any) => {

    const currentUser = auth.currentUser;

    const toast = useToast();

    const { logout } = useAuth();

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigation.navigate('index');
            toast.show('You are Logged Out!');
        } catch (error: any) {
            console.log('Logout error: ', error.message);
        }
    };

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('@texto_token');

            if (!token && !currentUser) {
                navigation.navigate('(auth)');
            } else {
                // navigation.navigate('(tabs)');
                const currentUserId = currentUser?.uid;

                const q = query(collection(db, 'users'));
                // const userCollection = await 
                // const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(q);

                const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                // usersSnapshot.forEach((doc) => {
                //     console.log(doc.id, ' => ', doc.data());
                //     setUsers((prev) => [...prev, doc.data()]);
                // });

                const otherUsers = allUsers.filter((user) => user?.id !== currentUserId);

                setUsers(otherUsers);
            }
        } catch (error) {
            console.log('Could not get users: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1 }}>
                {/* <View style={{ padding: 16 }}>
                    <Button title='Logout' onPress={handleLogout} />
                </View> */}
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size={28} color={Colors.primary2} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item?.id}
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            getUsers();
                        }}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 1, backgroundColor: Colors.lightGray4 }} />
                        )}
                        renderItem={({ item }) => (
                            <Item
                                user={item}
                                isLoading={isLoading}
                            />
                        )}
                    />
                )}
            </View>
        </View>
    )
};

export default Home