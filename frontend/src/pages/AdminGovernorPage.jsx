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
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";
import { CheckCircle, XCircle } from 'lucide-react';

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
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

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
        setToastMessage(reply.message);
        setToastType("error");
        setIsToastOpen(true);
        setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
        throw new Error(reply.message);
      }

      setSuccessMessage("User added successfully!");
      setIsError(false);
      setToastMessage("User added successfully!");
      setToastType("success");
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
      form.reset();
    } catch (error) {
      console.error("Error:", error.message);
      setSuccessMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div>
      <ToastProvider>
        <div className="flex items-center justify-center bg-cover bg-center bg-no-repeat p-2">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden  flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 bg-[#B5D3D1] p-6">
              <h2 className="text-3xl font-bold text-[#1A3B47] mb-2">Add Admin/ Governor</h2>
              <p className="text-sm mb-6 text-[#1A3B47]">Add a new admin or governor to the system.</p>
            </div>
            <div className="w-full md:w-3/5 p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#003f66]">Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#808080]">
                              <SelectValue placeholder="Select user type" />
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
                        <FormLabel className="text-[#003f66]">Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} className="border-[#808080]" />
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
                        <FormLabel className="text-[#003f66]">Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} className="border-[#808080]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-[#5D9297] text-white hover:bg-[#1A3B47]">
                    Add User
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>

        <ToastViewport />
        {isToastOpen && (
          <Toast
            onOpenChange={setIsToastOpen}
            open={isToastOpen}
            duration={2000}
            className={toastType === 'success' ? 'bg-green-100' : 'bg-red-100'}
          >
            <div className="flex items-center">
              {toastType === 'success' ? (
                <CheckCircle className="text-green-500 mr-2" />
              ) : (
                <XCircle className="text-red-500 mr-2" />
              )}
              <div>
                <ToastTitle>{toastType === 'success' ? 'Success' : 'Error'}</ToastTitle>
                <ToastDescription>
                  {toastMessage}
                </ToastDescription>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )}
      </ToastProvider>
    </div>
  );
};

export default AdminGovernorPage;