"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { AuthError } from '@supabase/supabase-js';

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    // Add more password requirements if needed
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormMessage(null);
  
    // Validate password on signup
    if (mode === 'signup') {
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
          setError(passwordValidationError);
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
    }
  
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setFormMessage({
            type: 'success',
            message: 'Check your email to confirm your account!'
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      if (err instanceof AuthError) {
        // Handle specific Supabase auth errors
        switch (err.message) {
          case 'Invalid login credentials':
            setError('Incorrect email or password');
            break;
          case 'Email not confirmed':
            setError('Please confirm your email before signing in');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
  <Input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={isLoading}
    required
  />
  <div>
    <Input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        if (mode === 'signup') {
          setPasswordError(validatePassword(e.target.value));
        }
      }}
      disabled={isLoading}
      required
    />
    {passwordError && mode === 'signup' && (
      <p className="text-red-500 text-sm mt-1">{passwordError}</p>
    )}
  </div>

  {mode === 'signup' && (
    <div>
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
        required
      />
      {password !== confirmPassword && confirmPassword && (
        <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
      )}
    </div>
  )}

  {error && (
    <p className="text-red-500 text-sm">{error}</p>
  )}
  
  {formMessage && (
    <p className={`text-sm ${formMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
      {formMessage.message}
    </p>
  )}

  <Button 
    type="submit" 
    className="w-full" 
    disabled={isLoading || (mode === 'signup' && password !== confirmPassword)}
  >
    {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
  </Button>

  <div className="text-center">
    <Button
      variant="link"
      onClick={() => {
        setMode(mode === "signin" ? "signup" : "signin");
        setError(null);
        setFormMessage(null);
        setPassword("");
        setConfirmPassword("");
      }}
      type="button"
    >
      {mode === "signin"
        ? "Need an account? Sign up"
        : "Already have an account? Sign in"}
    </Button>
  </div>
</form>
    </div>
  );
}