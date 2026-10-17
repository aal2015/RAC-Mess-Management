import { MessLocation } from "@/types/messLocation";

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

export async function removeLocationFromRoute(
    accessToken: string,
    routeNumber: number,
    locationId: string
): Promise<void> {
    const response = await fetch(
        `${API_URL}/admin/${routeNumber}/locations/${locationId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.detail ?? "Failed to unassign route"
        );
    }
}

export async function deleteRoute(
    accessToken: string,
    routeId: string
): Promise<void> {
    const response = await fetch(
        `${API_URL}/admin/routes/${routeId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? "Failed to delete route");
    }
}

export type UpdateRouteRequest = {
    route_number?: number;
    name?: string;
    driver_username?: string;
};

export async function updateRoute(
    accessToken: string,
    routeId: string,
    request: UpdateRouteRequest
): Promise<Route> {
    const response = await fetch(
        `${API_URL}/admin/routes/${routeId}`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? "Failed to update route");
    }

    return response.json();
}



export type DriverRouteAssignment = {
    driver: {
        id: string;
        username: string;
        name: string;
        phone: string | null;
    };
    route: Route | null;
    route_user_count: number;
    user_count: number;
    lunch_count: number;
    dinner_count: number;
    book_date: string;
};

export async function getMyRouteAssignment(
    accessToken: string,
    bookDate?: string
): Promise<DriverRouteAssignment> {
    const query = bookDate
        ? `?book_date=${encodeURIComponent(bookDate)}`
        : "";

    const response = await fetch(
        `${API_URL}/routes/my-assignment${query}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
            data?.detail ?? "Failed to load your route assignment"
        );
    }

    return response.json();
}

export type DeliveryLocationResponse = {
    id: string;
    latitude: number;
    longitude: number;
    road_name: string | null;
};

export type DeliveryUserResponse = {
    id: string;
    username: string;
    name: string;
    phone: string | null;
    location: DeliveryLocationResponse;
    stop_order: number | null;
    lunch_delivered: boolean;
    dinner_delivered: boolean;
};

export type RouteMealBookingsResponse = {
    book_date: string;
    meal_type: "lunch" | "dinner";
    route_number: number;
    route_name: string;
    total_bookings: number;
    delivered_count: number;
    bookings: DeliveryUserResponse[];
};

export async function getMyRouteBookings(
    accessToken: string,
    bookDate: string,
    mealType: "lunch" | "dinner",
): Promise<RouteMealBookingsResponse> {
    const params = new URLSearchParams({
        book_date: bookDate,
        meal_type: mealType,
    });

    const response = await fetch(
        `${API_URL}/routes/my-assignment/bookings?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        let message = `Failed to fetch route bookings (${response.status})`;

        try {
            const errorData = await response.json();
            if (errorData.detail) {
                message =
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : message;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    return response.json() as Promise<RouteMealBookingsResponse>;
}


export type BookingDistance = {
    distanceMeters: number;
    durationSeconds: number;
};

type LocationIQMatrixResponse = {
    code?: string;
    distances?: (number | null)[][];
    durations?: (number | null)[][];
};

export async function getBookingDistances(
    driverLocation: {
        latitude: number;
        longitude: number;
    },
    destinations: {
        latitude: number;
        longitude: number;
    }[],
): Promise<BookingDistance[]> {
    if (destinations.length === 0) {
        return [];
    }

    const apiKey = process.env.EXPO_PUBLIC_LOCATIONIQ_MAP_TOKEN;

    if (!apiKey) {
        throw new Error("LocationIQ API key is missing.");
    }

    // LocationIQ expects longitude,latitude.
    // Index 0 is the driver; destination indices start at 1.
    const coordinates = [
        `${driverLocation.longitude},${driverLocation.latitude}`,
        ...destinations.map(
            ({ latitude, longitude }) =>
                `${longitude},${latitude}`,
        ),
    ].join(";");

    const params = new URLSearchParams({
        key: apiKey,
        sources: "0",
        destinations: destinations
            .map((_, index) => String(index + 1))
            .join(";"),
        annotations: "distance,duration",
    });

    const url =
        `https://us1.locationiq.com/v1/matrix/driving/` +
        `${coordinates}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        let message = `LocationIQ Matrix request failed (${response.status}).`;

        try {
            const errorData = await response.json();
            if (typeof errorData.error === "string") {
                message = errorData.error;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    const data =
        (await response.json()) as LocationIQMatrixResponse;

    const distances = data.distances?.[0];
    const durations = data.durations?.[0];

    if (
        !distances ||
        !durations ||
        distances.length !== destinations.length ||
        durations.length !== destinations.length
    ) {
        throw new Error("Invalid response from LocationIQ Matrix API.");
    }

    return destinations.map((_, index) => ({
        distanceMeters: distances[index] ?? Infinity,
        durationSeconds: durations[index] ?? Infinity,
    }));
}

export async function getMessLocations(
    accessToken: string
): Promise<MessLocation[]> {
    const response = await fetch(`${API_URL}/users/mess-locations`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.detail || "Failed to fetch mess locations"
        );
    }

    return response.json();
}