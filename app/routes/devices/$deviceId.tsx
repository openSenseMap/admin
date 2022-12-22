import type { ActionFunction, LinksFunction, LoaderArgs, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUserId, requireUserId } from "~/utils/session.server";
import { getLoaderData as loadUsers } from "../users";
import { deleteDevice} from "~/models/device.server";
import type { Device } from "~/models/device.server";
import type { User } from "~/models/user.server";
import Map from "~/shared/components/Map";

import maplibregl from "maplibre-gl/dist/maplibre-gl.css"
import type { MarkerDragEvent } from "~/shared/components/Marker";
import Marker from "~/shared/components/Marker";
import { useCallback, useState } from "react";

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: maplibregl
    }
  ]
}

export async function getLoaderData(token: string, deviceId: string) {
  const res = await fetch(`${process.env.OSEM_API_URL}/management/boxes/${deviceId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const device = await res.json()

  return device
}

export const loader: LoaderFunction = async ({ params, request }: LoaderArgs) => {
  invariant(params.deviceId, "Expected params.deviceId")

  await requireUserId(request)
  const token = await getUserId(request)

  invariant(token, "Expected user token")

  return json<{
    device: Device,
    users: User[]
  }>({
    device: await getLoaderData(token, params.deviceId),
    users: await loadUsers(token)
  })
}

export const action: ActionFunction = async ({ params, request }) => {
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  console.log(form.get("grouptag"))

  invariant(params.deviceId, "deviceId should be set")

  await requireUserId(request);
  const token = await getUserId(request)

  invariant(token, "Expected user token")

  switch (_action) {
    case "update":
      console.log(process.env.OSEM_API_URL, params.deviceId)
      const res = await fetch(`${process.env.OSEM_API_URL}/management/boxes/${params.deviceId}`, {
        method: 'PUT',
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })
      const answer = await res.json()
      console.log(answer)
      return redirect(`/devices/${params.deviceId}`)
    case "delete":
      console.log("delete device");
      deleteDevice(params.deviceId, token)
    default:
      throw new Error("Unknow action")
  }
}

export default function DeviceRoute() {
  const { device, users} = useLoaderData<{
    device: Device,
    users: User[]
  }>()
  // console.log(device)

  const [deviceLocation, setDeviceLocation] = useState<number[]>(device.loc[0].geometry.coordinates)
  const [deviceOwner, setDeviceOwner] = useState<string>(device.owner._id)

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    device.loc[0].geometry.coordinates = [event.lngLat.lng, event.lngLat.lat]
    const {lng, lat} = event.lngLat;
    setDeviceLocation([lng, lat])
  }, []);

  return (
    <>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Device details</h3>
              <p className="mt-1 text-sm text-gray-600"></p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <Form method="post">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={device.name}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                        Owner
                      </label>
                      <div className="col-span-6 sm:col-span-3">
                        <select value={deviceOwner} onChange={(e) => {
                          setDeviceOwner(e.target.value)
                        }} id="owner" name="owner" className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                          <option>kein Owner definiert</option>
                          {users.map(user => {
                            return (
                              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>

                    {/* <div className="col-span-6">
                      <label htmlFor="grouptag" className="block text-sm font-medium text-gray-700">
                        Grouptags
                      </label>
                      <input
                        type="text"
                        name="grouptag"
                        id="grouptag"
                        defaultValue={device.grouptag}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div> */}

                    <div className="col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        id="description"
                        defaultValue={device.description}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">
                        Access token
                      </label>
                      <input
                        type="text"
                        name="access_token"
                        id="access_token"
                        defaultValue={device.access_token}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <fieldset>
                          <legend className="sr-only">Exposure</legend>
                          <div className="text-base font-medium text-gray-900" aria-hidden="true">
                            Exposure
                          </div>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                              <input
                                id="indoor"
                                name="exposure"
                                type="radio"
                                value="indoor"
                                defaultChecked={device.exposure === 'indoor'}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="push-everything" className="ml-3 block text-sm font-medium text-gray-700">
                                Indoor
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="outdoor"
                                name="exposure"
                                type="radio"
                                value="outdoor"
                                defaultChecked={device.exposure === 'outdoor'}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="push-email" className="ml-3 block text-sm font-medium text-gray-700">
                                Outdoor
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="mobile"
                                name="exposure"
                                type="radio"
                                value="mobile"
                                defaultChecked={device.exposure === 'mobile'}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="push-nothing" className="ml-3 block text-sm font-medium text-gray-700">
                                Mobile
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <Map longitude={deviceLocation[0]} latitude={deviceLocation[1]}>
                        <Marker
                          longitude={deviceLocation[0]}
                          latitude={deviceLocation[1]}
                          draggable={true}
                          onDragEnd={onMarkerDragEnd}
                        />
                      </Map>
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        id="longitude"
                        value={deviceLocation[0]}
                        onChange={(e) => {
                          // update checkbox state w/o submitting the form
                          const [lng, lat] = deviceLocation;
                          setDeviceLocation([parseFloat(e.target.value), lat]);
                        }}
                        // defaultValue={device.loc[0].geometry.coordinates[0]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="lat"
                        id="lat"
                        value={deviceLocation[1]}
                        onChange={(e) => {
                          // update checkbox state w/o submitting the form
                          const [lng, lat] = deviceLocation;
                          setDeviceLocation([lng, parseFloat(e.target.value)]);
                        }}
                        // defaultValue={device.loc[0].geometry.coordinates[1]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label htmlFor="device-id" className="block text-sm font-medium text-gray-700">
                        Device ID
                      </label>
                      <input
                        type="text"
                        name="device-id"
                        id="device-id"
                        defaultValue={device._id}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="created-at" className="block text-sm font-medium text-gray-700">
                        Created at
                      </label>
                      <input
                        type="text"
                        name="created-at"
                        id="created-at"
                        defaultValue={device.createdAt}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label htmlFor="updated-at" className="block text-sm font-medium text-gray-700">
                        Updated at
                      </label>
                      <input
                        type="text"
                        name="updated-at"
                        id="updated-at"
                        defaultValue={device.updatedAt}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* <div className="col-span-6 sm:col-span-4">
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="email-confirmed"
                              name="email-confirmed"
                              type="checkbox"
                              defaultChecked={user.emailIsConfirmed}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-confirmed" className="font-medium text-gray-700">
                              E-Mail confirmed
                            </label>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {/* <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <input
                        type="text"
                        id="language"
                        name="language"
                        defaultValue={user.language}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                      </input>
                    </div> */}

                    {/* <div className="col-span-6">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        defaultValue={user.role}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div> */}

                    {/* <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label htmlFor="user-id" className="block text-sm font-medium text-gray-700">
                        User ID
                      </label>
                      <input
                        type="text"
                        name="user-id"
                        id="user-id"
                        defaultValue={user._id}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div> */}

                    {/* <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="created-at" className="block text-sm font-medium text-gray-700">
                        Created at
                      </label>
                      <input
                        type="text"
                        name="created-at"
                        id="created-at"
                        defaultValue={user.createdAt}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div> */}

                    {/* <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label htmlFor="updated-at" className="block text-sm font-medium text-gray-700">
                        Updated at
                      </label>
                      <input
                        type="text"
                        name="updated-at"
                        id="updated-at"
                        defaultValue={user.updatedAt}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div> */}
                  </div>
                </div>
                <div className="flex justify-between bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      name="_action"
                      value="delete"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Delete Device
                    </button>
                  </div>
                  <div>
                    <button
                      type="submit"
                      name="_action"
                      value="update"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Update Device
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Hardware</h3>
              <p className="mt-1 text-sm text-gray-600"></p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                <table>
                    {/* <thead className="border-2 border-black">
                      <th className="border-r-2 border-black p-2">Name</th>
                      <th className="border-r-2 border-black p-2">Exposure</th>
                      <th className="border-r-2 border-black p-2">Model</th>
                      <th className="border-r-2 border-black p-2"></th>
                    </thead> */}
                    <tbody className="border-2 border-black">
                      {/* {user.boxes.map((device) => (
                        <tr key={device._id} className="border-2 border-black">
                          <td className="border-r-2 border-black p-2">{device.name}</td>
                          <td className="border-r-2 border-black p-2">{device.exposure}</td>
                          <td className="border-r-2 border-black p-2">{device.model}</td>
                          <td className="border-r-2 border-black p-2">
                          <Link to={`/devices/${device._id}`} className="cursor-pointer hover:underline hover:underline-offset-2">Open on new Page</Link>
                        </td>
                        </tr>
                      ))} */}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Extensions</h3>
              <p className="mt-1 text-sm text-gray-600"></p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
              {/* <div className="overflow-hidden shadow sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <table>
                     <thead className="border-2 border-black">
                       <th className="border-r-2 border-black p-2">Name</th>
                       <th className="border-r-2 border-black p-2">Exposure</th>
                       <th className="border-r-2 border-black p-2">Model</th>
                       <th className="border-r-2 border-black p-2"></th>
                     </thead>
                     <tbody className="border-2 border-black">
                       {user.boxes.map((device) => (
                         <tr key={device._id} className="border-2 border-black">
                           <td className="border-r-2 border-black p-2">{device.name}</td>
                           <td className="border-r-2 border-black p-2">{device.exposure}</td>
                           <td className="border-r-2 border-black p-2">{device.model}</td>
                           <td className="border-r-2 border-black p-2">
                            <Link to={`/devices/${device._id}`} className="cursor-pointer hover:underline hover:underline-offset-2">Open on new Page</Link>
                          </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div> */}
          </div>
        </div>
      </div>
    </>
  );
}