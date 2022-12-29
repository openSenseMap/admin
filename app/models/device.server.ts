import type { Feature, Point } from "geojson";
import type { Sensor } from "./sensor.server";
import type { User } from "./user.server";

export type Device = {
  name: string;
  exposure: string;
  model: string;
  grouptag: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
  currentLocation: any[];
  sensors: Sensor[];
  lastMeasurementAt: Date;
  _id: string;
  loc: Feature<Point>[];
  integrations: any[];
  access_token: string;
  useAuth: boolean;
  owner: User
};

export async function deleteDevice (deviceId: string, token: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/boxes/delete`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({boxIds: [deviceId]})
    }
  );
  return await res.json();
}

export async function updateDevice(deviceId: string, values: any, token: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/boxes/${deviceId}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    }
  );
  return await res.json();
}