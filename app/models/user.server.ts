import type { Device } from "./device.server";

export type User = {
  name: string;
  email: string;
  role: string;
  language: string;
  boxes: Device[];
  emailIsConfirmed: boolean;
  _id: string;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getUsers() {}
export async function getUserById(id: string) {}

export async function updateUser(userId: string, values: any, token: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    }
  );
  // console.log(await res.json())
  return await res.json();
}

export async function deleteUser(values: any, token: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/users/delete`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    }
  );
  // console.log(await res.json());
  return await res.json();
}

export async function execAction(userId: string, action: any, token: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/users/${userId}/exec`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: userId,
        action: action,
      }),
    }
  );
  return await res.json();
}
