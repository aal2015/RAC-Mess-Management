import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native";
import { UserWithLocation } from "@/api/users";
import { styles } from "../../user/styles/routes.styles";

type UnassignRouteModalProps = {
    visible: boolean;
    user: UserWithLocation | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function UnassignRouteModal({
    visible,
    user,
    loading,
    error,
    onClose,
    onConfirm,
}: UnassignRouteModalProps) {
    if (!user) return null;

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
                        Unassign Route
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Are you sure you want to unassign{" "}
                        <Text style={{ fontWeight: "600" }}>
                            {user.name}
                        </Text>{" "}
                        from{" "}
                        <Text style={{ fontWeight: "600" }}>
                            Route {user.route?.route_number}
                        </Text>
                        ?
                    </Text>

                    <Text style={styles.unassignWarning}>
                        This action will remove the route assignment.
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
                                    Unassign
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}