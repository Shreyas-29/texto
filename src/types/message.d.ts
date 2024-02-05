import { Timestamp } from "firebase/firestore";

export type Message = {
    id?: string;
    content: string;
    senderId: string;
    timestamp: Timestamp;
    imageUrl?: string;
};
