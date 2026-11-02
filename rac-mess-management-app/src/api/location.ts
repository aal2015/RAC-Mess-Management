const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  road_name: string | null;
};

export type UserWithLocation = {
  id: string;
  username: string;
  name: string;
  phone: string | null;
  role: string;
  battalion: string | null;
  bus: string | null;
  is_active: boolean;
  location: Location | null;
  route: {
    id: string;
    route_number: number;
    name: string;
  } | null;
};

export type ForwardGeocodeResult = {
  latitude: number;
  longitude: number;
  display_name: string;
};

export async function getUserLocation(
  accessToken: string,
  username: string
): Promise<Location | null> {
  const response = await fetch(
    `${API_URL}/users/location/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load user location");
  }

  return response.json();
}

export async function forwardGeocode(
  accessToken: string,
  address: string
): Promise<ForwardGeocodeResult> {
  const response = await fetch(`${API_URL}/locations/geocode`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      address,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to find address"
    );
  }

  return response.json();
}

export async function createUserLocation(
  accessToken: string,
  username: string,
  latitude: number,
  longitude: number,
  roadName: string
): Promise<Location> {
  const response = await fetch(`${API_URL}/admin/locations`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      username,
      latitude,
      longitude,
      road_name: roadName,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to create location"
    );
  }

  return response.json();
}

export async function updateUserLocation(
  accessToken: string,
  username: string,
  latitude?: number,
  longitude?: number,
  roadName?: string
): Promise<Location> {
  const response = await fetch(
    `${API_URL}/admin/locations/${encodeURIComponent(username)}`,
    {
      method: "PATCH",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        latitude,
        longitude,
        road_name: roadName,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to update location"
    );
  }

  return response.json();
}


export async function getLocations(
  accessToken: string
): Promise<Location[]> {
  const response = await fetch(`${API_URL}/locations/locations`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail ?? "Failed to load locations"
    );
  }

  return response.json();
}

export async function createLocation(
  accessToken: string,
  locationData: {
    latitude: number;
    longitude: number;
    road_name: string;
  }
): Promise<Location> {
  const response = await fetch(`${API_URL}/admin/locations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(locationData),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Failed to create location");
  }

  return response.json();
}