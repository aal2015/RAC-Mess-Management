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

  menuRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  menuColumn: {
    flexDirection: "column",
  },

  menuCard: {
    flex: 1,
  },

  menuCardMobile: {
    flex: 0,
    width: "100%",
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

  cardTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },

  menuList: {
    gap: 8,
  },

  menuItem: {
    fontSize: 16,
    color: "#374151",
  },

  emptyText: {
    fontSize: 15,
    color: "#6B7280",
  },

  busInfo: {
    gap: 18,
    marginBottom: 20,
  },

  busNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  driverName: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },

  route: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },

  startedAt: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  trackButton: {
    height: 46,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  logoutButton: {
    marginTop: 12,
  },
});