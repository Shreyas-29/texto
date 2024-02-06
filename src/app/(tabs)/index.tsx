import { Item } from '@/src/components'
import { Colors } from '@/src/constants'
import { auth, db } from '@/src/lib/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

const Home = ({ navigation }: any) => {

    const currentUser = auth.currentUser;

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('@texto_token');

            if (!token && !currentUser) {
                navigation.navigate('(auth)');
            } else {
                const currentUserId = currentUser?.uid;

                const q = query(collection(db, 'users'));
                const usersSnapshot = await getDocs(q);

                const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    }, [currentUser]);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size={28} color={Colors.primary2} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item?.id}
                        refreshing={isLoading}
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