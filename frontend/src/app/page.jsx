"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { isEmail } from "validator";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const Page = () => {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();
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
    loginSuccess && router.push("/welcome");
  }, [loginSuccess]);
  const submit = async (credentials) => {
    clearErrors();
    setLoginSuccess(false);

    try {
      await axios.post(`${API_URL}/login/v1`, credentials);
      setLoginSuccess(true);
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
              setLoginSuccess(false);
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
              setLoginSuccess(false);
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
      {loginSuccess && (
        <p role="status" className="text-sm">
          Login successful.
        </p>
      )}
    </form>
  );
};

export default Page;
