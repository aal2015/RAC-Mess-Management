import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { styles } from "../../user/styles/add-user.styles";
import { createUser } from "../../api/admin";
import { useAuth } from "../../auth/AuthContext";

type Role = "user" | "driver";

export default function AddUserScreen() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<Role>("user");
    const [bus, setBus] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { accessToken } = useAuth();

    function handleRoleChange(selectedRole: Role) {
        setRole(selectedRole);

        if (selectedRole === "user") {
            setBus("");
        }

        setError("");
    }

    async function handleCreateUser() {
        if (isSubmitting) return;

        setError("");

        // validation...

        if (!accessToken) {
            setError("You are not authenticated.");
            return;
        }

        try {
            setIsSubmitting(true);

            await createUser(accessToken, {
                username: username.trim(),
                password,
                name: name.trim(),
                phone: phone.trim(),
                role,
                bus: role === "driver" ? bus.trim() : null,
            });

            router.back();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create user."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <Text style={styles.title}>Add User</Text>
                <Text style={styles.subtitle}>
                    Create a new account
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter full name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Role</Text>

                    <View style={styles.roleRow}>
                        <Pressable
                            style={[
                                styles.roleOption,
                                role === "user" && styles.roleOptionActive,
                            ]}
                            onPress={() => handleRoleChange("user")}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === "user" && styles.roleTextActive,
                                ]}
                            >
                                User
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.roleOption,
                                role === "driver" && styles.roleOptionActive,
                            ]}
                            onPress={() => handleRoleChange("driver")}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === "driver" && styles.roleTextActive,
                                ]}
                            >
                                Driver
                            </Text>
                        </Pressable>
                    </View>

                    {role === "driver" && (
                        <>
                            <Text style={styles.label}>Bus</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter bus number"
                                value={bus}
                                onChangeText={setBus}
                            />
                        </>
                    )}

                    {error !== "" && (
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    )}

                    <View style={styles.buttonRow}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.cancelText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.createButton}
                            onPress={handleCreateUser}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.createText}>
                                {isSubmitting ? "Creating..." : "Create User"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}