import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Route } from "@/api/routes";
import { styles } from "../../user/styles/routes.styles";

type RoutesTableProps = {
    routes: Route[];
    loading: boolean;
    error: string | null;
    onAddRoute: () => void;
    onSelectRoute: (route: Route) => void;
    onAssignDriver: (route: Route) => void;
    onEditRoute: (route: Route) => void;
    onDeleteRoute: (route: Route) => void;
};

export default function RoutesTable({
    routes,
    loading,
    error,
    onAddRoute,
    onSelectRoute,
    onAssignDriver,
    onEditRoute,
    onDeleteRoute
}: RoutesTableProps) {
    const [activeMenuRouteId, setActiveMenuRouteId] =
        useState<string | null>(null);

    return (
        <View style={styles.card}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                    <Text style={styles.label}>
                        Routes
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                        Manage delivery routes
                    </Text>
                </View>

                <Text style={styles.countText}>
                    {routes.length} routes
                </Text>
            </View>

            <Pressable
                style={styles.addRouteButton}
                onPress={onAddRoute}
            >
                <Ionicons
                    name="add"
                    size={18}
                    color="#FFFFFF"
                />

                <Text style={styles.addRouteButtonText}>
                    Add New Route
                </Text>
            </Pressable>

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
                                styles.routeNumberColumn,
                            ]}
                        >
                            Route
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.routeNameColumn,
                            ]}
                        >
                            Name
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.driverColumn,
                            ]}
                        >
                            Driver
                        </Text>

                        <Text
                            style={[
                                styles.tableHeaderText,
                                styles.actionColumn,
                            ]}
                        >
                            Action
                        </Text>
                    </View>

                    {routes.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No routes found.
                        </Text>
                    ) : (
                        routes.map((route) => (
                            <Pressable
                                key={route.id}
                                style={[
                                    styles.tableRow,
                                    activeMenuRouteId === route.id && styles.activeMenuRow,
                                ]}
                                onPress={() => {
                                    if (activeMenuRouteId) {
                                        setActiveMenuRouteId(null);
                                        return;
                                    }

                                    onSelectRoute(route);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.tableTextBold,
                                        styles.routeNumberColumn,
                                    ]}
                                >
                                    Route {route.route_number}
                                </Text>

                                <Text
                                    style={[
                                        styles.tableText,
                                        styles.routeNameColumn,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {route.name}
                                </Text>

                                <Text
                                    style={[
                                        styles.tableText,
                                        styles.driverColumn,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {route.driver?.name ?? "No driver"}
                                </Text>

                                <View style={styles.actionContainer}>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={(event) => {
                                            event.stopPropagation();

                                            setActiveMenuRouteId(
                                                activeMenuRouteId === route.id
                                                    ? null
                                                    : route.id
                                            );
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>⋮</Text>
                                    </Pressable>

                                    {activeMenuRouteId === route.id && (
                                        <View style={styles.actionMenu}>
                                            <Pressable
                                                style={styles.actionMenuItem}
                                                onPress={() => {
                                                    setActiveMenuRouteId(null);
                                                    onAssignDriver(route);
                                                }}
                                            >
                                                <Text style={styles.actionMenuText}>
                                                    Assign Driver
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={styles.actionMenuItem}
                                                onPress={() => {
                                                    setActiveMenuRouteId(null);
                                                    onEditRoute(route);
                                                }}
                                            >
                                                <Text style={styles.actionMenuText}>
                                                    Edit Route Details
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={styles.actionMenuItem}
                                                onPress={() => {
                                                    setActiveMenuRouteId(null);
                                                    onDeleteRoute(route);
                                                }}
                                            >
                                                <Text style={styles.deleteActionText}>
                                                    Delete Route
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}