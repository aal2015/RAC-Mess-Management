import {
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Route } from "@/api/routes";
import { UserWithLocation } from "@/api/users";
import { styles } from "../../user/styles/routes.styles";

import DataTable from "@/components/DataTable/DataTable";
import type {
    DataTableColumn,
} from "@/components/DataTable/types";

type UsersTableProps = {
    users: UserWithLocation[];
    routes: Route[];
    loading: boolean;
    error: string | null;
    onAssignUser: (user: UserWithLocation) => void;
    onUnassignUser: (user: UserWithLocation) => void;
};

export default function UsersTable({
    users,
    routes,
    loading,
    error,
    onAssignUser,
    onUnassignUser,
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

    const columns: DataTableColumn<UserWithLocation>[] = [
        {
            key: "name",
            title: "Name",
            style: styles.nameColumn,
            render: (user) => (
                <Text style={styles.tableTextBold}>
                    {user.name}
                </Text>
            ),
        },
        {
            key: "location",
            title: "Location",
            style: styles.locationColumn,
            render: (user) => (
                <Text style={styles.tableText}>
                    {user.location?.road_name ?? "No location"}
                </Text>
            ),
        },
        {
            key: "route",
            title: "Route",
            style: styles.routeColumn,
            render: (user) =>
                user.route !== null ? (
                    <View style={styles.routeAssignedContainer}>
                        <View style={styles.routeBadge}>
                            <Text style={styles.routeBadgeText}>
                                Route {user.route.route_number}
                            </Text>
                        </View>

                        <Pressable
                            style={styles.unassignButton}
                            onPress={() => onUnassignUser(user)}
                        >
                            <Text style={styles.unassignButtonText}>
                                Unassign
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={styles.assignButton}
                        onPress={() => onAssignUser(user)}
                    >
                        <Text style={styles.assignButtonText}>
                            Assign
                        </Text>
                    </Pressable>
                ),
        },
    ];

    return (
        <View style={styles.card}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                    <Text style={styles.label}>Users</Text>
                    <Text style={styles.sectionSubtitle}>
                        Assign users to routes
                    </Text>
                </View>

                <Text style={styles.countText}>
                    {filteredUsers.length} users
                </Text>
            </View>

            {/* Assigned / Unassigned filters */}
            <View style={styles.toggleRow}>
                <Pressable
                    style={[
                        styles.toggleButton,
                        userFilter === "assigned" &&
                        styles.toggleButtonActive,
                    ]}
                    onPress={() => setUserFilter("assigned")}
                >
                    <Text
                        style={[
                            styles.toggleButtonText,
                            userFilter === "assigned" &&
                            styles.toggleButtonTextActive,
                        ]}
                    >
                        Assigned
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.toggleButton,
                        userFilter === "unassigned" &&
                        styles.toggleButtonActive,
                    ]}
                    onPress={() => setUserFilter("unassigned")}
                >
                    <Text
                        style={[
                            styles.toggleButtonText,
                            userFilter === "unassigned" &&
                            styles.toggleButtonTextActive,
                        ]}
                    >
                        Unassigned
                    </Text>
                </Pressable>
            </View>

            {/* Search */}
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
                    style={styles.searchInput}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Table content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : filteredUsers.length === 0 ? (
                <Text style={styles.emptyText}>
                    No users found.
                </Text>
            ) : (
                <DataTable
                    data={filteredUsers}
                    rowKey={(user) => user.id}
                    columns={columns}
                />
            )}
        </View>
    );
}