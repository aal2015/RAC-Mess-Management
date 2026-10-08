const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type RouteDriver = {
    id: string;
    name: string;
};

export type Route = {
    id: string;
    route_number: number;
    name: string;
    driver: RouteDriver | null;
};

export async function getRoutes(
    accessToken: string
): Promise<Route[]> {
    const response = await fetch(
        `${API_URL}/routes`,
        {
            method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response
            .json()
            .catch(() => null);

        throw new Error(
            data?.detail ?? "Failed to load routes"
        );
    }

    return response.json();
}