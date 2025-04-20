'use client';

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import SignupComponent from "../signup/SignupComponent";

export default function SessionCheck({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!session) {
    return <SignupComponent />;
  }

  return <>{children}</>;
}