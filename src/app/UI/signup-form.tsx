import { useActionState } from "react";
import { signup } from "../actions/auth";
import { useRouter } from "next/router";
import { useState } from "react";

import { createClient } from "@/utils/supabase/component";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(error);
    }
    router.push("/");
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
    }
    router.push("/");
  }

  return (
    <form
      className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-md mx-auto"
      action={action}
    >
      <div className="w-full">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      {state?.errors?.name && <p>{state.errors.name}</p>}

      <div className="w-full">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      {state?.errors?.email && <p>{state.errors.email}</p>}

      <div className="w-full">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      {state?.errors?.password && (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition duration-150 ease-in-out"
      >
        Sign Up
      </button>
    </form>
  );
}
