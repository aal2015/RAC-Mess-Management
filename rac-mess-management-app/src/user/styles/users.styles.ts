import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },

    searchInput: {
        height: 48,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 15,
        marginBottom: 16,
    },

    table: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        overflow: "visible",
    },

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },

    headerCell: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
    },

    cell: {
        fontSize: 14,
        color: "#111827",
    },

    nameColumn: {
        flex: 2,
    },

    phoneColumn: {
        flex: 2,
    },

    roleColumn: {
        flex: 1,
    },

    actionColumn: {
        flex: 0.8,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1000,
    },

    busColumn: {
        flex: 1,
    },

    emptyText: {
        textAlign: "center",
        marginTop: 24,
        color: "#6B7280",
        fontSize: 14,
    },

    pagination: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        marginTop: 16,
    },

    pageButton: {
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },

    disabledButton: {
        backgroundColor: "#D1D5DB",
    },

    pageButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },

    pageInfo: {
        fontSize: 14,
        color: "#374151",
    },

    addButton: {
        backgroundColor: "#2563EB",
        height: 48,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },

    addButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },

    errorText: {
        textAlign: "center",
        color: "#DC2626",
        fontSize: 14,
        marginTop: 24,
    },

    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
    },

    actionButtonText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#374151",
        lineHeight: 24,
    },

    actionMenu: {
        position: "absolute",
        top: 40,
        right: 0,
        width: 180,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingVertical: 4,
        zIndex: 2000,
        elevation: 10,
    },

    menuItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    menuText: {
        fontSize: 14,
        color: "#111827",
    },

    deleteText: {
        fontSize: 14,
        color: "#DC2626",
        fontWeight: "600",
    },

    openRow: {
        zIndex: 1000,
        elevation: 10,
    },
});