
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type MealType = "lunch" | "dinner";

export type TrackingSession = {
    id: string;
    route_id: string;
    book_date: string;
    meal_type: MealType;
    target_location_id: string | null;

    start_latitude: number;
    start_longitude: number;

    current_latitude: number;
    current_longitude: number;

    is_active: boolean;

    started_at: string;
    updated_at: string;
    ended_at: string | null;
};

export type ActiveTrackingSessionResponse = {
    has_active_session: boolean;
    session: TrackingSession | null;
};

export type StartTrackingRequest = {
    route_id: string;
    book_date: string;
    meal_type: MealType;
    latitude: number;
    longitude: number;
};

export type TrackingLocationUpdate = {
    latitude: number;
    longitude: number;
};

export type TrackingTargetUpdate = {
    location_id: string | null;
};

// Common response handler.
async function handleResponse<T>(
    response: Response,
): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.detail ?? `Tracking request failed (${response.status}).`,
        );
    }

    return data as T;
}

// 1. Start a new tracking session.
export async function startTrackingSession(
    accessToken: string,
    request: StartTrackingRequest,
): Promise<TrackingSession> {
    const response = await fetch(
        `${API_URL}/tracking/sessions`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        },
    );

    return handleResponse<TrackingSession>(response);
}

// 2. Retrieve the driver's active tracking session.
export async function getActiveTrackingSession(
    accessToken: string,
): Promise<ActiveTrackingSessionResponse> {
    const response = await fetch(
        `${API_URL}/tracking/sessions/active`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return handleResponse<ActiveTrackingSessionResponse>(response);
}

// 3. Update the driver's current location.
export async function updateTrackingLocation(
    accessToken: string,
    sessionId: string,
    request: TrackingLocationUpdate,
): Promise<TrackingSession> {
    const response = await fetch(
        `${API_URL}/tracking/sessions/${sessionId}/location`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        },
    );

    return handleResponse<TrackingSession>(response);
}

// 4. Update or clear the target delivery location.
export async function updateTrackingTarget(
    accessToken: string,
    sessionId: string,
    request: TrackingTargetUpdate,
): Promise<TrackingSession> {
    const response = await fetch(
        `${API_URL}/tracking/sessions/${sessionId}/target`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(request),
        },
    );

    return handleResponse<TrackingSession>(response);
}

// 5. Stop the tracking session.
export async function stopTrackingSession(
    accessToken: string,
    sessionId: string,
): Promise<TrackingSession> {
    const response = await fetch(
        `${API_URL}/tracking/sessions/${sessionId}/stop`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return handleResponse<TrackingSession>(response);
}

export type UserLocation = {
    id: string;
    latitude: number;
    longitude: number;
    road_name: string | null;
};

export async function getUserLocation(
    accessToken: string,
    username: string
): Promise<UserLocation> {
    const response = await fetch(
        `${API_URL}/users/location/${encodeURIComponent(username)}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user location");
    }

    return response.json();
}