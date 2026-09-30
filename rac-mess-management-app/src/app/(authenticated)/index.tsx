import { useAuth } from "../../auth/AuthContext";
import UserHomeScreen from "../../user/screens/UserHomeScreen";
import AdminHomeScreen from "../../user/screens/AdminHomeScreen";

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminHomeScreen />;
  }

  if (user?.role === "user") {
    return <UserHomeScreen />;
  }

  return null;
}