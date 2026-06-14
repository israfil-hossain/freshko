import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
};

export const connectSocket = (userId: string) => {
    const socket = getSocket();
    
    if (!socket.connected) {
        socket.connect();
    }
    
    if (userId) {
        socket.emit('join_user', userId);
    }
    
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};

export const joinOrder = (orderId: string) => {
    const socket = getSocket();
    socket.emit('join_order', orderId);
};

export const joinAdmin = () => {
    const socket = getSocket();
    socket.emit('join_admin');
};

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  unreadCount: number;
  riderLocation?: any;
  connect: (userId: string) => void;
  disconnect: () => void;
  clearNotifications: () => void;
  markAsRead: () => void;
}

// Socket store for global state
export const useSocketStore = create<SocketState>()((set, get) => ({
    socket: null,
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    
    connect: (userId: string) => {
        const socket = connectSocket(userId);
        
        socket.on('connect', () => {
            set({ isConnected: true, socket });
        });
        
        socket.on('disconnect', () => {
            set({ isConnected: false });
        });
        
        socket.on('order_status_changed', (data: any) => {
            set((state) => ({
                notifications: [data, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            }));
        });
        
        socket.on('delivery_status_changed', (data: any) => {
            set((state) => ({
                notifications: [data, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            }));
        });
        
        socket.on('rider_location_update', (data: any) => {
            set((state) => ({
                riderLocation: data,
            }));
        });
        
        socket.on('notification', (data: any) => {
            set((state) => ({
                notifications: [data, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            }));
        });
        
        set({ socket });
    },
    
    disconnect: () => {
        disconnectSocket();
        set({ isConnected: false, socket: null });
    },
    
    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
    },
    
    markAsRead: () => {
        set({ unreadCount: 0 });
    },
}));

export default {
    getSocket,
    connectSocket,
    disconnectSocket,
    joinOrder,
    joinAdmin,
};
