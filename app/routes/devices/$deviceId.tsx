import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUserId, requireUserId } from "~/utils/session.server";
import type { Device } from "~/models/device.server";

export async function getLoaderData(token: string, deviceId: string) {
  const res = await fetch(`${process.env.OSEM_API_URL}/management/boxes/${deviceId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const device = await res.json()
  console.log(device)
  return device
}

export const loader: LoaderFunction = async ({ params, request }: LoaderArgs) => {
  invariant(params.deviceId, "Expected params.deviceId")

  await requireUserId(request)
  const token = await getUserId(request)

  invariant(token, "Expected user token")

  return json<Device>(await getLoaderData(token, params.deviceId))
}

export default function DeviceRoute() {
  const device = useLoaderData<Device>()
  return (
    <div>
      {device.name}
    </div>
  );
}