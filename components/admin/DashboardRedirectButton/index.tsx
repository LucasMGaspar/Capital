"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardRedirectButton() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/dashboard");
  };

  return (
    <Button variant="default" onClick={handleRedirect}>
      Ir para Dashboard
    </Button>
  );
}
