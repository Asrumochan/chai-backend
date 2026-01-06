import { create } from 'zustand';

// Zustand store for managing authentication-related state
export const useAuthStore = create((set) => ({
    // Holds user information (e.g., user details, global groups, etc.)
    userInfo: {},
    isBUW: false,
    // Function to update the userInfo object in the store
    setUserInfo: (userInfo) => set({ userInfo }),
    setIsBUW: (isBUW) => set({ isBUW }),
}));