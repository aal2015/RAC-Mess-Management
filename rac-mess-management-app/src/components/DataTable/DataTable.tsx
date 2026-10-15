
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "./DataTable.styles";
import type { DataTableProps } from "./types";

export default function DataTable<T>({
  data,
  rowKey,
  columns,
  actions,
}: DataTableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <View style={styles.table}>
      {/* Table header */}
      <View style={styles.tableHeader}>
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[styles.headerCell, column.style]}
          >
            {column.title}
          </Text>
        ))}

        {actions && (
          <View style={styles.actionColumn}>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
        )}
      </View>

      {/* Table rows */}
      {data.map((item) => {
        const id = rowKey(item);
        const isMenuOpen = openMenuId === id;
        const itemActions = actions?.(item) ?? [];

        return (
          <View
            key={id}
            style={[
              styles.tableRow,
              isMenuOpen && styles.openRow,
            ]}
          >
            {columns.map((column) => (
              <Text
                key={column.key}
                style={[styles.cell, column.style]}
              >
                {column.render
                  ? column.render(item)
                  : String(
                      (
                        item as Record<string, unknown>
                      )[column.key] ?? "-"
                    )}
              </Text>
            ))}

            {actions && (
              <View style={styles.actionColumn}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Row actions"
                  style={styles.actionButton}
                  onPress={() =>
                    setOpenMenuId(isMenuOpen ? null : id)
                  }
                >
                  <Text style={styles.actionButtonText}>⋮</Text>
                </Pressable>

                {isMenuOpen && (
                  <View style={styles.actionMenu}>
                    {itemActions.map((action) => (
                      <Pressable
                        key={action.label}
                        style={styles.menuItem}
                        onPress={() => {
                          setOpenMenuId(null);
                          action.onPress(item);
                        }}
                      >
                        <Text
                          style={[
                            styles.menuText,
                            action.destructive &&
                              styles.deleteText,
                          ]}
                        >
                          {action.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
