"use client";

import { AuthForm } from "@/components/auth/authForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}
