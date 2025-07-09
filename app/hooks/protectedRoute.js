"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/") {
      router.replace("/");
    }

    if (!loading && user && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  if (loading) return <Spinner />;

  if (!user && pathname !== "/") return null;

  return children;
}
