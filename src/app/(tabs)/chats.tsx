import { Colors, Fonts, Sizes } from '@/src/constants';
import { auth, db } from '@/src/lib/firebase';
import useLatestMessageStore from '@/src/lib/latestMessage';
import { useRouter } from 'expo-router';
import { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';

const Chats = () => {

    const currentUser = auth.currentUser;

    const router = useRouter();

    const { latestMessages } = useLatestMessageStore();

    const [users, setUsers] = useState<User[] | null>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getFriends = async () => {
        setIsLoading(true);

        try {
            const currentUserId = currentUser?.uid;

            // Query friendRequests where either requesterId or recipientId matches currentUserId and status is 'accepted'
            const friendRequestsCollection = collection(db, 'friendRequests');
            const friendRequestsQuery = query(
                friendRequestsCollection,
                where('status', '==', 'accepted'),
                where('requesterId', '==', currentUserId),
                // where('recipientId', '==', currentUserId),
            );

            const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

            // Extract user IDs from friend requests
            const usersArray = friendRequestsSnapshot.docs.map((doc) => {
                const friendRequestData = doc.data();
                return friendRequestData.requesterId === currentUserId
                    ? friendRequestData.recipientId
                    : friendRequestData.requesterId;
            });

            // console.log('usersArray', usersArray);

            // Remove duplicates and the current user's ID
            const uniqueUsersArray = [...new Set(usersArray)].filter(
                (userId) => userId !== currentUserId
            );
            // console.log('uniqueUsersArray', uniqueUsersArray);

            // Fetch additional user details based on user IDs
            const usersDetailsPromises = uniqueUsersArray.map(async (userId) => {
                const userDoc = await getDoc(doc(db, 'users', userId));
                return { id: userId, ...userDoc.data() };
            });

            const usersDetails = await Promise.all(usersDetailsPromises);

            // Now you have the array of users who are friends with the current user
            // console.log('Friends:', usersDetails);
            setUsers(usersDetails as any);

            // Fetch the latest messages for each friend
            await getLatestMessages(currentUserId!, usersDetails);

        } catch (error) {
            console.log('Could not get users: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLatestMessage = async (currentUserId: string, friendId: string) => {
        try {
            const chatRoomId = [currentUserId, friendId].sort().join('_');

            const messageRef = collection(db, 'chats', chatRoomId, 'messages');

            const q = query(
                messageRef,
                orderBy('timestamp', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            const lastMessage = querySnapshot.docs.map((doc) => doc.data());

            return lastMessage;
        } catch (error) {
            console.log('Could not get last message: ', error);
        }
    };

    const getLatestMessages = async (currentUserId: string, usersDetails: any) => {
        try {
            setIsLoading(true);

            // Fetch the latest message for each friend
            const usersWithMessages = await Promise.all(
                usersDetails.map(async (friend: User) => {
                    try {
                        //  @ts-ignore
                        const chatRoomId = [currentUserId, friend.uid ?? friend?.id].sort().join('_');

                        const messageRef = collection(db, 'chats', chatRoomId, 'messages');

                        const q = query(
                            messageRef,
                            orderBy('timestamp', 'desc'),
                            limit(1)
                        );

                        const querySnapshot = await getDocs(q);

                        // console.log('querySnapshot', querySnapshot.docs[0]?.data());
                        // Check if there are any documents in the snapshot
                        if (querySnapshot.docs.length > 0) {
                            const latestMessage = querySnapshot.docs[0].data();

                            const timestamp = querySnapshot.docs[0]?.data()?.timestamp;

                            // Update Zustand store with latest message
                            // setLatestMessage(friend?.uid!, latestMessage?.content, timestamp);

                            return { ...friend, latestMessage, timestamp };
                        } else {
                            // No messages found, set latestMessage to an appropriate default value
                            return { ...friend, latestMessage: null };
                        }


                    } catch (error) {
                        console.log('Could not get last message: ', error);
                        return friend;
                    }
                })
            );

            setUsers(usersWithMessages);
        } catch (error) {
            console.error('Error fetching latest messages:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const renderItem = ({ item }: any) => {
        const friendId = item?.userId ?? item?.uid;

        const { content, timestamp } = latestMessages[friendId] || { content: '', timestamp: new Date() };

        return (
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/chat', params: { friendId: item?.userId ?? item?.uid } })}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: Sizes.padding4, paddingHorizontal: Sizes.padding5, backgroundColor: Colors.white, borderBottomColor: Colors.lightGray4, borderBottomWidth: 1 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '100%' }}>
                    <Image
                        source={{ uri: item?.photoURL! }}
                        style={{ width: 44, height: 44, borderRadius: 40 }}
                    />
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: Sizes.padding5 }}>
                            <Text style={{ fontSize: Fonts.md, fontFamily: 'Semibold', flex: 0.8 }}>
                                {item?.displayName}
                            </Text>
                            <Text style={{ fontSize: Fonts.xs, fontFamily: 'Regular', color: Colors.gray }}>
                                {moment(timestamp).format('LT')}
                            </Text>
                        </View>
                        <Text style={{ fontSize: Fonts.xs, fontFamily: 'Regular', color: Colors.gray, marginTop: Sizes.padding, paddingLeft: Sizes.padding5 }}>
                            {content || 'Start a conversation'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    useEffect(() => {
        getFriends();
        getLatestMessages(currentUser?.uid!, users!);
    }, [currentUser?.uid]);


    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1, position: 'relative' }}>

                {!isLoading && users?.length === 0 && (
                    <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: Sizes.margin6, paddingTop: Sizes.margin4 }}>
                        <Image
                            source={require('@/src/assets/images/no-chats.png')}
                            style={{ width: 220, height: 220, marginBottom: Sizes.padding4 }}
                        />
                        <Text style={{ fontSize: Fonts.md, fontFamily: 'Semibold', color: Colors.darkgray2 }}>
                            No chats yet
                        </Text>
                    </View>
                )}

                {isLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', margin: Sizes.margin6 }}>
                        <ActivityIndicator size='large' color={Colors.darkgray2} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item?.uid + Math.random().toString()}
                        renderItem={renderItem}
                        refreshing={isLoading}
                        style={{ flex: 1, width: '100%' }}
                        onRefresh={() => {
                            getFriends();
                        }}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 1, backgroundColor: Colors.lightGray4 }} />
                        )}
                    />
                )}
            </View>
        </ScrollView>
    )
}

export default Chats