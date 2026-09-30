import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { login as loginApi } from "../api/auth";

type User = {
  username: string;
  name: string;
  role: "admin" | "user" | "driver";
  bus: string | null;
  battalion: string | null;
};

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_DATA_KEY = "auth_data";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  async function loadAuthData() {
    try {
      const storedData = await AsyncStorage.getItem(AUTH_DATA_KEY);

      if (storedData) {
        const data = JSON.parse(storedData);

        setAccessToken(data.access_token);

        setUser({
          username: data.username,
          name: data.name,
          role: data.role,
          bus: data.bus,
          battalion: data.battalion,
        });
      }
    } catch (error) {
      console.error("Failed to load auth data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const data = await loginApi(username, password);

    await AsyncStorage.setItem(
      AUTH_DATA_KEY,
      JSON.stringify(data)
    );

    setAccessToken(data.access_token);

    setUser({
      username: data.username,
      name: data.name,
      role: data.role,
      bus: data.bus,
      battalion: data.battalion,
    });
  }

  async function logout() {
    await AsyncStorage.removeItem(AUTH_DATA_KEY);

    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!accessToken,
        accessToken,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}