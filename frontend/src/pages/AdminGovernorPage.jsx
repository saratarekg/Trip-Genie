"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";

const formSchema = z.object({
  type: z.enum(["admin", "governor"], {
    required_error: "You need to select a user type.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 8 characters.",
  }),
});

const AdminGovernorPage = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const { username, password } = values;
      let response = undefined;
      const token = Cookies.get("jwt");

      if (values.type === "admin") {
        response = await fetch("http://localhost:4000/admin/admins", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
      } else {
        response = await fetch("http://localhost:4000/admin/governors", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
      }

      if (!response.ok) {
        const reply = await response.json();
        setIsError(true);
        throw new Error(reply.message);
      }

      setSuccessMessage("User added successfully!");
      setIsError(false);
      form.reset();
    } catch (error) {
      console.error("Error:", error.message);
      setSuccessMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold text-[#003f66] mb-6">
            Add Admin/Governor
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#003f66]">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#808080]">
                          <SelectValue placeholder="Select a user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="governor">Governor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#003f66]">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        {...field} 
                        className="border-[#808080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#003f66]">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        className="border-[#808080]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200"
              >
                Add User
              </Button>
            </form>
          </Form>

          {successMessage && (
            <div
              className={`mt-4 p-4 rounded-md ${
                isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGovernorPage; 