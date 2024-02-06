import { Colors } from '@/src/constants';
import { ToastProvider } from 'react-native-toast-notifications';

const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ToastProvider
            placement="bottom"
            animationType="zoom-in"
            offsetBottom={20}
            swipeEnabled={true}
            animationDuration={400}
            textStyle={{ fontFamily: 'Medium', color: Colors.white, fontSize: 12 }}
            normalColor={Colors.darkgray3}
            style={{ backgroundColor: Colors.darkgray3, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 }}
        >
            {children}
        </ToastProvider>
    )
};

export default ToasterProvider;