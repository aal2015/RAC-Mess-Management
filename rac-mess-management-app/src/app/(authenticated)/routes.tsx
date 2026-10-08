import {
    View,
    Text,
    ScrollView,
} from "react-native";
import { useEffect, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import {
    getBattalionUsersWithLocations,
    UserWithLocation,
} from "@/api/users";
import {
    getRoutes,
    Route,
} from "@/api/routes";

import RouteUsersTable from "@/user/components/RouterUserTable";
import RoutesTable from "@/user/components/RoutesTable";
import { styles } from "../../user/styles/routes.styles";

export default function RoutesScreen() {
    const { accessToken } = useAuth();

    const [users, setUsers] =
        useState<UserWithLocation[]>([]);

    const [loadingUsers, setLoadingUsers] =
        useState(true);

    const [userError, setUserError] =
        useState<string | null>(null);

    const [routes, setRoutes] =
        useState<Route[]>([]);

    const [loadingRoutes, setLoadingRoutes] =
        useState(true);

    const [routeError, setRouteError] =
        useState<string | null>(null);

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

    useEffect(() => {
        if (!accessToken) return;

        const loadRoutes = async () => {
            try {
                setLoadingRoutes(true);
                setRouteError(null);

                const data =
                    await getRoutes(accessToken);

                setRoutes(data);
            } catch (error) {
                setRouteError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load routes"
                );
            } finally {
                setLoadingRoutes(false);
            }
        };

        loadRoutes();
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

                <RoutesTable
                    routes={routes}
                    loading={loadingRoutes}
                    error={routeError}
                    onAddRoute={() => {
                        // Add route later
                    }}
                />
            </ScrollView>
        </View>
    );
}