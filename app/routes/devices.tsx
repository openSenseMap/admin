import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

export type Device = {
  name: string;
  exposure: string;
  model: string;
  grouptag: string[];
  updatedAt: Date;
  currentLocaltion: any[];
  sensors: any[];
  lastMeasurementAt: Date;
  _id: string;
  loc: any[];
  integrations: any[];
  access_token: string;
  useAuth: boolean;

}

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return json({});
}

export default function DevicesRoute() {
  return (
    <div>
      <h1 className="text-green-300">Device</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}