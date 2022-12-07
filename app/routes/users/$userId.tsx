import invariant from "tiny-invariant";
import type { ActionFunction, LoaderArgs, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUserId, requireUserId } from "~/utils/session.server";
import type { User } from "../users";

export async function getLoaderData(token: string, userId: string) {
  const res = await fetch(`${process.env.OSEM_API_URL}/management/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const user = await res.json()
  return user
}

export const loader: LoaderFunction = async ({ params, request }: LoaderArgs) => {
  invariant(params.userId, "Expected params.userId")

  await requireUserId(request)
  const token = await getUserId(request)

  invariant(token, "Expected user token")

  return json<User>(await getLoaderData(token, params.userId));
}

export const action: ActionFunction = async ({ params, request }) => {
  const form = await request.formData();

  await requireUserId(request);
  const token = await getUserId(request)

  switch (form.get("action")) {
    case "update": {
        const res = await fetch(`${process.env.OSEM_API_URL}/management/users/${params.userId}`, {
          method: 'PUT',
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.get("name"),
            role: form.get("role")
          })
        })
        const answer = await res.json()
        console.log(answer)
        return redirect(`/users/${params.userId}`)
      }
    case "resendEmailConfirmation":
    case "resendWelcomeMail":
    case "passwordReset": {
        const res = await fetch(`${process.env.OSEM_API_URL}/management/users/${params.userId}/exec`, {
          method: 'POST',
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: params.userId,
            action: form.get("action")
          })
        })
        const answer = await res.json()
        console.log(answer)
        return redirect(`/users/${params.userId}`)
      }
    default:
      throw new Error("Unknow action")
  }
}

export default function UserRoute() {
  const user = useLoaderData<User>()
  return (
    <div className="flex flex-row w-full justify-center gap-10">
      <div className="flex justify-center w-1/2">
        <Form method="post">
          <div>
            <label>
              Name: <input type="text"  name="name" defaultValue={user.name}/>
            </label>
          </div>
          <div>
            <label>
              E-Mail: <input type="email" name="email" defaultValue={user.email}/>
            </label>
          </div>
          <div>
            <label>
              Confirmed: <input type="checkbox" name="emailIsConfirmed" defaultChecked={user.emailIsConfirmed}/>
            </label>
          </div>
          <div>
            <label>
              Language: <input type="text" name="language" defaultValue={user.language}/>
            </label>
          </div>
          <div>
            <label>
              Role: <input type="text" name="role" defaultValue={user.role} disabled/>
            </label>
          </div>
          <div>
            <button type="submit" name="action" value="update">
              Update User
            </button>
            <button type="submit" name="action" value="passwordReset">
              Reset password
            </button>
            <button type="submit" name="action" value="resendWelcomeMail">
              Resend Welcome Mail
            </button>
            <button type="submit" name="action" value="resendEmailConfirmation">
              Resend Email Confirmation
            </button>
          </div>
        </Form>
      </div>
      <div className="flex justify-center w-1/2">
        <table>
          <thead className="border-2 border-black">
            <th className="border-r-2 border-black p-2">Name</th>
          </thead>
          <tbody className="border-2 border-black">
            {user.boxes.map((box) => (
              <tr key={user._id} className="border-2 border-black">
                <td className="border-r-2 border-black p-2">{box.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}