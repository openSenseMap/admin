import { Links, LiveReload, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node"; // or cloudflare/deno

import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";

import styles from "./tailwind.css"
import NavList from "~/shared/components/NavList";
import { getUserId } from "./utils/session.server";
import { getEnv } from "./env.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];


type LoaderData = {
  user: any;
  ENV: ReturnType<typeof getEnv>;
};

export async function loader({ request }: LoaderArgs) {
  return json<LoaderData>({
    user: await getUserId(request),
    ENV: getEnv(),
  });
}

export default function App() {
  const data = useLoaderData()
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <title>openSenseMap Admin Tool</title>
        <Links />
      </head>
      <body className="bg-green-400">
        <header>
          <div className="flex justify-between h-16 border-b-2 border-gray-200">
            <div className="flex flex-row h-full w-1/4">
              <div className="border-r-2 border-gray-200 p-4">openSenseMap Admin Tool</div>
            </div>
            <div className="flex">
              <div className="h-full">
                <NavList />
              </div>
              <div className="h-full border-l-2 border-gray-200 p-4">
                <form action="/logout" method="post">
                  <button type="submit" className="button">
                    {data.user ? (
                      <LockOpenIcon className="w-5 h-5" />
                    ) : (
                      <LockClosedIcon className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(
              data.ENV
            )}`,
          }}
        />
        <LiveReload />
      </body>
    </html>
  )
}