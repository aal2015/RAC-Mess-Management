import { Text, View } from "react-native";


export type ActiveDeliveryMapLocation = {
    id: string;
    name: string;
    username: string;
    latitude: number;
    longitude: number;
    road_name?: string | null;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

type ActiveDeliveryMapProps = {
    driverLocation: Coordinates | null;
    locations: ActiveDeliveryMapLocation[];
    selectedLocationId: string | null;
};

export default function ActiveDeliveryMap({
    driverLocation,
    locations,
    selectedLocationId,
}: ActiveDeliveryMapProps) {
   return (
    <View>
      <Text>Map available on web</Text>
    </View>
  );
}
