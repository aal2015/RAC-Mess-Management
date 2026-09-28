import { View, Text, Button, useWindowDimensions } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import MenuCard from "../components/MenuCard";
import BusCard from "../components/BusCard";
import { styles } from "../styles/home.styles";

export default function HomeScreen() {
  const { logout } = useAuth();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Good Afternoon, Raj
        </Text>

        <Text style={styles.userInfo}>
          P001 • 11th RAC
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.menuRow,
            isMobile && styles.menuColumn,
          ]}
        >
          <View
            style={[
              styles.menuCard,
              isMobile && styles.menuCardMobile,
            ]}
          >
            <MenuCard
              title="Today's Lunch"
              items="Dal, Rice, Roti, Sabzi, Curd"
              status="Taken"
            />
          </View>

          <View
            style={[
              styles.menuCard,
              isMobile && styles.menuCardMobile,
            ]}
          >
            <MenuCard
              title="Today's Dinner"
              items="Dal, Rice, Sabzi, Milk"
              status="Pending"
            />
          </View>
        </View>

        <BusCard
          busNumber="Bus 02"
          driverName="Ramesh Singh"
          route="Dinner route"
          startedAt="7:05 PM"
        />

        <View style={styles.logoutButton}>
          <Button title="Logout" onPress={logout} />
        </View>
      </View>
    </View>
  );
}