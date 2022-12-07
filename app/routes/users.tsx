import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {  requireUserId } from "~/utils/session.server";
import type { Device } from "./devices";

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
}

export async function getLoaderData(token: string) {
  const res = await fetch(`${process.env.OSEM_API_URL}/management/users`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const users = await res.json()
  return users.users
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  // Check if user is authenticated
  await requireUserId(request);

  return null;
}

export default function UsersRoute() {

  return (
    <div>
      <h1 className="">Users</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}