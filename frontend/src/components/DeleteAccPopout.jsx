"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
  type: z.enum(["tourist","tour guide","advertiser","tourism governor","seller","admin"], {
    required_error: "You need to select a user type.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
   
    },
  });

  function onSubmit(values) {
    // Here you would typically send the data to your backend
    console.log(values);
    setSuccessMessage(`${values.type} deleted successfully!`);
    setTimeout(() => {
      setSuccessMessage("");
      setOpen(false);
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-60 h-[230] bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none" // Adjusted styles here
        >
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
           Manage
            <br />
           Accounts
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Enter the username of the account you want to delete
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist</SelectItem>
                      <SelectItem value="tourism governor">Tourism Governor</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="advertiser">Advertiser</SelectItem>
                      <SelectItem value="tour guide">Tourguide</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="w-full h-full bg-black  rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none" // Adjusted styles here
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
