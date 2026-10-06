const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  road_name: string | null;
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