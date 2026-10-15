import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DataTable from "@/components/DataTable/DataTable";
import type {
    DataTableColumn,
    DataTableAction,
} from "@/components/DataTable/types";

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

    const columns: DataTableColumn<Route>[] = [
        {
            key: "route_number",
            title: "Route",
            style: styles.routeNumberColumn,
            headerStyle: styles.tableHeaderText,
            render: (route) => (
                <Text style={styles.tableTextBold}>
                    Route {route.route_number}
                </Text>
            ),
        },
        {
            key: "name",
            title: "Name",
            style: styles.routeNameColumn,
            headerStyle: styles.tableHeaderText,
            render: (route) => (
                <Text
                    style={styles.tableText}
                    numberOfLines={1}
                >
                    {route.name}
                </Text>
            ),
        },
        {
            key: "driver",
            title: "Driver",
            style: styles.driverColumn,
            headerStyle: styles.tableHeaderText,
            render: (route) => (
                <Text
                    style={styles.tableText}
                    numberOfLines={1}
                >
                    {route.driver?.name ?? "No driver"}
                </Text>
            ),
        },
    ];

    const getActions = (
        route: Route
    ): DataTableAction<Route>[] => [
            {
                label: "Assign Driver",
                onPress: onAssignDriver,
            },
            {
                label: "Edit Route Details",
                onPress: onEditRoute,
            },
            {
                label: "Delete Route",
                onPress: onDeleteRoute,
                destructive: true,
            },
        ];

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
            ) : routes.length === 0 ? (
                <Text style={styles.emptyText}>
                    No routes found.
                </Text>
            ) : (
                <DataTable
                    data={routes}
                    rowKey={(route) => route.id}
                    columns={columns}
                    actions={getActions}
                    pressableRows
                    onRowPress={onSelectRoute}
                />
            )}
        </View>
    );
}