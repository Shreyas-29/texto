import { View, Text, ImageProps, Image } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Fonts, Sizes, slides } from '@/src/constants'
import AppIntroSlider from 'react-native-app-intro-slider'
import { auth } from '../lib/firebase'
import { useAuth } from '../components'

interface Props {
    item: {
        id: number;
        title: string;
        description: string;
        image: ImageProps
    }
}

const Welcome = ({ navigation }: any) => {

    const user = auth.currentUser;

    const buttonLabel = (label: string) => {
        return (
            <View style={{ padding: 12 }}>
                <Text style={{ fontSize: Fonts.sm, fontFamily: 'Semibold', color: Colors.primary3 }}>{label}</Text>
            </View>
        )
    };

    const renderItem = ({ item }: Props) => {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Sizes.padding }}>
                <View style={{ width: 300, height: 300, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={item.image} style={{ height: '100%', width: '100%' }} />
                </View>
                <Text style={{ fontSize: Fonts.xl, fontFamily: 'Semibold', marginTop: Sizes.base, color: Colors.primary2 }}>{item.title}</Text>
                <Text style={{ fontSize: Fonts.sm, fontFamily: 'Regular', marginTop: Sizes.base, textAlign: 'center', color: Colors.primary5 }}>{item.description}</Text>
            </View>
        )
    };

    const handleNavigation = () => {
        if (user) {
            navigation.navigate('(tabs)');
        } else {
            navigation.navigate('(auth)');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            <AppIntroSlider
                data={slides}
                renderItem={renderItem}
                showNextButton
                showSkipButton
                activeDotStyle={{
                    backgroundColor: Colors.primary,
                    width: 24,
                    height: 8
                }}
                dotStyle={{
                    backgroundColor: Colors.lightBlue,
                    width: 8,
                    height: 8
                }}
                onDone={handleNavigation}
                renderNextButton={() => buttonLabel('Next')}
                renderSkipButton={() => buttonLabel('Skip')}
                renderDoneButton={() => buttonLabel(user ? 'Start Chatting' : 'Get Started')}
            />
        </SafeAreaView>
    )
}

export default Welcome