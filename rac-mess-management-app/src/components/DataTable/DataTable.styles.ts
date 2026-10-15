import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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

  dataColumn: {
    minWidth: 0,
    justifyContent: "center",
  },
});