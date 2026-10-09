import {
    View,
    Text,
    ScrollView,
    Pressable,
    Modal
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
    createRoute,
    addLocationToRoute,
    removeLocationFromRoute
} from "@/api/routes";
import AssignRouteModal from "@/routes/components/AssignRouteModal";

import UsersTable from "@/routes/components/UserTable";
import RoutesTable from "@/routes/components/RoutesTable";
import AddRouteModal from "@/routes/components/AddRouteModal";
import UnassignRouteModal from "@/routes/components/UnassignRouteModal";
import RouteDetails from "@/routes/components/RouteDetails";
import { styles } from "../../user/styles/routes.styles";

export default function RoutesScreen() {
    const { accessToken } = useAuth();

    const [users, setUsers] = useState<UserWithLocation[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);
    const [assigningUser, setAssigningUser] = useState<UserWithLocation | null>(null);
    const [showLocationRequired, setShowLocationRequired] = useState(false);
    const [assigningRoute, setAssigningRoute] = useState(false);
    const [assignRouteError, setAssignRouteError] = useState<string | null>(null);

    const [routes, setRoutes] = useState<Route[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [showAddRouteModal, setShowAddRouteModal] = useState(false);
    const [creatingRoute, setCreatingRoute] = useState(false);
    const [createRouteError, setCreateRouteError] = useState<string | null>(null);

    const [unassigningUser, setUnassigningUser] =
        useState<UserWithLocation | null>(null);
    const [unassigning, setUnassigning] = useState(false);
    const [unassignError, setUnassignError] =
        useState<string | null>(null);

    const handleAssignUser = (
        user: UserWithLocation
    ) => {
        if (!user.location) {
            setAssigningUser(user);
            setShowLocationRequired(true);
            return;
        }

        setAssigningUser(user);
        setAssignRouteError(null);
    };

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

    const handleAddRoute = () => {
        setShowAddRouteModal(true);
    };

    const handleUnassignUser = (user: UserWithLocation) => {
        setUnassignError(null);
        setUnassigningUser(user);
    };

    const handleConfirmUnassign = async () => {
        if (!accessToken || !unassigningUser?.location || !unassigningUser.route) {
            return;
        }

        try {
            setUnassigning(true);
            setUnassignError(null);

            await removeLocationFromRoute(
                accessToken,
                unassigningUser.route.route_number,
                unassigningUser.location.id
            );

            await loadUsers();

            setUnassigningUser(null);
        } catch (error) {
            setUnassignError(
                error instanceof Error
                    ? error.message
                    : "Failed to unassign route"
            );
        } finally {
            setUnassigning(false);
        }
    };

    const loadUsers = async () => {
        if (!accessToken) return;

        try {
            setLoadingUsers(true);
            setUserError(null);

            const data = await getBattalionUsersWithLocations(accessToken);
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

    useEffect(() => {
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
                    routes={routes}
                    loading={loadingUsers}
                    error={userError}
                    onAssignUser={handleAssignUser}
                    onUnassignUser={handleUnassignUser}
                />

                <View style={styles.routesTableSection}>
                    <RoutesTable
                        routes={routes}
                        loading={loadingRoutes}
                        error={routeError}
                        onAddRoute={handleAddRoute}
                        onSelectRoute={setSelectedRoute}
                        onAssignDriver={(route) => {
                            // Open the Assign Driver modal for this route.
                        }}
                        onEditRoute={(route) => {
                            // Open the Edit Route modal with this route.
                        }}
                        onDeleteRoute={(route) => {
                            // Show a confirmation before deleting this route.
                        }}
                    />
                </View>

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

                <View style={styles.routeDetailsSection}>
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
                </View>
            </ScrollView>

            {assigningUser?.location && (
                <AssignRouteModal
                    visible={
                        assigningUser !== null &&
                        !showLocationRequired
                    }
                    userName={assigningUser.name}
                    routes={routes}
                    loading={assigningRoute}
                    error={assignRouteError}
                    onClose={() => {
                        if (assigningRoute) return;

                        setAssigningUser(null);
                        setAssignRouteError(null);
                    }}
                    onConfirm={async (route) => {
                        if (!accessToken || !assigningUser?.location) {
                            return;
                        }

                        try {
                            setAssigningRoute(true);
                            setAssignRouteError(null);

                            await addLocationToRoute(
                                accessToken,
                                route.route_number,
                                {
                                    location_id: assigningUser.location.id,
                                    stop_order: null,
                                }
                            );

                            await loadUsers(); // Use your existing users refresh function.
                            setAssigningUser(null);
                        } catch (error) {
                            setAssignRouteError(
                                error instanceof Error
                                    ? error.message
                                    : "Failed to assign route"
                            );
                        } finally {
                            setAssigningRoute(false);
                        }
                    }}
                />
            )}

            <UnassignRouteModal
                visible={unassigningUser !== null}
                user={unassigningUser}
                loading={unassigning}
                error={unassignError}
                onClose={() => {
                    if (unassigning) return;

                    setUnassigningUser(null);
                    setUnassignError(null);
                }}
                onConfirm={handleConfirmUnassign}
            />

            <Modal
                visible={showLocationRequired}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setShowLocationRequired(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Location Required
                        </Text>

                        <Text style={styles.modalSubtitle}>
                            {assigningUser?.name} does not have a
                            location assigned yet. Please set their
                            location before assigning a route.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowLocationRequired(false);
                                    setAssigningUser(null);
                                }}
                            >
                                <Text
                                    style={
                                        styles.cancelButtonText
                                    }
                                >
                                    OK
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}