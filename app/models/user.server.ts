import type { Device } from "./device.server";

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
};

export async function getUsers() {}
export async function getUserById(id: string) {}
