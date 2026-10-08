import {
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { UserWithLocation } from "@/api/users";
import { styles } from "../../user/styles/routes.styles";

type UsersTableProps = {
    users: UserWithLocation[];
    loading: boolean;
    error: string | null;
};

export default function UsersTable({
    users,
    loading,
    error,
}: UsersTableProps) {
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

    return (
        <View style={styles.card}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                    <Text style={styles.label}>
                        Users
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                        Assign users to routes
                    </Text>
                </View>

                <Text style={styles.countText}>
                    {filteredUsers.length} users
                </Text>
            </View>

            <View style={styles.toggleRow}>
                <Pressable
                    style={[
                        styles.option,
                        userFilter === "assigned" &&
                        styles.takingActive,
                    ]}
                    onPress={() =>
                        setUserFilter("assigned")
                    }
                >
                    <Text
                        style={[
                            styles.optionText,
                            userFilter === "assigned" &&
                            styles.whiteText,
                        ]}
                    >
                        Assigned
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.option,
                        userFilter === "unassigned" &&
                        styles.takingActive,
                    ]}
                    onPress={() =>
                        setUserFilter("unassigned")
                    }
                >
                    <Text
                        style={[
                            styles.optionText,
                            userFilter === "unassigned" &&
                            styles.whiteText,
                        ]}
                    >
                        Unassigned
                    </Text>
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons
                    name="search-outline"
                    size={20}
                    color="#6B7280"
                />

                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search users..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            ) : (
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.nameColumn,
                            ]}
                        >
                            Name
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.locationColumn,
                            ]}
                        >
                            Location
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.routeColumn,
                            ]}
                        >
                            Route
                        </Text>
                    </View>

                    {filteredUsers.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No users found.
                        </Text>
                    ) : (
                        filteredUsers.map((user) => (
                            <View
                                key={user.id}
                                style={styles.tableRow}
                            >
                                <Text
                                    style={[
                                        styles.tableTextBold,
                                        styles.nameColumn,
                                    ]}
                                >
                                    {user.name}
                                </Text>

                                <Text
                                    style={[
                                        styles.tableText,
                                        styles.locationColumn,
                                    ]}
                                >
                                    {user.location?.road_name ?? "No location"}
                                </Text>

                                <View style={styles.routeColumn}>
                                    {user.route !== null ? (
                                        <View style={styles.routeBadge}>
                                            <Text
                                                style={
                                                    styles.routeBadgeText
                                                }
                                            >
                                                Route{" "}
                                                {user.route.route_number}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Pressable
                                            style={styles.assignButton}
                                        >
                                            <Text
                                                style={
                                                    styles.assignButtonText
                                                }
                                            >
                                                Assign
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}