import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../constants'
import { useAuth } from './providers/AuthProvider'

const Header = () => {

    const { user } = useAuth();

    const navigation = useNavigation();

    return (
        <SafeAreaView style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.white,
        }}>
            <Text style={{
                fontFamily: 'Semibold',
                fontSize: 20,
                color: Colors.darkgray5,
            }}>
                Hello, {user?.displayName}!
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity style={{ display: 'none' }}>
                    <Ionicons
                        name='search'
                        size={20}
                        color={Colors.gray2}
                        style={{
                            backgroundColor: Colors.transparent,
                            padding: 8,
                            borderRadius: 20,
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingHorizontal: 4 }} onPress={() => navigation.navigate('user' as never)}>
                    <Image
                        source={{ uri: user?.photoURL! }}
                        style={{ width: 30, height: 30, borderRadius: 20 }}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Header