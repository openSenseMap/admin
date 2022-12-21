import type {
  ActionFunction,
  LoaderArgs
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import { login, createUserSession, getUserId } from "~/utils/session.server";

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validateUrl(url: any) {
  let urls = ["/devices", "/"];
  if (urls.includes(url)) {
    return url;
  }
  return "/devices";
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};


const badRequest = (data: ActionData) =>
  json(data, { status: 400 });

export const action: ActionFunction = async ({
  request,
}) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = validateUrl(
    form.get("redirectTo") || "/devices"
  );
  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  switch (loginType) {
    case "login": {
      // login to get the user
      // if there's no user, return the fields and a formError
      // if there is a user, create their session and redirect to /jokes

      const user = await login({ username, password})
      if (!user) {
        return badRequest({
          fields,
          formError: `Username/Password combination is incorrect`
        })
      }
      return createUserSession(user.token, redirectTo);
    }

    default: {
      return badRequest({
        fields,
        formError: `Login type invalid`,
      });
    }
  }
};

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    return redirect("/devices")
  }
  return json({})
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center p-8 rounded-lg bg-white shadow shadow-white w-96 max-w-full" data-light="">
        <h1 className="mt-0 text-5xl font-bold">Login</h1>
        <form method="post" className="flex flex-col gap-4 w-full">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset className="flex justify-center m-0 p-0 border-0">
            <legend className="sr-only block mb-2 max-w-full whitespace-normal">
              Login
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input" className="m-0">Username</label>
            <input
              className="flex items-center w-full h-10 m-0 pt-2 pr-3 pb-2 pl-3 border-2 border-indigo-400 rounded"
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="m-0 mt-1 text-sm"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              className="flex items-center w-full h-10 m-0 pt-2 pr-3 pb-2 pl-3 border-2 border-indigo-400 rounded"
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={
                Boolean(
                  actionData?.fieldErrors?.password
                ) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="m-0 mt-1 text-sm"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="m-0 mt-1 text-sm"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="cursor-pointer inline-flex items-center justify-center font-bold m-0 pt-2 pr-4 pb-2 pl-4 border-0 rounded shadow bg-indigo-400 shadow-indigo-400 hover:bg-indigo-600 hover:text-white">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}