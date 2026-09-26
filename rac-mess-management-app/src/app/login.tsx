import {
  View,
  Text,
  TextInput,
  Button,
} from "react-native";
import { useState } from "react";
import { Redirect, useRouter } from "expo-router";

import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

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
    <View>
      <Text>RAC Mess Management</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text>{error}</Text> : null}

      <Button
        title="Login"
        onPress={handleLogin}
      />
    </View>
  );
}