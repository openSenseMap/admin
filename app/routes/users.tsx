import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

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
    <main className="container mx-auto p-4">
      <Outlet />
    </main>
  );
}