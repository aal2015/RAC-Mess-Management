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
    maxWidth: 700,
    alignSelf: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    color: "#111827",
  },

  backButton: {
    height: 48,
    backgroundColor: "#0F2A4A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  errorText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontSize: 15,
  },
});