import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { Route } from "@/api/routes";
import { styles } from "../../user/styles/routes.styles";

export type Driver = {
    id: string;
    username: string;
    name: string;
    phone: string | null;
};

type AssignDriverModalProps = {
    visible: boolean;
    route: Route | null;
    drivers: Driver[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: (route: Route, driver: Driver) => void;
};

export default function AssignDriverModal({
    visible,
    route,
    drivers,
    loading,
    saving,
    error,
    onClose,
    onConfirm,
}: AssignDriverModalProps) {
    const [selectedDriver, setSelectedDriver] =
        useState<Driver | null>(null);

    const isReassigning = route?.driver != null;

    useEffect(() => {
        if (visible) {
            setSelectedDriver(null);
        }
    }, [visible, route?.id]);

    if (!route) return null;

    const handleConfirm = () => {
        if (!selectedDriver || saving) return;

        onConfirm(route, selectedDriver);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        {isReassigning
                            ? "Reassign Driver"
                            : "Assign Driver"}
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Route {route.route_number} — {route.name}
                    </Text>

                    {isReassigning && (
                        <View style={styles.currentDriverContainer}>
                            <Text style={styles.currentDriverLabel}>
                                Current driver
                            </Text>

                            <Text style={styles.currentDriverName}>
                                {route.driver?.name}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>
                        Select a driver
                    </Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text style={styles.loadingText}>
                                Loading drivers...
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.driverList}
                            contentContainerStyle={styles.driverListContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            {drivers.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    No active drivers available.
                                </Text>
                            ) : (
                                drivers.map((driver) => {
                                    const isSelected =
                                        selectedDriver?.id === driver.id;

                                    return (
                                        <Pressable
                                            key={driver.id}
                                            style={[
                                                styles.driverOption,
                                                isSelected &&
                                                    styles.driverOptionSelected,
                                            ]}
                                            onPress={() =>
                                                setSelectedDriver(driver)
                                            }
                                        >
                                            <View style={styles.driverInfo}>
                                                <Text
                                                    style={[
                                                        styles.driverName,
                                                        isSelected &&
                                                            styles.driverNameSelected,
                                                    ]}
                                                >
                                                    {driver.name}
                                                </Text>

                                                <Text
                                                    style={styles.driverUsername}
                                                >
                                                    @{driver.username}
                                                </Text>

                                                {driver.phone && (
                                                    <Text
                                                        style={styles.driverPhone}
                                                    >
                                                        {driver.phone}
                                                    </Text>
                                                )}
                                            </View>

                                            {isSelected && (
                                                <Text
                                                    style={
                                                        styles.selectedLabel
                                                    }
                                                >
                                                    Selected
                                                </Text>
                                            )}
                                        </Pressable>
                                    );
                                })
                            )}
                        </ScrollView>
                    )}

                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {isReassigning && selectedDriver && (
                        <Text style={styles.reassignWarning}>
                            The new driver will replace{" "}
                            {route.driver?.name}.
                        </Text>
                    )}

                    <View style={styles.modalActions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={saving}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.confirmButton,
                                (!selectedDriver || loading || saving) &&
                                    styles.confirmButtonDisabled,
                            ]}
                            onPress={handleConfirm}
                            disabled={
                                !selectedDriver || loading || saving
                            }
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    {isReassigning
                                        ? "Reassign Driver"
                                        : "Assign Driver"}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}