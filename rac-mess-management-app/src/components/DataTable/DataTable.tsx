import React, { isValidElement, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "./DataTable.styles";
import type { DataTableProps } from "./types";

function renderCellValue(value: React.ReactNode) {
    if (
        typeof value === "string" ||
        typeof value === "number"
    ) {
        return <Text style={styles.cell}>{value}</Text>;
    }

    if (value == null || typeof value === "boolean") {
        return <Text style={styles.cell}>-</Text>;
    }

    if (isValidElement(value)) {
        return value;
    }

    return value;
}

export default function DataTable<T>({
    data,
    rowKey,
    columns,
    actions,
    onRowPress,
    pressableRows = false,
    emptyMessage = "No items found.",
}: DataTableProps<T>) {
    const [openMenuId, setOpenMenuId] =
        useState<string | null>(null);

    return (
        <View style={styles.table}>
            {/* Table header */}
            <View style={styles.tableHeader}>
                {columns.map((column) => (
                    <View
                        key={column.key}
                        style={[
                            styles.dataColumn,
                            column.style,
                        ]}
                    >
                        <Text
                            style={[
                                styles.headerCell,
                                column.headerStyle,
                            ]}
                        >
                            {column.title}
                        </Text>
                    </View>
                ))}

                {actions && (
                    <View
                        style={[
                            styles.dataColumn,
                            styles.actionColumn,
                        ]}
                    >
                        <Text style={styles.headerCell}>
                            Actions
                        </Text>
                    </View>
                )}
            </View>

            {/* Table rows */}
            {data.length === 0 ? (
                <Text style={styles.emptyText}>
                    {emptyMessage}
                </Text>
            ) : (
                data.map((item) => {
                    const id = rowKey(item);
                    const isMenuOpen = openMenuId === id;
                    const itemActions = actions?.(item) ?? [];

                    return (
                        <Pressable
                            key={id}
                            style={[
                                styles.tableRow,
                                isMenuOpen && styles.openRow,
                            ]}
                            disabled={!pressableRows}
                            onPress={() => {
                                if (pressableRows) {
                                    onRowPress?.(item);
                                }
                            }}
                        >
                            {columns.map((column) => (
                                <View
                                    key={column.key}
                                    style={[
                                        styles.dataColumn,
                                        column.style,
                                    ]}
                                >
                                    {column.render ? (
                                        renderCellValue(column.render(item))
                                    ) : (
                                        <Text style={styles.cell}>
                                            {String(
                                                (
                                                    item as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )[column.key] ?? "-"
                                            )}
                                        </Text>
                                    )}
                                </View>
                            ))}

                            {actions && (
                                <View style={styles.actionColumn}>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Row actions"
                                        style={styles.actionButton}
                                        onPress={(event) => {
                                            event.stopPropagation();
                                            setOpenMenuId(
                                                isMenuOpen ? null : id
                                            );
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            ⋮
                                        </Text>
                                    </Pressable>

                                    {isMenuOpen && (
                                        <View style={styles.actionMenu}>
                                            {itemActions.map((action) => (
                                                <Pressable
                                                    key={action.label}
                                                    style={styles.menuItem}
                                                    onPress={(event) => {
                                                        event.stopPropagation();
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
                        </Pressable>
                    );
                })
            )}
        </View>
    );
}
