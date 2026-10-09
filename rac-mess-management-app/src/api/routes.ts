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

export type CreateRouteRequest = {
    route_number: number;
    name: string;
};

export async function createRoute(
    accessToken: string,
    request: CreateRouteRequest
): Promise<Route> {
    const response = await fetch(
        `${API_URL}/admin/routes`,
        {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        const data = await response
            .json()
            .catch(() => null);

        throw new Error(
            data?.detail ?? "Failed to create route"
        );
    }

    return response.json();
}

export type AddRouteLocationRequest = {
    location_id: string;
    stop_order?: number | null;
};

export async function addLocationToRoute(
    accessToken: string,
    routeNumber: number,
    request: AddRouteLocationRequest
): Promise<void> {
    const response = await fetch(
        `${API_URL}/admin/${routeNumber}/locations`,
        {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        const data = await response
            .json()
            .catch(() => null);

        throw new Error(
            data?.detail ??
                "Failed to assign location to route"
        );
    }
}