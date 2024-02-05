import { create } from 'zustand';

interface LatestMessageStore {
    latestMessages: Record<string, { content: string; timestamp: Date }>;
    setLatestMessage: (friendId: string, content: string, timestamp: Date) => void;
}

const useLatestMessageStore = create<LatestMessageStore>((set) => ({
    latestMessages: {},
    setLatestMessage: (friendId, content, timestamp) =>
        set((state) => ({
            latestMessages: {
                ...state.latestMessages,
                [friendId]: { content, timestamp },
            },
        })),
}));

export default useLatestMessageStore;

