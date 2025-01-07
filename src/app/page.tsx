"use client";
import Image from "next/image";
import { SignupForm } from "./UI/signup-form";

export default function Home() {
  return (
    <div className=" min-h-screen p-8 sm:p-20 ">
      <main>
        {/* <p>Email</p>
        <input
          className="text-black p-2 border border-solid border-black/[.08]"
          type="email"
        />
        <p>Password</p>
        <input
          className="text-black p-2 border border-solid border-black/[.08]"
          type="password"
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            Log in
          </a>
        </div> */}
        <SignupForm></SignupForm>
      </main>
    </div>
  );
}
