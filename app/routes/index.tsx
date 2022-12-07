import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return json({});
}

export default function IndexRoute() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1>openSenseMap Admin Tool</h1>
      <div className="flex w-full justify-center gap-4 mt-4">
        <div className="border-2 p-4">
          <Link to="users">Edit users</Link>
        </div>
        <div className="border-2 p-4">
          <Link to="devices">Edit devices</Link>
        </div>
      </div>
      <form action="/logout" method="post">
        <button type="submit" className="button">
          Logout
        </button>
      </form>
    </div>
  )
}