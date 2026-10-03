import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { useAuth } from "../../auth/AuthContext";
import {
  getBattalionUsers,
  UnauthorizedError,
  type User,
} from "../../api/admin";

import { styles } from "../../user/styles/users.styles";

export default function UsersScreen() {
  const router = useRouter();

  const { accessToken, logout } = useAuth();

  const [people, setPeople] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const itemsPerPage = 10;

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getBattalionUsers(accessToken);

      setPeople(data);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        await logout();
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load users."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.phone ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredPeople.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedPeople = filteredPeople.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("./add-user")}
        >
          <Text style={styles.addButtonText}>
            + Add User
          </Text>
        </Pressable>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(1);
          }}
        />

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : (
          <>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.headerCell,
                    styles.nameColumn,
                  ]}
                >
                  Name
                </Text>

                <Text
                  style={[
                    styles.headerCell,
                    styles.phoneColumn,
                  ]}
                >
                  Phone
                </Text>

                <Text
                  style={[
                    styles.headerCell,
                    styles.roleColumn,
                  ]}
                >
                  Role
                </Text>

                <Text style={[styles.headerCell, styles.actionColumn]}>
                  Actions
                </Text>
              </View>

              {paginatedPeople.map((person) => (
                <View
                  key={person.id}
                  style={[
                    styles.tableRow,
                    openMenuId === person.id && styles.openRow,
                  ]}
                >
                  <Text style={[styles.cell, styles.nameColumn]}>
                    {person.name}
                  </Text>

                  <Text style={[styles.cell, styles.phoneColumn]}>
                    {person.phone ?? "-"}
                  </Text>

                  <Text style={[styles.cell, styles.roleColumn]}>
                    {person.role}
                  </Text>

                  <View style={styles.actionColumn}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() =>
                        setOpenMenuId(
                          openMenuId === person.id ? null : person.id
                        )
                      }
                    >
                      <Text style={styles.actionButtonText}>⋮</Text>
                    </Pressable>

                    {openMenuId === person.id && (
                      <View style={styles.actionMenu}>
                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            setOpenMenuId(null);

                            router.push({
                              pathname: "./user-detail/[id]",
                              params: {
                                id: person.id,
                              },
                            });
                          }}
                        >
                          <Text style={styles.menuText}>
                            View Details
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            setOpenMenuId(null);

                            router.push({
                              pathname: "/calendar",
                              params: {
                                userId: person.id,
                                username: person.username,
                              },
                            });
                          }}
                        >
                          <Text style={styles.menuText}>
                            Meal Management
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            setOpenMenuId(null);

                            console.log(
                              "Delete user:",
                              person.id
                            );
                          }}
                        >
                          <Text style={styles.deleteText}>
                            Delete User
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {filteredPeople.length === 0 && (
              <Text style={styles.emptyText}>
                No people found.
              </Text>
            )}

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
                    setCurrentPage((page) => page - 1)
                  }
                >
                  <Text style={styles.pageButtonText}>
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
                  disabled={currentPage === totalPages}
                  onPress={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  <Text style={styles.pageButtonText}>
                    Next
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}