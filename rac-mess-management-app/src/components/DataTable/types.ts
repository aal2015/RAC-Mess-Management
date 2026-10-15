import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type DataTableColumn<T> = {
  key: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  render?: (item: T) => ReactNode;
};

export type DataTableAction<T> = {
  label: string;
  onPress: (item: T) => void;
  destructive?: boolean;
};

export type DataTableProps<T> = {
  data: T[];
  rowKey: (item: T) => string;
  columns: DataTableColumn<T>[];
  actions?: (item: T) => DataTableAction<T>[];
};