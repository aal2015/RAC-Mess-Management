import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    date: {
        color: "#D1D5DB",
        marginTop: 8,
        fontSize: 16,
    },

    card: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 20,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    sectionHeaderText: {
        flex: 1,
    },

    label: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },

    sectionSubtitle: {
        color: "#6B7280",
        fontSize: 13,
        marginTop: 4,
    },

    countText: {
        color: "#6B7280",
        fontSize: 13,
    },

    toggleRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },

    option: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
    },

    takingActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    optionText: {
        color: "#374151",
        fontWeight: "600",
    },

    whiteText: {
        color: "#FFFFFF",
    },

    searchContainer: {
        height: 48,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },

    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#111827",
    },

    table: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        overflow: "hidden",
    },

    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    tableHeaderText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
    },

    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 52,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
    },

    userColumn: {
        width: 80,
    },

    nameColumn: {
        width: 120,
    },

    locationColumn: {
        flex: 1,
        paddingRight: 12,
    },

    routeColumn: {
        width: 100,
    },

    tableText: {
        fontSize: 13,
        color: "#374151",
    },

    tableTextBold: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
    },

    routeBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: "#EFF6FF",
    },

    routeBadgeText: {
        color: "#2563EB",
        fontSize: 12,
        fontWeight: "600",
    },

    assignButton: {
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 7,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",
    },

    assignButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },

    emptyText: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 14,
        paddingVertical: 24,
    },

    loadingContainer: {
        paddingVertical: 24,
        justifyContent: "center",
        alignItems: "center",
    },

    errorText: {
        color: "#DC2626",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 16,
    },
});