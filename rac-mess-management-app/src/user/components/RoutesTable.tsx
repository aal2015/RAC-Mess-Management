import {
    View,
    Text,
    Pressable,
    ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "../../user/styles/routes.styles";

export type Route = {
    id: string;
    route_number: number;
    name: string;
    driver_id: string | null;
};

type RoutesTableProps = {
    routes: Route[];
    loading: boolean;
    error: string | null;
    onAddRoute: () => void;
};

export default function RoutesTable({
    routes,
    loading,
    error,
    onAddRoute,
}: RoutesTableProps) {
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
                            <View
                                key={route.id}
                                style={styles.tableRow}
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
                                    {route.driver_id
                                        ? "Assigned"
                                        : "No driver"}
                                </Text>

                                <View
                                    style={
                                        styles.actionColumn
                                    }
                                >
                                    <Pressable
                                        style={
                                            styles.actionButton
                                        }
                                        onPress={() => {
                                            // Open route actions
                                        }}
                                    >
                                        <Ionicons
                                            name="ellipsis-vertical"
                                            size={20}
                                            color="#374151"
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}