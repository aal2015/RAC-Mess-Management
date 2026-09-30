const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type User = {
  id: string;
  username: string;
  name: string;
  phone: string | null;
  role: "admin" | "user" | "driver";
  location_id: string | null;
  battalion: string | null;
  bus: string | null;
  is_active: boolean;
};

type CreateUserData = {
  username: string;
  password: string;
  name: string;
  phone: string;
  role: "user" | "driver";
  battalion: string;
  bus: string | null;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function createUser(
  accessToken: string,
  data: CreateUserData
) {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      username: data.username,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: data.role,
      location_id: null,
      battalion: data.battalion,
      bus: data.bus,
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
        : "Failed to create user"
    );
  }

  return response.json();
}

export async function getBattalionUsers(
  accessToken: string
): Promise<User[]> {
  const response = await fetch(`${API_URL}/users/battalion`, {
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
        : "Failed to load users"
    );
  }

  return response.json();
}