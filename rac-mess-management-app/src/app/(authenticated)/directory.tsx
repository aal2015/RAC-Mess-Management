import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useState } from "react";
import { styles } from "../../user/styles/directory.styles";

const people = [
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
  {
    name: "Raj Kumar",
    phone: "9876543210",
    role: "User",
    bus: "Bus 02",
  },
  {
    name: "Amit Singh",
    phone: "9123456780",
    role: "User",
    bus: "Bus 01",
  },
  {
    name: "Ramesh Singh",
    phone: "9988776655",
    role: "Driver",
    bus: "Bus 02",
  },
];

export default function DirectoryScreen() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.phone}`
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
        <Text style={styles.title}>Personal Directory</Text>
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

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameColumn]}>
              Name
            </Text>

            <Text style={[styles.headerCell, styles.phoneColumn]}>
              Phone
            </Text>

            <Text style={[styles.headerCell, styles.roleColumn]}>
              Role
            </Text>

            <Text style={[styles.headerCell, styles.busColumn]}>
              Bus
            </Text>
          </View>

          {paginatedPeople.map((person, index) => (
            <View
              key={`${person.name}-${person.phone}-${index}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, styles.nameColumn]}>
                {person.name}
              </Text>

              <Text style={[styles.cell, styles.phoneColumn]}>
                {person.phone}
              </Text>

              <Text style={[styles.cell, styles.roleColumn]}>
                {person.role}
              </Text>

              <Text style={[styles.cell, styles.busColumn]}>
                {person.bus}
              </Text>
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
                currentPage === 1 && styles.disabledButton,
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
      </View>
    </ScrollView>
  );
}