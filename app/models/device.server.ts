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
};

export function deleteDevice (deviceId: string) {

}