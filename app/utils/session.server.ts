import invariant from "tiny-invariant";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

type LoginForm = {
  username: string;
  password: string;
};

const validateJWT = function validateJWT (jwt: string) {
  if (!jwt) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [header, payload, signature] = jwt.split(".");

    const jsonPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    return (
      jsonPayload.role === "admin" &&
      new Date(jsonPayload.exp * 1000) > new Date()
    );
  } catch (error) {
    return false;
  }
}

export async function login({ username, password }: LoginForm) {
  const response = await fetch(
    `${process.env.OSEM_API_URL}/users/sign-in`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    }
  );
  const user = await response.json();
  console.log(user);

  if (!user) {
    return null;
  }

  if (validateJWT(user.token) !== true) {
    throw new Error("Sign in succeeded but authorization is insufficient.");
  }

  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "osem-admin-jwt",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const token = session.get("token");
  if (!token || typeof token !== "string") return null;
  return token;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const token = session.get("token");
  if (!token || typeof token !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return token;
}

export async function createUserSession(token: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("token", token);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}
