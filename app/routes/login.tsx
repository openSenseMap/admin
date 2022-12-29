import type {
  ActionFunction,
  LoaderArgs
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import type { typeToFlattenedError} from "zod";
import { ZodError } from "zod";

import type { LoginForm } from "~/utils/session.server";
import { login, createUserSession, getUserId, LoginSchema } from "~/utils/session.server";

function validateUrl(url: any) {
  let urls = ["/devices", "/"];
  if (urls.includes(url)) {
    return url;
  }
  return "/devices";
}

type ActionData = {
  values?: LoginForm,
  formError?: typeToFlattenedError<any, string>
  apiError?: string
};

export const action: ActionFunction = async ({
  request,
}) => {
  const formData = await request.formData()
  const {redirectTo, ...values} = Object.fromEntries(formData)
  const redirectToUrl = validateUrl(redirectTo || "/devices")

  try {
    const loginSchema = LoginSchema.parse(values)
    const user = await login(loginSchema)
    return createUserSession(user.token, redirectToUrl);
  } catch (error) {
    if (error instanceof ZodError) {
      return json({values, formError: error.flatten()})
    }
    return json({ values, apiError: (error as Error).message });
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

          <div className="pt-8">
            <label htmlFor="email-input" className="m-0">Email</label>
            <input
              className="flex items-center w-full h-10 m-0 pt-2 pr-3 pb-2 pl-3 border-2 border-indigo-400 rounded"
              type="text"
              id="email-input"
              name="email"
              defaultValue={actionData?.values?.email}
              aria-invalid={Boolean(
                actionData?.formError?.fieldErrors?.email
              )}
              aria-errormessage={
                actionData?.formError?.fieldErrors?.email
                  ? "email-error"
                  : undefined
              }
            />
            {actionData?.formError?.fieldErrors?.email ? (
              <p
                className="m-0 mt-1 text-sm text-red-500"
                role="alert"
                id="email-error"
              >
                {actionData.formError.fieldErrors.email[0]}
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
              defaultValue={actionData?.values?.password}
            />
          </div>
          {actionData && actionData.apiError && (<p>{actionData.apiError}</p>)}
          <button type="submit" className="cursor-pointer inline-flex items-center justify-center font-bold m-0 pt-2 pr-4 pb-2 pl-4 border-0 rounded shadow bg-indigo-400 shadow-indigo-400 hover:bg-indigo-600 hover:text-white">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}