import { Colors } from '@/src/constants';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Home from '.';
import Chats from './chats';
import Friends from './friends';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
    return (
        <Tab.Navigator
            style={{ flex: 1, backgroundColor: Colors.white, }}
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    shadowColor: Colors.lightGray,
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    // elevation: 5,
                },
                tabBarIndicatorStyle: {
                    backgroundColor: Colors.primary,
                    height: 3,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Medium',
                    textTransform: 'capitalize',
                    fontSize: 14,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.gray2,
                animationEnabled: true,
            }}
        >
            <Tab.Screen
                name="Home"
                options={{
                    tabBarLabel: 'Home',
                }}
                component={Home}
            />
            <Tab.Screen
                name="Chats"
                options={{
                    tabBarLabel: 'Chats',
                }}
                component={Chats}
            />
            <Tab.Screen
                name="Friends"
                options={{
                    tabBarLabel: 'Friends',
                }}
                component={Friends}
            />
        </Tab.Navigator>
    );
}