// app/auth/page.tsx
import { AuthForm } from "@/components/auth/authForm";
import { AuthCheck } from "@/components/auth/authCheck";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthCheck />
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}