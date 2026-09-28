import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
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

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const formWidth = width >= 768 ? Math.min(width * 0.5, 420) : width * 0.9;

  async function handleLogin() {
    try {
      setError("");
      await login(username, password);
      router.replace("/");
    } catch {
      setError("Invalid username or password");
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
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}