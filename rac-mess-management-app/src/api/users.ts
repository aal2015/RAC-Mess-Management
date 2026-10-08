const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type UserLocation = {
    id: string;
    latitude: number;
    longitude: number;
    road_name: string | null;
};

export type UserRoute = {
    id: string;
    route_number: number;
    name: string;
};

export type UserWithLocation = {
    id: string;
    username: string;
    name: string;
    phone: string | null;
    role: string;
    battalion: string;
    bus: string | null;
    is_active: boolean;
    location: UserLocation | null;
    route: UserRoute | null;
};

export async function getBattalionUsersWithLocations(
    accessToken: string
): Promise<UserWithLocation[]> {
    const response = await fetch(
        `${API_URL}/users/battalion/with-locations`,
        {
            method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.detail ?? "Failed to load users"
        );
    }

    return response.json();
}