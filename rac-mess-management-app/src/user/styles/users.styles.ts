import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
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

    nameColumn: {
        flex: 2,
    },

    phoneColumn: {
        flex: 2,
    },

    roleColumn: {
        flex: 1,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
});
