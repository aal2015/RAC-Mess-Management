import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    contentContainer: {
        flexGrow: 1,
    },

    header: {
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerText: {
        flex: 1,
    },

    greeting: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    userInfo: {
        fontSize: 15,
        color: "#D1D5DB",
        marginTop: 8,
    },

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
        marginTop: 8,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
});