import { View, Text } from "react-native";

type LocationMapProps = {
    latitude?: number;
    longitude?: number;
};

export default function LocationMap({
    latitude,
    longitude,
}: LocationMapProps) {
  return (
    <View>
      <Text>Map available on web</Text>
    </View>
  );
}