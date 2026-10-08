import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native";
import { useState } from "react";

import { styles } from "../../user/styles/routes.styles";

type AddRouteModalProps = {
    visible: boolean;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (
        routeNumber: number,
        name: string
    ) => void;
};

export default function AddRouteModal({
    visible,
    loading,
    error,
    onClose,
    onSubmit,
}: AddRouteModalProps) {
    const [routeNumber, setRouteNumber] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = () => {
        const number = Number(routeNumber);

        if (!number || !name.trim()) {
            return;
        }

        onSubmit(number, name.trim());
    };

    const handleClose = () => {
        if (loading) return;

        setRouteNumber("");
        setName("");

        onClose();
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
                            value={routeNumber}
                            onChangeText={setRouteNumber}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Route Name
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter route name"
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    {error && (
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
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
                                styles.createButton,
                                loading &&
                                    styles.disabledButton,
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text
                                    style={
                                        styles.createButtonText
                                    }
                                >
                                    Create Route
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}