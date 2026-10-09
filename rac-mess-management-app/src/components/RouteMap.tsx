import { View, Text } from "react-native";

export type RouteMapLocation = { 
    id: string; 
    name: string; 
    username: string; 
    latitude: number; 
    longitude: number; 
    road_name?: string | null; };

type RouteMapProps = { locations: RouteMapLocation[]; };

export default function RouteMap({locations}: RouteMapProps) {
  return (
    <View>
      <Text>Map available on web</Text>
    </View>
  );
}