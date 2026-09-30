import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { styles } from "../../user/styles/users.styles";

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
];

export default function UsersScreen() {
  const [search, setSearch] = useState("");

  const router = useRouter();

  const filteredPeople = people.filter((person) =>
    `${person.name} ${person.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
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
          onChangeText={setSearch}
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

          {filteredPeople.map((person, index) => (
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
      </View>
    </ScrollView>
  );
}