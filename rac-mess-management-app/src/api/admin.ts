const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CreateUserData = {
  username: string;
  password: string;
  name: string;
  phone: string;
  role: "user" | "driver";
  battalion: string;
  bus: string | null;
};

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