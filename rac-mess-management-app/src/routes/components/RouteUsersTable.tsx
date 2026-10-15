import { Text } from "react-native";
import { UserWithLocation } from "@/api/users";
import DataTable from "@/components/DataTable/DataTable";
import type { DataTableColumn } from "@/components/DataTable/types";

import { styles } from "../../user/styles/routes.styles";

type RouteUsersTableProps = {
    users: UserWithLocation[];
};

export default function RouteUsersTable({
    users,
}: RouteUsersTableProps) {
    const columns: DataTableColumn<UserWithLocation>[] = [
        {
            key: "order",
            title: "Order",
            style: styles.sequenceColumn,
            headerStyle: styles.tableHeaderText,
            render: (user) => (
                <Text style={styles.tableTextBold}>
                    {users.findIndex((item) => item.id === user.id) + 1}
                </Text>
            ),
        },
        {
            key: "name",
            title: "Name",
            style: styles.nameColumn,
            headerStyle: styles.tableHeaderText,
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
            headerStyle: styles.tableHeaderText,
            render: (user) => (
                <Text style={styles.tableText}>
                    {user.location?.road_name ?? "No location"}
                </Text>
            ),
        },
    ];

    return (
        <DataTable
            data={users}
            rowKey={(user) => user.id}
            columns={columns}
            emptyMessage="No users assigned to this route."
        />
    );
}