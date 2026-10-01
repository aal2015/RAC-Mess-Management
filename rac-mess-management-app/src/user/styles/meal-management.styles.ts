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
    maxWidth: 1100,
    alignSelf: "center",
    padding: 24,
  },

  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    height: 48,
    paddingHorizontal: 18,
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

  table: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
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
    minHeight: 70,
  },

  headerCell: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  cell: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },

  dateColumn: {
    flex: 1.5,
  },

  mealColumn: {
    flex: 2.5,
    paddingRight: 12,
  },

  actionColumn: {
    flex: 0.9,
    alignItems: "center",
    justifyContent: "center",
  },

  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
  },

  editButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 550,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  modalButtonRow: {
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
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});