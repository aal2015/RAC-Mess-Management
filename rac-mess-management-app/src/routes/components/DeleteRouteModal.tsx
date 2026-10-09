import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Route } from "@/api/routes";
import { styles } from "../../user/styles/routes.styles";

type DeleteRouteModalProps = {
    visible: boolean;
    route: Route | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function DeleteRouteModal({
    visible,
    route,
    loading,
    error,
    onClose,
    onConfirm,
}: DeleteRouteModalProps) {
    if (!route) return null;

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
                        Delete Route
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Are you sure you want to delete{" "}
                        <Text style={{ fontWeight: "600" }}>
                            Route {route.route_number}
                        </Text>{" "}
                        — {route.name}?
                    </Text>

                    <Text style={styles.unassignWarning}>
                        This action cannot be undone.
                    </Text>

                    {error && (
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    )}

                    <View style={styles.modalActions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.unassignConfirmButton}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text
                                    style={
                                        styles.unassignConfirmButtonText
                                    }
                                >
                                    Delete Route
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
