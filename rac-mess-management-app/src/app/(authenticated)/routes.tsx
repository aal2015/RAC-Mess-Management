import {
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import LogoutButton from "../../components/LogoutButton";
import { styles } from "../../user/styles/routes.styles";
import { getBattalionUsersWithLocations, UserWithLocation } from "@/api/users";
import { useAuth } from "../../auth/AuthContext";
import RouteUsersTable from "../../user/components/RouterUserTable";

export default function RoutesScreen() {
    const { accessToken } = useAuth();

    const [users, setUsers] = useState<UserWithLocation[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);

    const [userFilter, setUserFilter] = useState<
        "assigned" | "unassigned"
    >("unassigned");

    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) => {
        if (user.role !== "user") {
            return false;
        }

        const matchesFilter =
            userFilter === "assigned"
                ? user.route !== null
                : user.route === null;

        const searchTerm = search.toLowerCase().trim();

        const matchesSearch =
            !searchTerm ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.location?.road_name
                ?.toLowerCase()
                .includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    useEffect(() => {
        if (!accessToken) return;

        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                setUserError(null);

                const data =
                    await getBattalionUsersWithLocations(
                        accessToken
                    );
                
                setUsers(data);
            } catch (error) {
                setUserError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load users"
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [accessToken]);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={
                    styles.contentContainer
                }
            >
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Route Management
                        </Text>

                        <Text style={styles.date}>
                            Manage users and routes
                        </Text>
                    </View>
                </View>

                <RouteUsersTable
                    users={users}
                    loading={loadingUsers}
                    error={userError}
                />

                {/* RoutesTable will go here */}

                {/* RouteUsersTable will go here */}
            </ScrollView>
        </View>
    );
}