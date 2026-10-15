import type { ReactNode } from "react";
import type {
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export type DataTableColumn<T> = {
  key: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<TextStyle>;
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
    onRowPress?: (item: T) => void;
    pressableRows?: boolean;
    emptyMessage?: string;
};