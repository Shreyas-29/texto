import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/src/lib/firebase'
import { useToast } from 'react-native-toast-notifications';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Colors, Fonts, Sizes } from '@/src/constants';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-virtualized-view';

interface Request {
    id: string;
    requesterName: string;
    requesterEmail: string;
    recipientId: string;
    requesterId: string;
    status: string;
}

const Friends = () => {

    const currentUser = auth.currentUser;

    const toast = useToast();

    const [friendRequests, setFriendRequests] = useState<Request[]>([]);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // useEffect(() => {
    //     const fetchFriendRequests = async () => {
    //         try {
    //             const userId = currentUser?.uid;

    //             console.log('userId', userId)

    //             if (userId) {
    //                 const friendRequestsCollection = collection(db, 'friendRequests');
    //                 const friendRequestsQuery = query(friendRequestsCollection, where('recipientId', '==', userId));

    //                 console.log('friendRequestsQuery', friendRequestsQuery)

    //                 const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

    //                 console.log('friendRequestsSnapshot', friendRequestsSnapshot)

    //                 const requestsData = friendRequestsSnapshot.docs.map(doc => ({
    //                     id: doc.id,
    //                     ...doc.data(),
    //                 }));

    //                 console.log('requestsData', requestsData)

    //                 setFriendRequests(requestsData);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching friend requests:', error);
    //         }
    //     };

    //     fetchFriendRequests();
    // }, []);

    const handleAcceptRequest = async (friendRequest: Request) => {
        try {
            // Update the status in Firestore
            const requestDocRef = doc(db, 'friendRequests', friendRequest.id);
            await updateDoc(requestDocRef, { status: 'accepted' });

            // Update the local state to reflect the accepted status
            const updatedFriendRequests = friendRequests.filter((request) =>
                request.id === friendRequest.id ? { ...request, status: 'accepted' } : request
            );
            // console.log('updatedFriendRequests', updatedFriendRequests, 'friendRequests', friendRequests);
            setFriendRequests(updatedFriendRequests);
            toast.show(`You are now friends with ${friendRequest.requesterName}`);
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDeclineRequest = async (friendRequest: Request) => {
        try {
            const requestDocRef = doc(db, 'friendRequests', friendRequest.id);
            await updateDoc(requestDocRef, { status: 'declined' });

            toast.show(`You declined ${friendRequest.requesterName}'s friend request`);

            const updatedFriendRequests = friendRequests.filter((request) => request.id !== friendRequest.id);
            // console.log('updatedFriendRequests', updatedFriendRequests, 'friendRequests', friendRequests);
            setFriendRequests(updatedFriendRequests);
        } catch (error) {
            console.error('Error declining friend request:', error);
        }
    };

    const renderItem = ({ item }: { item: Request }) => {
        return (
            <View style={{ padding: Sizes.padding4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: Fonts.md, fontFamily: 'Semibold' }}>{item?.requesterName}</Text>
                    <Text style={{ fontSize: Fonts.sm, fontFamily: 'Regular', color: Colors.gray }}>{item?.requesterEmail}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ height: Sizes.margin2, width: Sizes.margin2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: Sizes.margin2, marginRight: Sizes.padding3, borderColor: Colors.gray, borderWidth: 1 }}
                        onPress={() => handleDeclineRequest(item)}
                    >
                        <Ionicons name='close-outline' size={24} color={Colors.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ height: Sizes.margin2, width: Sizes.margin2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: Sizes.margin2, borderColor: Colors.primary2, borderWidth: 1 }}
                        onPress={() => handleAcceptRequest(item)}
                    >
                        <Ionicons name='checkmark-outline' size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    // const fetchFriendRequests = async () => {
    //     setIsRefreshing(true);
    //     try {
    //         const userId = currentUser?.uid;

    //         if (userId) {
    //             // Get all friend requests where the current user is the recipient
    //             const friendRequestsCollection = collection(db, 'friendRequests');
    //             const friendRequestsQuery = query(friendRequestsCollection, where('recipientId', '==', userId));
    //             const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

    //             // const requestsDataPromises = friendRequestsSnapshot.docs.map(async (document) => {
    //             //     const requestData = document.data();
    //             //     const requesterId = requestData.requesterId;

    //             //     // Fetch additional user data for each friend request
    //             //     const userDoc = await getDoc(doc(db, 'users', requesterId));
    //             //     const userData = userDoc.data();

    //             //     // Combine friend request data with user data
    //             //     return {
    //             //         id: document.id,
    //             //         ...requestData,
    //             //         requesterName: userData?.displayName,
    //             //         requesterEmail: userData?.email,
    //             //     };
    //             // });
    //             const requestsDataPromises = friendRequestsSnapshot.docs.map(async (document) => {
    //                 const requestData = document.data();
    //                 const requesterId = requestData.requesterId;

    //                 // Fetch additional user data for each friend request
    //                 const userDoc = await getDoc(doc(db, 'users', requesterId));
    //                 const userData = userDoc.data();

    //                 // Combine friend request data with user data
    //                 return {
    //                     id: document.id,
    //                     recipientId: requestData.recipientId,
    //                     requesterId: requestData.requesterId,
    //                     requesterName: userData?.displayName,
    //                     requesterEmail: userData?.email,
    //                     status: requestData?.status,
    //                 };
    //             });


    //             const requestsData = await Promise.all(requestsDataPromises);
    //             setFriendRequests(requestsData);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching friend requests:', error);
    //     } finally {
    //         setIsRefreshing(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchFriendRequests();
    // }, []);

    const fetchFriendRequests = async () => {
        setIsRefreshing(true);
        try {
            const userId = currentUser?.uid;

            if (userId) {
                // Get all friend requests where the current user is the recipient and status is not 'accepted'
                const friendRequestsCollection = collection(db, 'friendRequests');
                const friendRequestsQuery = query(friendRequestsCollection,
                    where('recipientId', '==', userId),
                    where('status', '!=', 'accepted')
                );
                const friendRequestsSnapshot = await getDocs(friendRequestsQuery);

                // console.log('friendRequestsSnapshot', friendRequestsSnapshot);

                const requestsDataPromises = friendRequestsSnapshot.docs.map(async (document) => {
                    const requestData = document.data();
                    const requesterId = requestData.requesterId;

                    // console.log('requestData', requestData);

                    // Fetch additional user data for each friend request
                    const userDoc = await getDoc(doc(db, 'users', requesterId));
                    const userData = userDoc.data();

                    // console.log('userData', userData);

                    // Combine friend request data with user data
                    return {
                        id: document.id,
                        recipientId: requestData.recipientId,
                        requesterId: requestData.requesterId,
                        requesterName: userData?.displayName,
                        requesterEmail: userData?.email,
                        status: requestData?.status,
                    };
                });

                const requestsData = await Promise.all(requestsDataPromises);
                setFriendRequests(requestsData);
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFriendRequests();
    }, [friendRequests]);



    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: Colors.white }}
            // contentContainerStyle={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    tintColor={Colors.darkgray}
                    refreshing={isRefreshing}
                    onRefresh={() => {
                        fetchFriendRequests();
                    }}
                />
            }
        >
            <View style={{ flex: 1 }}>
                {friendRequests?.length === 0 && (
                    <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: Sizes.margin6, paddingTop: Sizes.margin4 }}>
                        <Image
                            source={require('@/src/assets/images/no-friend-request.png')}
                            style={{ width: 200, height: 200, marginBottom: Sizes.padding4 }}
                        />
                        <Text style={{ fontSize: Fonts.md, fontFamily: 'Semibold' }}>
                            No Friend Requests
                        </Text>
                    </View>
                )}
                <FlatList
                    data={friendRequests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: Colors.lightGray4 }} />
                    )}
                />
            </View>
        </ScrollView>
    )
}

export default Friends