import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Route } from "@/api/routes";
import { styles } from "../../user/styles/routes.styles";

type AssignRouteModalProps = {
    visible: boolean;
    userName: string;
    routes: Route[];
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: (route: Route) => void;
};

export default function AssignRouteModal({
    visible,
    userName,
    routes,
    loading,
    error,
    onClose,
    onConfirm,
}: AssignRouteModalProps) {
    const [selectedRoute, setSelectedRoute] =
        useState<Route | null>(null);

    const handleClose = () => {
        setSelectedRoute(null);
        onClose();
    };

    const handleConfirm = () => {
        if (!selectedRoute || loading) return;
        onConfirm(selectedRoute);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        Assign Route
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Select a route for {userName}.
                    </Text>

                    {error && (
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    )}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator />
                            <Text>Assigning route...</Text>
                        </View>
                    ) : routes.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No routes available.
                        </Text>
                    ) : (
                        <View style={styles.routeOptions}>
                            {routes.map((route) => {
                                const isSelected =
                                    selectedRoute?.id === route.id;

                                return (
                                    <Pressable
                                        key={route.id}
                                        style={[
                                            styles.routeOption,
                                            isSelected &&
                                                styles.routeOptionSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedRoute(route)
                                        }
                                    >
                                        <View style={styles.routeOptionContent}>
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.routeOptionTitle,
                                                        isSelected &&
                                                            styles.routeOptionTitleSelected,
                                                    ]}
                                                >
                                                    Route {route.route_number}
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.routeOptionSubtitle,
                                                        isSelected &&
                                                            styles.routeOptionSubtitleSelected,
                                                    ]}
                                                >
                                                    {route.name}
                                                </Text>
                                            </View>

                                            {isSelected && (
                                                <Text
                                                    style={
                                                        styles.routeSelectedLabel
                                                    }
                                                >
                                                    Selected
                                                </Text>
                                            )}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    <View style={styles.modalActions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.confirmButton,
                                (!selectedRoute || loading) &&
                                    styles.confirmButtonDisabled,
                            ]}
                            onPress={handleConfirm}
                            disabled={!selectedRoute || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    Confirm Assignment
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}