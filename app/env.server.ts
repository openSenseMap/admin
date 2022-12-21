import invariant from "tiny-invariant";

export function getEnv() {
  invariant(process.env.MAPTILER_KEY, "MAPTILER_KEY should be defined")
  invariant(process.env.OSEM_API_URL, "OSEM_API_URL should be defined")

  return {
    MAPTILER_KEY: process.env.MAPTILER_KEY,
    OSEM_API_URL: process.env.OSEM_API_URL
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}