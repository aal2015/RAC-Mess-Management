import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    month: {
        fontSize: 16,
        color: "#D1D5DB",
        marginTop: 8,
    },

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },

    totalSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,

        paddingHorizontal: 20,
        paddingVertical: 16,

        marginTop: 24,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
    },

    totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    calendar: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
    },

    weekHeader: {
        flexDirection: "row",
        marginBottom: 8,
    },

    weekDay: {
        flex: 1,
        textAlign: "center",
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },

    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    dayBox: {
        width: "14.2857%",
        height: 50,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    emptyDay: {
        width: "14.2857%",
        height: 50,
    },

    dayNumber: {
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
    },

    legend: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        marginTop: 16,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },

    fullMeal: {
        backgroundColor: "#DCFCE7",
    },

    partialMeal: {
        backgroundColor: "#FEF3C7",
    },

    noMeal: {
        backgroundColor: "#FEE2E2",
    },

    legendText: {
        fontSize: 13,
        color: "#374151",
    },
});