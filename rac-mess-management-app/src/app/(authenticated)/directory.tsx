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

import { styles } from "../../user/styles/directory.styles";

export default function DirectoryScreen() {
  const router = useRouter();

  const { accessToken, logout } = useAuth();

  const [people, setPeople] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const itemsPerPage = 10;

  const loadPeople = useCallback(async () => {
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
          : "Failed to load directory."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  useFocusEffect(
    useCallback(() => {
      loadPeople();
    }, [loadPeople])
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
        <Text style={styles.title}>
          Personal Directory
        </Text>
      </View>

      <View style={styles.content}>
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

                <Text
                  style={[
                    styles.headerCell,
                    styles.actionColumn,
                  ]}
                >
                  View
                </Text>
              </View>

              {paginatedPeople.map((person) => (
                <View
                  key={person.id}
                  style={styles.tableRow}
                >
                  <Text
                    style={[
                      styles.cell,
                      styles.nameColumn,
                    ]}
                  >
                    {person.name}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.phoneColumn,
                    ]}
                  >
                    {person.phone ?? "-"}
                  </Text>

                  <Text
                    style={[
                      styles.cell,
                      styles.roleColumn,
                    ]}
                  >
                    {person.role}
                  </Text>

                  <View style={styles.actionColumn}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname:
                            "/(authenticated)/user-detail/[id]",
                          params: {
                            id: person.id,
                          },
                        })
                      }
                    >
                      <Text style={styles.viewText}>
                        View
                      </Text>
                    </Pressable>
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
                  disabled={
                    currentPage === totalPages
                  }
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