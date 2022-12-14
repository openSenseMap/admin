import type { User } from "./user.server";

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
  owner: User
};

export function deleteDevice (deviceId: string) {

}