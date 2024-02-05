import { View, Text, FlatList, Alert, Keyboard, TextInput, ViewProps, LayoutAnimation, UIManager, Easing, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { User } from 'firebase/auth';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db, storage } from '../lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Sizes } from '../constants';
import { ChatHeader, ChatInput, ChatMenu, Message } from '../components';
import { Message as MessageProps } from '../types/message';
import { GestureEvent, State } from 'react-native-gesture-handler';
import { v4 as uuidv4 } from 'uuid';
import useLatestMessageStore from '../lib/latestMessage';
import moment from 'moment';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from 'react-native-toast-notifications';
import 'react-native-get-random-values';

// Enable LayoutAnimation
// UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const Chat = () => {

    const inputRef = useRef<TextInput>(null);
    const messagesListRef = useRef<FlatList>(null);

    const params = useLocalSearchParams();

    const friendId = params.friendId;

    const currentUser = auth.currentUser;

    const { setLatestMessage } = useLatestMessageStore();

    const toast = useToast();

    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [chatRoomId, setChatRoomId] = useState<string>('');
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [friendUser, setFriendUser] = useState<User | null>();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedMessage, setSelectedMessage] = useState<MessageProps>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isFriendLoading, setIsFriendLoading] = useState<boolean>(true);

    const shouldShowDateSeparator = (item: MessageProps, prevMessageTimestamp: any) => {
        const formattedTimestamp = moment(item.timestamp.seconds * 1000);

        if (prevMessageTimestamp) {
            const prevFormattedTimestamp = moment(prevMessageTimestamp.seconds * 1000);

            // Today: Show separator only if previous message is not on the same day
            if (formattedTimestamp.isSame(moment(), 'day')) {
                return !prevFormattedTimestamp.isSame(moment(), 'day');
            }

            // Yesterday: Show separator only if the message is yesterday and previous is not
            if (formattedTimestamp.isSame(moment().subtract(1, 'days'), 'day')) {
                return !prevFormattedTimestamp.isSame(moment().subtract(1, 'days'), 'day');
            }

            // Older than 3 days: Show separator always
            if (formattedTimestamp.isBefore(moment().subtract(3, 'days'))) {
                return true;
            }

            // Within last 3 days: Don't show separator
            return false;
        }

        // First message: Always show separator
        return true;
    };

    const uploadImage = async (uri: string, uid: string) => {
        const imageRef = ref(storage, `images/${uid}`);
        const response = await fetch(uri);
        const blob = await response.blob();

        return uploadBytes(imageRef, blob);
    };

    const handleUploadImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setIsUploading(true);

            try {
                const uploadTask = await uploadImage(result.assets[0]?.uri, `${currentUser?.uid}_${friendId}_${new Date().getTime()}`);
                const photoURL = await getDownloadURL(uploadTask.ref);

                setImageUrl(photoURL);
            } catch (error) {
                console.log('Error uploading image: ', error);
                toast.show('Unable to upload image');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSendMessage = async () => {
        try {

            if (!newMessage && !imageUrl) {
                toast.show('Please enter a message or upload an image');
                return;
            }

            // Add the new message to the chat room
            const chatRoomRef = doc(db, 'chats', chatRoomId);
            // await addDoc(collection(chatRoomRef, 'messages'), {
            //     content: newMessage,
            //     senderId: currentUser?.uid,
            //     timestamp: new Date(),
            // });
            let messageData: { id?: string; senderId?: string; timestamp: Date; content?: string, imageUrl?: string } = {
                senderId: currentUser?.uid!,
                timestamp: new Date(),
            };

            if (newMessage) {
                messageData.content = newMessage;
            }

            if (imageUrl) {
                messageData.imageUrl = imageUrl;
            }

            messageData.id = uuidv4();

            console.log('messageData', messageData);

            await addDoc(collection(chatRoomRef, 'messages'), messageData);

            Keyboard.dismiss();
            setNewMessage('');
            setImageUrl('');
            setLatestMessage(friendId as string, newMessage, new Date());
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            inputRef?.current?.blur();
            messagesListRef?.current?.scrollToEnd();
        }
    };

    const handleDeleteMessage = async () => {
        try {
            const messageId = selectedMessage?.id;

            if (!messageId) {
                return;
            }

            // const messageRef = doc(collection(db, 'chats', chatRoomId, 'messages'), messageId);
            const messageRef = doc(db, 'chats', chatRoomId, 'messages', messageId);
            // console.log('messageRef', messageRef);

            await deleteDoc(messageRef);

            setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));

            setShowMenu(false);

            toast.show('Message deleted', {
                duration: 1000,
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.show('Could not delete message');
        }
    };

    const handleLongPress = (event: GestureEvent, message: MessageProps) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            setSelectedMessage(message);
            setTimeout(() => {
                setShowMenu(true);
            }, 1000);
        }
    };

    const handleToggleMenu = () => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowMenu((prev) => !prev);
    };

    // const renderItem = ({ item, index }: { item: MessageProps, index: number }) => {

    //     const prevMessageTimestamp = index > 0 ? messages[index - 1].timestamp : undefined; // Track previous message's timestamp

    //     const formattedTimestamp = moment(item.timestamp.seconds * 1000).format('h:mm a');

    //     const shouldShowSeparator = shouldShowDateSeparator(item, prevMessageTimestamp as any);

    //     return (
    //         <>
    //             {shouldShowSeparator && (
    //                 <View style={{ marginBottom: Sizes.padding4 }}>
    //                     <Text style={{ fontSize: Fonts.sm, fontFamily: 'Regular', color: Colors.gray }}>
    //                         {formattedTimestamp}
    //                     </Text>
    //                 </View>
    //             )}
    //             <Message
    //                 message={item}
    //                 isCurrentUser={item.senderId === currentUser?.uid}
    //                 onLongPress={handleLongPress}
    //                 setShowMenu={handleToggleMenu}
    //             />
    //         </>
    //     );
    // };

    const renderItem = ({ item, index }: { item: MessageProps, index: number }) => {
        const prevMessageTimestamp = index > 0 ? messages[index - 1].timestamp : undefined;

        const formattedTimestamp = moment(item.timestamp.seconds * 1000);
        const todayText = formattedTimestamp.isSame(moment(), 'day') ? 'Today' : formattedTimestamp.format('h:mm a');

        const shouldShowSeparator = shouldShowDateSeparator(item, prevMessageTimestamp as any);

        return (
            <>
                {shouldShowSeparator && (
                    <View style={{ marginBottom: Sizes.padding4, alignSelf: 'center', backgroundColor: Colors.white, paddingHorizontal: Sizes.padding5, paddingVertical: Sizes.mini, borderRadius: Sizes.base, shadowColor: Colors.lightGray, shadowOpacity: 0.2, shadowRadius: 1, elevation: 5 }}>
                        <Text style={{ fontSize: Fonts.xs, fontFamily: 'Regular', color: Colors.darkgray, textAlign: 'center' }}>
                            {todayText}
                        </Text>
                    </View>
                )}
                <Message
                    message={item}
                    isCurrentUser={item.senderId === currentUser?.uid}
                    onLongPress={() => handleLongPress({ nativeEvent: { state: State.ACTIVE } } as GestureEvent, item)}
                    setShowMenu={handleToggleMenu}
                />
            </>
        );
    };


    useEffect(() => {
        const fetchFriendDetails = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', friendId as string));
                if (userDoc.exists()) {
                    setFriendUser(userDoc.data() as User);
                    setIsFriendLoading(false);
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error fetching friend details:', error);
            } finally {
                setIsFriendLoading(false);
            }
        };

        fetchFriendDetails();
    }, []);

    // useEffect(() => {
    //     // Set up a listener to get real-time updates on new messages
    //     const q = query(collection(db, 'chats', `chatRoomId/messages`), orderBy('timestamp'));
    //     const unsubscribe = onSnapshot(q, (snapshot) => {
    //         const newMessages = snapshot.docs.map((doc) => doc.data());
    //         // console.log('newMessages', newMessages);
    //         setMessages(newMessages as any);
    //     });

    //     // Clean up the listener when the component unmounts
    //     return () => unsubscribe();
    // }, [currentUser?.uid, friendId]);
    let i;

    // useEffect(() => {
    //     const currentUserId = currentUser?.uid;
    //     const newChatRoomId = [currentUserId, friendId].sort().join('_');
    //     setChatRoomId(newChatRoomId);

    //     console.log('newChatRoomId', newChatRoomId);

    //     const messagesRef = collection(db, 'chats', newChatRoomId, 'messages');
    //     const messagesQuery = query(messagesRef, orderBy('timestamp'));

    //     console.log('messagesQuery', messagesQuery);

    //     const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    //         const newMessages = snapshot.docs.map((doc) => doc.data());
    //         setMessages(newMessages as any);
    //     });

    //     return () => unsubscribe();
    // }, [currentUser?.uid, friendId]);

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                const currentUserId = currentUser?.uid;
                const newChatRoomId = [currentUserId, friendId].sort().join('_');
                setChatRoomId(newChatRoomId);

                // console.log('newChatRoomId', newChatRoomId);

                const messagesRef = collection(db, 'chats', newChatRoomId, 'messages');
                const messagesQuery = query(messagesRef, orderBy('timestamp'));

                // console.log('messagesQuery', messagesQuery);

                // const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                //     const newMessages = snapshot.docs.map((doc) => doc.data());
                //     console.log('newMessages', newMessages);
                //     setMessages(newMessages as any);
                //     setIsLoading(false);
                // });
                const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            // Handle added messages
                            const newMessages = snapshot.docs.map((doc) => doc.data());
                            setMessages(newMessages as any);
                        } else if (change.type === 'removed') {
                            // Handle removed messages
                            const message = change.doc.data();
                            console.log('message.id', message.id, change.doc.id, selectedMessage?.id);
                            setMessages((prevMessages) => prevMessages.filter((message) => {
                                return message.id !== change.doc.id;
                            }));
                        }
                    });

                    setIsLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching chat data:', error);
                setIsLoading(false);
            }
        };

        fetchChatData();
    }, [currentUser?.uid, friendId]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.transparentWhite1, position: 'relative', }}>

            {/* Menu */}
            {showMenu ? (
                <ChatMenu friendId={friendId as string} selectedMessage={selectedMessage!} setShowMenu={handleToggleMenu} handleDeleteMessage={handleDeleteMessage} />
            ) : (
                <ChatHeader isLoading={isFriendLoading} friendUser={friendUser!} />
            )}

            {/* Messages */}
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1, paddingHorizontal: Sizes.padding5, paddingTop: Sizes.margin4 - 4, paddingBottom: Sizes.margin3, marginBottom: Sizes.padding4 }}>
                    <FlatList
                        data={messages}
                        ref={messagesListRef}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingVertical: Sizes.padding4 }} // Adjust as needed
                        ItemSeparatorComponent={() => <View style={{ height: Sizes.padding4 }} />} // Adjust as needed
                        keyExtractor={(item) => item.senderId + Math.random().toString()}
                        onContentSizeChange={() => {
                            messagesListRef?.current?.scrollToEnd({ animated: true });
                        }}
                    />
                </View>
            )}
            {/* Chat Input */}
            <ChatInput
                value={newMessage}
                imageUrl={imageUrl}
                isUploading={isUploading}
                friendId={friendId as string}
                onChangeText={(text: string) => setNewMessage(text)}
                handleClose={() => setImageUrl('')}
                handleSendMessage={handleSendMessage}
                handleUploadImage={handleUploadImage}
            />
        </SafeAreaView>
    )
}

export default Chat