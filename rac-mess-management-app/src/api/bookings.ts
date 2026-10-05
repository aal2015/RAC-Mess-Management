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

export async function updateMealBooking(
  accessToken: string,
  bookDate: string,
  lunch: boolean,
  dinner: boolean,
  username?: string
): Promise<MealBooking> {
  let url = `${API_URL}/users/bookings/${bookDate}`;

  if (username) {
    url += `?username=${encodeURIComponent(username)}`;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      lunch,
      dinner,
    }),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to update meal booking."
    );
  }

  return response.json();
}

export async function deleteMealBooking(
  accessToken: string,
  username: string,
  date: string,
) {
  const response = await fetch(
    `${API_URL}/admin/bookings`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username,
        book_date: date,
      }),
    }
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.detail || "Failed to delete meal booking."
    );
  }

  return response.json();
}

export async function createMealBookings(
  accessToken: string,
  username: string,
  dates: string[],
  lunch: boolean,
  dinner: boolean
): Promise<MealBooking[]> {
  const response = await fetch(
    `${API_URL}/admin/bookings`,
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username,
        dates,
        lunch,
        dinner,
      }),
    }
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(
      () => null
    );

    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to create meal bookings."
    );
  }

  return response.json();
}