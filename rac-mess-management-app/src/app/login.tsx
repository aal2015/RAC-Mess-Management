import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { styles } from "../styles/login.styles";

import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const formWidth =
    width >= 768 ? Math.min(width * 0.5, 420) : width * 0.9;

  async function handleLogin() {
    if (isLoggingIn) return;

    try {
      setError("");
      setIsLoggingIn(true);

      await login(username, password);

      router.replace("/");
    } catch (error: any) {
      if (
        error?.message === "Network Error" ||
        error?.code === "ERR_NETWORK"
      ) {
        setError("Unable to connect to the server. Please try again.");
      } else if (error?.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.form, { width: formWidth }]}>
        <Text style={styles.title}>RAC Mess Management</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoggingIn}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoggingIn}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[
            styles.button,
            isLoggingIn && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}