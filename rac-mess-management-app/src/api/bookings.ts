const API_URL = process.env.EXPO_PUBLIC_API_URL;

import { UnauthorizedError } from "./admin";

export type MealBooking = {
  id: string;
  user_id: string;
  book_date: string;
  lunch: boolean;
  dinner: boolean;
  created_at: string;
  updated_at: string;
};

export async function getMealBookings(
  accessToken: string,
  username?: string
): Promise<MealBooking[]> {
  let url = `${API_URL}/users/bookings`;

  if (username) {
    url += `?username=${encodeURIComponent(username)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to load meal bookings."
    );
  }

  return response.json();
}