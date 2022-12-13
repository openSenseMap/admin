import invariant from "tiny-invariant";
import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserId, requireUserId } from "~/utils/session.server";
import { getLoaderData } from "../users";
import type { User } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {

  await requireUserId(request);
  const token = await getUserId(request)

  invariant(token, "Expected user token")

  return json<User[]>(await getLoaderData(token))
}

export default function UsersIndexRoute() {
  const users = useLoaderData<User[]>()
  return (
    <div className="flex flex-col w-full">
      <div className="flex">
        <span className="text-lg font-bold p-4">Total devices: {users.length}</span>
      </div>
      <div className="flex justify-center">
        <table>
          <thead className="border-2 border-black">
            <th className="border-r-2 border-black p-2">Name</th>
            <th className="border-r-2 border-black p-2">E-Mail</th>
            <th className="border-r-2 border-black p-2">Confirmed</th>
            <th className="border-r-2 border-black p-2">createdAt</th>
            <th className="border-r-2 border-black p-2">updatedAt</th>
            <th className="border-r-2 border-black p-2"># Devices</th>
            <th className="border-r-2 border-black p-2"></th>
          </thead>
          <tbody className="border-2 border-black">
            {users.map((user) => (
              <tr key={user._id} className="border-2 border-black">
                <td className="border-r-2 border-black p-2">{user.name}</td>
                <td className="border-r-2 border-black p-2">{user.email}</td>
                <td className="border-r-2 border-black p-2">{user.emailIsConfirmed}</td>
                <td className="border-r-2 border-black p-2">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="border-r-2 border-black p-2">{new Date(user.updatedAt).toLocaleString()}</td>
                <td className="border-r-2 border-black p-2">{user.boxes.length}</td>
                <td className="border-r-2 border-black p-2">
                  <Link to={`${user._id}`} className="cursor-pointer hover:underline hover:underline-offset-2">Open on new Page</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}