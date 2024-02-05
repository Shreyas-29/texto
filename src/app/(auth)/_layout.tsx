import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './login';
import Register from './register';

const Stack = createNativeStackNavigator();

export default function AuthLayout() {
    return (
        <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
};
