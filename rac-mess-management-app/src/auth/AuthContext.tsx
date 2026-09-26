import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { login as loginApi } from "../api/auth";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "access_token";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token) {
        setAccessToken(token);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const data = await loginApi(username, password);

    await AsyncStorage.setItem(
      TOKEN_KEY,
      data.access_token
    );

    setAccessToken(data.access_token);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!accessToken,
        accessToken,
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