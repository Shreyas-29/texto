import { Colors, Fonts, Sizes } from '@/src/constants';
import { auth, db } from '@/src/lib/firebase';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';

interface Props {
    user: User | null;
    isLoading: boolean;
}

interface Friend {
    user: User & { id: string };
    isLoading: boolean;
}

const Item = ({ user }: Friend) => {

    const currentUser = auth.currentUser;

    const toast = useToast();

    const router = useRouter();

    const pathname = useRoute().name;

    const [requestSent, setRequestSent] = useState<boolean>(false);
    const [friendRequestStatus, setFriendRequestStatus] = useState<"pending" | "accepted" | "rejected" | "">("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSendRequest2 = async (currentUserId: string) => {
        try {
            setIsLoading(true);

            const friendId = user?.id;

            // Check if the Ids are valid
            if (!currentUserId || !friendId) {
                console.error('Invalid user IDs');
                toast.show('Invalid user IDs. Please try again.');
                setIsLoading(false);
                return;
            }

            // Check if a friend request already sent
            const existingRequest = await getDoc(doc(db, 'friendRequests', `${currentUserId}_${friendId}`));

            if (existingRequest.exists()) {
                toast.show('Friend Request already sent!');
                setIsLoading(false);
                setFriendRequestStatus('pending');
                return;
            }

            // Add a new friend request
            const requestDocRef = doc(db, 'friendRequests', `${currentUserId}_${friendId}`);
            await setDoc(requestDocRef, {
                requesterId: currentUserId,
                recipientId: friendId,
                status: 'pending',
            });

            toast.show(`Request sent to ${user?.displayName}`);
            setRequestSent(true);
        } catch (error: any) {
            console.log('Friend Request error: ', error.message);
            toast.show('Could not send Friend Request!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async (currentUserId: string) => {
        try {
            setIsLoading(true);

            const friendId = user?.id;

            if (friendRequestStatus === 'pending' || friendRequestStatus === 'accepted') {
                setIsLoading(false);
                // add here code to navigate to chat screen
                router.push({
                    pathname: '/chat',
                    params: {
                        friendId: friendId
                    }
                });
                return;
            };

            // Check if the Ids are valid
            if (!currentUserId || !friendId) {
                console.error('Invalid user IDs');
                toast.show('Invalid user IDs. Please try again.');
                setIsLoading(false);
                return;
            }

            // Check if a friend request already sent
            const existingRequest = await getDoc(doc(db, 'friendRequests', `${currentUserId}_${friendId}`));

            if (existingRequest.exists()) {
                toast.show('Friend Request already sent!');
                setIsLoading(false);
                setFriendRequestStatus('pending'); // Update friendRequestStatus
                return;
            }

            // Add a new friend request
            const requestDocRef = doc(db, 'friendRequests', `${currentUserId}_${friendId}`);
            await setDoc(requestDocRef, {
                requesterId: currentUserId,
                recipientId: friendId,
                status: 'pending',
            });

            toast.show(`Request sent to ${user?.displayName}`);
            setFriendRequestStatus('pending'); // Update friendRequestStatus
        } catch (error: any) {
            console.log('Friend Request error: ', error.message);
            toast.show('Could not send Friend Request!');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRequest = async () => {
        try {
            const userId = currentUser?.uid;
            const friendId = user?.id;

            if (userId) {
                const requestDocRef = doc(db, 'friendRequests', `${userId}_${friendId}`);

                const unsubscribe = onSnapshot(requestDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const { status } = snapshot.data();
                        setFriendRequestStatus(status);
                    } else {
                        setFriendRequestStatus('');
                    }
                });

                // Remember to store the unsubscribe function to later stop listening when needed
                return unsubscribe;
            }
        } catch (error) {
            console.error('Error fetching friend request status:', error);
        }
    };

    useEffect(() => {
        const unsubscribePromise = fetchRequest();

        // Cleanup function to unsubscribe when the component unmounts
        return () => {
            unsubscribePromise.then(unsubscribe => {
                unsubscribe && unsubscribe();
            });
        };
    }, [pathname, requestSent, currentUser?.uid, user?.id]);

    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: Sizes.padding4, paddingHorizontal: Sizes.padding5, backgroundColor: Colors.white
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                    source={{ uri: user?.photoURL! }}
                    style={{ width: 44, height: 44, borderRadius: 40 }}
                />
                <View style={{ alignItems: 'flex-start', marginLeft: Sizes.padding5 }}>
                    <Text style={{ fontSize: Fonts.md, fontFamily: 'Semibold' }}>
                        {user?.displayName}
                    </Text>
                    <Text style={{ fontSize: Fonts.sm, fontFamily: 'Regular', color: Colors.gray }}>
                        {user?.email?.slice(0, 18) + '...'}
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{
                        borderRadius: 6,
                        backgroundColor: friendRequestStatus === 'pending' ? Colors.lightBlue : friendRequestStatus === 'accepted' ? Colors.primary : friendRequestStatus === 'rejected' ? Colors.lightGray4 : Colors.lightGray4,
                        width: 90, height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
                    }}
                    onPress={() => handleSendRequest(currentUser?.uid!)}
                    disabled={friendRequestStatus === 'pending'}
                >
                    {isLoading ? (
                        <ActivityIndicator size='small' color={Colors.gray2} />
                    ) : (
                        <Text style={{
                            fontSize: Fonts.xs, fontFamily: 'Medium',
                            color: friendRequestStatus === 'pending' ? Colors.primary4 : friendRequestStatus === 'accepted' ? Colors.white : friendRequestStatus === 'rejected' ? Colors.gray2 : Colors.gray2
                        }}>
                            {friendRequestStatus === 'pending' ? 'Pending' : friendRequestStatus === 'accepted' ? 'Message' : friendRequestStatus === 'rejected' ? 'Add Friend' : 'Add Friend'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Item