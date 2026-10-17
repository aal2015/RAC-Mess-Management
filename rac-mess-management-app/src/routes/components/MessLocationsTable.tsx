
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DataTable from "@/components/DataTable/DataTable";
import type {
    DataTableColumn,
    DataTableAction,
} from "@/components/DataTable/types";

import type { MessLocation } from "@/types/messLocation";
import { styles } from "../../user/styles/routes.styles";

type MessLocationsTableProps = {
    messLocations: MessLocation[];
    loading: boolean;
    error: string | null;
    onAddMessLocation: () => void;
    onEditMessLocation: (location: MessLocation) => void;
    onDeleteMessLocation: (location: MessLocation) => void;
};

export default function MessLocationsTable({
    messLocations,
    loading,
    error,
    onAddMessLocation,
    onEditMessLocation,
    onDeleteMessLocation,
}: MessLocationsTableProps) {
    const columns: DataTableColumn<MessLocation>[] = [
        {
            key: "name",
            title: "Mess Name",
            style: styles.nameColumn,
            headerStyle: styles.tableHeaderText,
            render: (messLocation) => (
                <Text style={styles.tableTextBold} numberOfLines={1}>
                    {messLocation.name}
                </Text>
            ),
        },
        {
            key: "battalion",
            title: "Battalion",
            style: styles.routeNameColumn,
            headerStyle: styles.tableHeaderText,
            render: (messLocation) => (
                <Text style={styles.tableText} numberOfLines={1}>
                    {messLocation.battalion}
                </Text>
            ),
        },
        {
            key: "landmark",
            title: "Description",
            style: styles.locationColumn,
            headerStyle: styles.tableHeaderText,
            render: (messLocation) => (
                <Text style={styles.tableText} numberOfLines={1}>
                    {messLocation.landmark || "—"}
                </Text>
            ),
        },
    ];

    const getActions = (
        messLocation: MessLocation
    ): DataTableAction<MessLocation>[] => [
        {
            label: "Edit Mess Location",
            onPress: onEditMessLocation,
        },
        {
            label: "Delete Mess Location",
            onPress: onDeleteMessLocation,
            destructive: true,
        },
    ];

    return (
        <View style={styles.card}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                    <Text style={styles.label}>Mess Locations</Text>
                    <Text style={styles.sectionSubtitle}>
                        Manage mess starting locations
                    </Text>
                </View>

                <Text style={styles.countText}>
                    {messLocations.length} locations
                </Text>
            </View>

            <Pressable
                style={styles.addRouteButton}
                onPress={onAddMessLocation}
            >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addRouteButtonText}>
                    Add Mess Location
                </Text>
            </Pressable>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : messLocations.length === 0 ? (
                <Text style={styles.emptyText}>
                    No mess locations found.
                </Text>
            ) : (
                <DataTable
                    data={messLocations}
                    rowKey={(messLocation) => messLocation.id}
                    columns={columns}
                    actions={getActions}
                />
            )}
        </View>
    );
}
