import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
} from "react-native";

import { styles } from "../../user/styles/routes.styles";

type AddRouteModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AddRouteModal({
    visible,
    onClose,
}: AddRouteModalProps) {
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
                        Add New Route
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Create a new delivery route.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Route Number
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter route number"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Route Name
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter route name"
                        />
                    </View>

                    <View style={styles.modalActions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable style={styles.createButton}>
                            <Text style={styles.createButtonText}>
                                Create Route
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}