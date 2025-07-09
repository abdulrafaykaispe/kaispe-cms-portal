"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "./hooks/useAuth";
import LoginPage from "./login/page";
import Spinner from "./components/Spinner";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for API data
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      // router.push("/dashboard"); // Remove this if you want to show data on this page
    }
  }, [authLoading, user, router]);

  // Fetch data after auth
  useEffect(() => {
    fetch("/api/flex-payroll") // Change this to your actual API endpoint
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        console.log("Fetched data:", json);
      })
      .catch((err) => setDataError(err.message))
      .finally(() => setDataLoading(false));
  }, []);

  if (authLoading) return <Spinner />;
  if (!user) return <LoginPage />;

  if (dataLoading) return <div>Loading payroll data...</div>;
  if (dataError) return <div>Error: {dataError}</div>;

  return (
    <div>
      <h1>Flex Payroll Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/* "use client";

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
  }, [loading, user, router]);zz

  if (loading) return <Spinner />;

  return <LoginPage />;
} */
