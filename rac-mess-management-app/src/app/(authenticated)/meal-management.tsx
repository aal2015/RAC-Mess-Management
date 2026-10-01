import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useState } from "react";

import { styles } from "../../user/styles/meal-management.styles";

type Meal = {
  id: number;
  dateAdded: string;
  meal: string;
};

const initialMeals: Meal[] = [
  {
    id: 1,
    dateAdded: "September 28, 2026",
    meal: "Dal, Rice, Roti, Sabzi, Curd",
  },
  {
    id: 2,
    dateAdded: "September 29, 2026",
    meal: "Chicken Curry, Rice, Roti",
  },
  {
    id: 3,
    dateAdded: "September 30, 2026",
    meal: "Rice, Dal, Mixed Vegetables",
  },
  {
    id: 4,
    dateAdded: "October 1, 2026",
    meal: "Rajma, Rice, Roti, Salad",
  },
  {
    id: 5,
    dateAdded: "October 1, 2026",
    meal: "Paneer Curry, Rice, Roti, Salad",
  },
  {
    id: 6,
    dateAdded: "October 1, 2026",
    meal: "Egg Curry, Rice, Roti",
  },
  {
    id: 7,
    dateAdded: "October 1, 2026",
    meal: "Dal Makhani, Jeera Rice, Naan",
  },
  {
    id: 8,
    dateAdded: "October 1, 2026",
    meal: "Chole, Rice, Roti, Pickle",
  },
  {
    id: 9,
    dateAdded: "October 1, 2026",
    meal: "Aloo Gobi, Dal, Rice, Roti",
  },
  {
    id: 10,
    dateAdded: "October 1, 2026",
    meal: "Fish Curry, Rice, Roti, Salad",
  },
  {
    id: 11,
    dateAdded: "October 1, 2026",
    meal: "Mix Veg, Dal, Rice, Roti, Curd",
  },
  {
    id: 12,
    dateAdded: "October 1, 2026",
    meal: "Chicken Biryani, Raita, Salad",
  },
];

export default function MealManagementScreen() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);

  const [isModalVisible, setIsModalVisible] =
    useState(false);

  const [editingMealId, setEditingMealId] =
    useState<number | null>(null);

  const [mealText, setMealText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(
    meals.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedMeals = meals.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  function openAddMeal() {
    setEditingMealId(null);
    setMealText("");
    setIsModalVisible(true);
  }

  function openEditMeal(meal: Meal) {
    setEditingMealId(meal.id);
    setMealText(meal.meal);
    setIsModalVisible(true);
  }

  function closeModal() {
    setIsModalVisible(false);
    setEditingMealId(null);
    setMealText("");
  }

  function handleSaveMeal() {
    if (!mealText.trim()) {
      return;
    }

    if (editingMealId !== null) {
      setMeals((currentMeals) =>
        currentMeals.map((meal) =>
          meal.id === editingMealId
            ? {
                ...meal,
                meal: mealText.trim(),
              }
            : meal
        )
      );
    } else {
      const newMeal: Meal = {
        id: Date.now(),
        dateAdded: new Date().toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        ),
        meal: mealText.trim(),
      };

      setMeals((currentMeals) => [
        newMeal,
        ...currentMeals,
      ]);

      setCurrentPage(1);
    }

    closeModal();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Meal Management
        </Text>

        <Text style={styles.subtitle}>
          Manage reusable meal items
        </Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.addButton}
          onPress={openAddMeal}
        >
          <Text style={styles.addButtonText}>
            + Add Meal
          </Text>
        </Pressable>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.headerCell,
                styles.dateColumn,
              ]}
            >
              Date Added
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.mealColumn,
              ]}
            >
              Meal
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.actionColumn,
              ]}
            >
              Actions
            </Text>
          </View>

          {paginatedMeals.map((meal) => (
            <View
              key={meal.id}
              style={styles.tableRow}
            >
              <Text
                style={[
                  styles.cell,
                  styles.dateColumn,
                ]}
              >
                {meal.dateAdded}
              </Text>

              <Text
                style={[
                  styles.cell,
                  styles.mealColumn,
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {meal.meal}
              </Text>

              <View
                style={styles.actionColumn}
              >
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    openEditMeal(meal)
                  }
                >
                  <Text
                    style={styles.editButtonText}
                  >
                    Edit
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Pressable
              style={[
                styles.pageButton,
                currentPage === 1 &&
                  styles.disabledButton,
              ]}
              disabled={currentPage === 1}
              onPress={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
            >
              <Text
                style={styles.pageButtonText}
              >
                Previous
              </Text>
            </Pressable>

            <Text style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </Text>

            <Pressable
              style={[
                styles.pageButton,
                currentPage === totalPages &&
                  styles.disabledButton,
              ]}
              disabled={
                currentPage === totalPages
              }
              onPress={() =>
                setCurrentPage(
                  (page) => page + 1
                )
              }
            >
              <Text
                style={styles.pageButtonText}
              >
                Next
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingMealId !== null
                ? "Edit Meal"
                : "Add Meal"}
            </Text>

            <Text style={styles.label}>
              Meal
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Enter meal items"
              value={mealText}
              onChangeText={setMealText}
              multiline
            />

            <View
              style={styles.modalButtonRow}
            >
              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSaveMeal}
              >
                <Text style={styles.saveText}>
                  {editingMealId !== null
                    ? "Save Changes"
                    : "Add Meal"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}