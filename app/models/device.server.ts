import type { Feature, Point } from "geojson";
import type { Sensor } from "./sensor.server";
import type { User } from "./user.server";

export type Device = {
  name: string;
  exposure: string;
  model: string;
  grouptag: string[];
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

export function deleteDevice (deviceId: string) {

}