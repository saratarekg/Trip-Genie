"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div> <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    </div>
  </div>
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <img
        src="/images/broken_genie_lamp.png"
        alt="404 Illustration"
        className="mb-8"
      />
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Button asChild>
        <Link to="/">Make a Wish !</Link>
      </Button>
    </div>
    </div>
  );
};

export default NotFound;
