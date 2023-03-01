import invariant from "tiny-invariant";
import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { getUserId, requireUserId } from "~/utils/session.server";
import type { User } from "~/models/user.server";
import { deleteUser } from "~/models/user.server";
import { execAction } from "~/models/user.server";
import { updateUser } from "~/models/user.server";

export async function getLoaderData(token: string, userId: string) {
  const res = await fetch(
    `${process.env.OSEM_API_URL}/management/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const user = await res.json();

  return user;
}

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderArgs) => {
  invariant(params.userId, "Expected params.userId");

  await requireUserId(request);
  const token = await getUserId(request);

  invariant(token, "Expected user token");

  return json<User>(await getLoaderData(token, params.userId));
};

export const action: ActionFunction = async ({ params, request }) => {
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);

  invariant(params.userId, "userId should be set");

  await requireUserId(request);
  const token = await getUserId(request);

  invariant(token, "token not valid");

  switch (_action) {
    case "update": {
      const { code, data } = await updateUser(params.userId, values, token);
      if (code !== "Ok") {
        return { error: true, message: "Sorry :(" };
      }
      return data;
    }
    case "delete": {
      await deleteUser({ userIds: [params.userId] }, token);
      return redirect("/users");
    }
    case "resendEmailConfirmation":
    case "resendWelcomeMail":
    case "passwordReset": {
      return await execAction(params.userId, _action, token);
    }
    default:
      throw new Error("Unknow action");
  }
};

export default function UserRoute() {
  const user = useLoaderData<User>();
  const actionData = useActionData();
  console.log(actionData);

  return (
    <>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-600"></p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            {actionData && actionData.error ? (
              <p>{actionData.message}</p>
            ) : null}
            <Form method="post">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <fieldset>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          defaultValue={user.name}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          E-Mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue={user.email}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-4">
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
                              <label
                                htmlFor="email-confirmed"
                                className="font-medium text-gray-700"
                              >
                                E-Mail confirmed
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="language"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Language
                        </label>
                        <input
                          type="text"
                          id="language"
                          name="language"
                          defaultValue={user.language}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        ></input>
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor="role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          defaultValue={user.role}
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <label
                          htmlFor="user-id"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                      </div>

                      <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                        <label
                          htmlFor="created-at"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <label
                          htmlFor="updated-at"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="flex justify-between bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      name="_action"
                      value="passwordReset"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Reset password
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="resendWelcomeMail"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Resend Welcome Mail
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="resendEmailConfirmation"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Resend Email Confirmation
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      name="_action"
                      value="delete"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete user
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="update"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Update user
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Devices
              </h3>
              <p className="mt-1 text-sm text-gray-600"></p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                <table>
                  <thead className="border-2 border-black">
                    <tr>
                      <th className="border-r-2 border-black p-2">Name</th>
                      <th className="border-r-2 border-black p-2">Exposure</th>
                      <th className="border-r-2 border-black p-2">Model</th>
                      <th className="border-r-2 border-black p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="border-2 border-black">
                    {user.boxes.map((device) => (
                      <tr key={device._id} className="border-2 border-black">
                        <td className="border-r-2 border-black p-2">
                          {device.name}
                        </td>
                        <td className="border-r-2 border-black p-2">
                          {device.exposure}
                        </td>
                        <td className="border-r-2 border-black p-2">
                          {device.model}
                        </td>
                        <td className="border-r-2 border-black p-2">
                          <Link
                            to={`/devices/${device._id}`}
                            className="cursor-pointer hover:underline hover:underline-offset-2"
                          >
                            Open on new Page
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
