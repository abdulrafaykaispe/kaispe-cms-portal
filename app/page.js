"use client";

import { useRouter } from "next/navigation";
import useAuth from "./hooks/useAuth";
import LoginPage from "./login/page";
import { useEffect } from "react";
import Spinner from "./components/Spinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(user);
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) return <Spinner />;

  return <LoginPage />;
}
