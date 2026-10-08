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
    createRoute
} from "@/api/routes";

import UsersTable from "@/routes/components/UserTable";
import RoutesTable from "@/routes/components/RoutesTable";
import AddRouteModal from "@/routes/components/AddRouteModal";
import RouteDetails from "@/routes/components/RouteDetails";
import { styles } from "../../user/styles/routes.styles";

export default function RoutesScreen() {
    const { accessToken } = useAuth();

    const [users, setUsers] = useState<UserWithLocation[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);

    const [routes, setRoutes] = useState<Route[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [showAddRouteModal, setShowAddRouteModal] = useState(false);
    const [creatingRoute, setCreatingRoute] = useState(false);
    const [createRouteError, setCreateRouteError] = useState<string | null>(null);

    const handleCreateRoute = async (
        routeNumber: number,
        name: string
    ) => {
        if (!accessToken) return;

        try {
            setCreatingRoute(true);
            setCreateRouteError(null);

            const newRoute = await createRoute(
                accessToken,
                {
                    route_number: routeNumber,
                    name,
                }
            );

            setRoutes((currentRoutes) => [
                ...currentRoutes,
                newRoute,
            ]);

            setShowAddRouteModal(false);
        } catch (error) {
            setCreateRouteError(
                error instanceof Error
                    ? error.message
                    : "Failed to create route"
            );
        } finally {
            setCreatingRoute(false);
        }
    };

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

                <UsersTable
                    users={users}
                    loading={loadingUsers}
                    error={userError}
                />

                <RoutesTable
                    routes={routes}
                    loading={loadingRoutes}
                    error={routeError}
                    onAddRoute={() => {
                        setCreateRouteError(null);
                        setShowAddRouteModal(true);
                    }}
                    onSelectRoute={(route) => {
                        setSelectedRoute(route);
                    }}
                />

                <AddRouteModal
                    visible={showAddRouteModal}
                    loading={creatingRoute}
                    error={createRouteError}
                    onClose={() => {
                        if (creatingRoute) return;

                        setCreateRouteError(null);
                        setShowAddRouteModal(false);
                    }}
                    onSubmit={handleCreateRoute}
                />

                {selectedRoute ? (
                    <RouteDetails
                        route={selectedRoute}
                        users={users}
                    />
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.label}>
                            Route Details
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Select a route to view its users.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}