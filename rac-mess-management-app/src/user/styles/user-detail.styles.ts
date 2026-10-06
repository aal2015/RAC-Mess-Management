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

  locationSection: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },

  locationCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  locationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    fontSize: 14,
  },

  noLocationText: {
    fontSize: 15,
    marginBottom: 12,
  },

  mapPlaceholder: {
    height: 220,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  mapPlaceholderText: {
    fontSize: 16,
    color: "#777",
  },

  locationButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#333",
  },

  locationButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  locationForm: {
    marginTop: 16,
  },

  addressInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },

  searchButton: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#555",
  },

  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  cancelButton: {
    marginTop: 8,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
  },

  searchResult: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f8f8",
  },

  coordinates: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },
});