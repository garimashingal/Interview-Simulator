import { create } from "zustand";

interface UserState {
  userId: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  email:  null,
  name:   null,
  image:  null,

  setUser: (user) => set((s) => ({ ...s, ...user })),
  clearUser: () => set({ userId: null, email: null, name: null, image: null }),
}));
