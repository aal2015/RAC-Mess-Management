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
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 15,
    color: "#D1D5DB",
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  roleOption: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  roleOptionActive: {
    backgroundColor: "#0F2A4A",
    borderColor: "#0F2A4A",
  },

  roleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  roleTextActive: {
    color: "#FFFFFF",
  },

  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  createButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  createText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});