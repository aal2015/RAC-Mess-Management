import {
    View,
    Text,
} from "react-native";

import { UserWithLocation } from "@/api/users";

import { styles } from "../../user/styles/routes.styles";

type RouteUsersTableProps = {
    users: UserWithLocation[];
};

export default function RouteUsersTable({
    users,
}: RouteUsersTableProps) {
    return (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text
                    style={[
                        styles.tableHeaderText,
                        styles.sequenceColumn,
                    ]}
                >
                    Order
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
            </View>

            {users.length === 0 ? (
                <Text style={styles.emptyText}>
                    No users assigned to this route.
                </Text>
            ) : (
                users.map((user, index) => (
                    <View
                        key={user.id}
                        style={styles.tableRow}
                    >
                        <Text
                            style={[
                                styles.tableTextBold,
                                styles.sequenceColumn,
                            ]}
                        >
                            {index + 1}
                        </Text>

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
                            {user.location?.road_name ??
                                "No location"}
                        </Text>
                    </View>
                ))
            )}
        </View>
    );
}