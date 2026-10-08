import {
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import LogoutButton from "../../components/LogoutButton";
import { styles } from "../../user/styles/routes.styles";

type User = {
    id: string;
    username: string;
    name: string;
    location: string;
    route: number | null;
};

const users: User[] = [
    {
        id: "1",
        username: "P001",
        name: "John",
        location: "Panchsheel Enclave",
        route: 1,
    },
    {
        id: "2",
        username: "P002",
        name: "David",
        location: "Saket",
        route: null,
    },
    {
        id: "3",
        username: "P003",
        name: "Amit",
        location: "Malviya Nagar",
        route: 2,
    },
    {
        id: "4",
        username: "P004",
        name: "Rahul",
        location: "Greater Kailash",
        route: null,
    },
];

export default function RoutesScreen() {
    const [userFilter, setUserFilter] = useState<
        "assigned" | "unassigned"
    >("unassigned");

    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) => {
        const matchesFilter =
            userFilter === "assigned"
                ? user.route !== null
                : user.route === null;

        const searchTerm = search.toLowerCase().trim();

        const matchesSearch =
            !searchTerm ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.location.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={
                    styles.contentContainer
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            Route Management
                        </Text>

                        <Text style={styles.date}>
                            Manage users and routes
                        </Text>
                    </View>

                    <LogoutButton />
                </View>

                {/* Users */}
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

                    {/* Assigned / Unassigned */}
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
                            placeholderTextColor="#9CA3AF"
                            style={styles.searchInput}
                        />
                    </View>

                    {/* Users table */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text
                                style={[
                                    styles.tableHeaderText,
                                    styles.userColumn,
                                ]}
                            >
                                User
                            </Text>

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
                                            styles.userColumn,
                                        ]}
                                    >
                                        {user.username}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.tableText,
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
                                        numberOfLines={1}
                                    >
                                        {user.location}
                                    </Text>

                                    <View
                                        style={
                                            styles.routeColumn
                                        }
                                    >
                                        {user.route !== null ? (
                                            <View
                                                style={
                                                    styles.routeBadge
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.routeBadgeText
                                                    }
                                                >
                                                    Route{" "}
                                                    {user.route}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Pressable
                                                style={
                                                    styles.assignButton
                                                }
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
                </View>
            </ScrollView>
        </View>
    );
}