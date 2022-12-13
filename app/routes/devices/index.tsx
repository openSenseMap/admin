import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUserId, requireUserId } from "~/utils/session.server";
import type { Device} from "../devices";
import { getLoaderData } from "../devices";

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {

  await requireUserId(request);
  const token = await getUserId(request);

  invariant(token, "Expected user token")

  return json<Device[]>(await getLoaderData(token))
}

export default function DevicesIndexRoute() {
  const devices = useLoaderData<Device[]>()
  return (
    <div className="flex flex-col w-full">
      <div className="flex">
        <span className="text-lg font-bold p-4">Total devices: {devices.length}</span>
      </div>
      <div className="flex justify-center">
        <table>
          <thead className="border-2 border-black">
            <th className="border-r-2 border-black p-2">ID</th>
            <th className="border-r-2 border-black p-2">Name</th>
            <th className="border-r-2 border-black p-2">Exposure</th>
            <th className="border-r-2 border-black p-2">model</th>
            <th className="border-r-2 border-black p-2">updatedAt</th>
            <th className="border-r-2 border-black p-2"></th>
          </thead>
          <tbody className="border-2 border-black">
            {devices.map((device) => (
              <tr key={device._id} className="border-2 border-black">
                <td className="border-r-2 border-black p-2">{device._id}</td>
                <td className="border-r-2 border-black p-2">{device.name}</td>
                <td className="border-r-2 border-black p-2">{device.exposure}</td>
                <td className="border-r-2 border-black p-2">{device.model}</td>
                <td className="border-r-2 border-black p-2">{new Date(device.updatedAt).toLocaleString()}</td>
                <td className="border-r-2 border-black p-2">
                  <Link to={`${device._id}`} className="cursor-pointer hover:underline hover:underline-offset-2">Open on new Page</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}