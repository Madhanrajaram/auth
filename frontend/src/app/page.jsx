"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { isEmail } from "validator";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const Page = () => {
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    let isMounted = true;

    api
      .get("/login/me")
      .then(({ data }) => {
        if (isMounted) setUser(data.user);
      })
      .catch((error) => {
        if (
          isMounted &&
          (!axios.isAxiosError(error) || error.response?.status !== 401)
        ) {
          setSessionError("Unable to check your session. Please try signing in.");
        }
      })
      .finally(() => {
        if (isMounted) setIsSessionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const submit = async (credentials) => {
    clearErrors();

    try {
      const { data } = await api.post("/login/v1", credentials);
      setUser(data.user);
      setSessionError("");
    } catch (error) {
      let message = "Unable to sign in. Please try again.";
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (typeof responseData === "string") {
          message = responseData;
        } else if (
          responseData &&
          typeof responseData === "object" &&
          "message" in responseData &&
          typeof responseData.message === "string"
        ) {
          message = responseData.message;
        } else if (!error.response) {
          message = "Can't reach the login server. Check that it is running.";
        }
      }

      setError("root.server", {
        type: "server",
        message,
      });
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setSessionError("");

    try {
      await api.post("/login/logout");
      setUser(null);
    } catch {
      setSessionError("Unable to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isSessionLoading) {
    return (
      <main className="mx-auto flex h-screen w-1/4 items-center justify-center">
        Checking session...
      </main>
    );
  }

  if (user) {
    return (
      <main className="mx-auto flex h-screen w-1/4 flex-col items-center justify-center gap-4">
        <p role="status">Signed in as {user.email}</p>
        <Button
          type="button"
          variant="outline"
          disabled={isLoggingOut}
          onClick={logout}
        >
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
        {sessionError && (
          <p role="alert" className="text-sm text-destructive">
            {sessionError}
          </p>
        )}
      </main>
    );
  }

  return (
    <form
      className="mx-auto flex h-screen w-1/4 flex-col items-center justify-center gap-4"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <Controller
        name="email"
        control={control}
        rules={{
          required: "Email is required.",
          validate: (value) => isEmail(value) || "Enter a valid email address.",
        }}
        render={({ field }) => (
          <Input
            {...field}
            aria-label="Email"
            onChange={(event) => {
              field.onChange(event);
              clearErrors("email");
              clearErrors("root.server");
            }}
            aria-invalid={Boolean(errors.email)}
            placeholder="Email"
          />
        )}
      />
      {errors.email && (
        <p role="alert" className="w-full text-sm text-destructive">
          {errors.email.message}
        </p>
      )}
      <Controller
        name="password"
        control={control}
        rules={{ required: "Password is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="password"
            aria-label="Password"
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => {
              field.onChange(event);
              clearErrors("password");
              clearErrors("root.server");
            }}
            placeholder="Password"
          />
        )}
      />
      {errors.password && (
        <p role="alert" className="w-full text-sm text-destructive">
          {errors.password.message}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      {errors.root?.server && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      )}
      {sessionError && (
        <p role="status" className="text-sm">
          {sessionError}
        </p>
      )}
    </form>
  );
};

export default Page;
