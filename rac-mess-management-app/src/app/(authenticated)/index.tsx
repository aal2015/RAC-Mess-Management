import { useAuth } from "../../auth/AuthContext";
import UserHomeScreen from "../../user/screens/UserHomeScreen";
import AdminHomeScreen from "../../user/screens/AdminHomeScreen";
import DiverHomeScreen from "@/user/screens/DriverHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminHomeScreen />;
  }

  if (user?.role === "user") {
    return <UserHomeScreen />;
  }

  if (user?.role === "driver") {
    return <DiverHomeScreen />;
  }

  return null;
}