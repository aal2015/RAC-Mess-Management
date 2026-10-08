import { View, Text } from "react-native";

import { Route } from "@/api/routes";
import { UserWithLocation } from "@/api/users";

import RouteUsersTable from "./RouteUsersTable";
import { styles } from "../../user/styles/routes.styles";

type RouteDetailsProps = {
    route: Route;
    users: UserWithLocation[];
};

export default function RouteDetails({
    route,
    users,
}: RouteDetailsProps) {
    const routeUsers = users
        .filter(
            (user) =>
                user.role === "user" &&
                user.route?.id === route.id
        )
        .sort((a, b) => {
            // For now, users don't have sequence
            // in the current API response.
            return 0;
        });

    return (
        <View style={styles.card}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                    <Text style={styles.label}>
                        Route {route.route_number}
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                        {route.name}
                    </Text>
                </View>

                <Text style={styles.countText}>
                    {routeUsers.length} users
                </Text>
            </View>

            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderTitle}>
                    Map Coming Soon
                </Text>

                <Text style={styles.mapPlaceholderText}>
                    Route locations will be displayed here.
                </Text>
            </View>

            <View style={styles.routeUsersSection}>
                <Text style={styles.routeUsersTitle}>
                    Delivery Order
                </Text>

                <RouteUsersTable
                    users={routeUsers}
                />
            </View>
        </View>
    );
}