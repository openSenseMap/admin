import { Links, LiveReload, Outlet } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node"; // or cloudflare/deno

import styles from "./tailwind.css"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export async function loader() {
  return json({
    ENV: {
      OSEM_API_URL: process.env.OSEM_API_URL,
    },
  });
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <title>openSenseMap Admin Tool</title>
        <Links />
      </head>
      <body className="bg-green-400">
        <Outlet />
        <LiveReload />
      </body>
    </html>
  )
}