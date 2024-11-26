import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, CheckCircle, XCircle } from 'lucide-react';
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import Cookies from "js-cookie";

const formSchema = z.object({
  code: z
    .string()
    .min(3, {
      message: "Code must be at least 3 characters long",
    })
    .max(20, {
      message: "Code must not exceed 20 characters",
    }),
  status: z.enum(["active", "inactive", "expired"]),
  percentOff: z.number().min(0).max(100),
  usage_limit: z.number().min(1),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.end > data.start, {
      message: "End date must be after the start date.",
      path: ["end"],
    }),
});

export function CreatePromoCode() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      status: "active",
      percentOff: 1,
      usage_limit: 1,
      dateRange: {
        start: new Date(),
        end: new Date(),
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const token = Cookies.get("jwt");
      const formattedValues = {
        ...values,
        dateRange: {
          start: values.dateRange.start.toISOString(),
          end: values.dateRange.end.toISOString(),
        },
      };
      const response = await fetch("http://localhost:4000/admin/promo-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create promo code");
      }

      const data = await response.json();
      console.log(data);
      form.reset();
      setToastMessage("Promo code created successfully!");
      setToastType("success");
      setIsToastOpen(true);
    } catch (error) {
      console.error(error);
      setToastMessage(error.message);
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ToastProvider>
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo Code</FormLabel>
                    <FormControl>
                      <Input placeholder="HADWA20" {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Enter a unique promo code (min 3 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="percentOff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percent Off</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a discount percentage (0-100).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the maximum number of times this code can be used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range</FormLabel>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value.start && "text-muted-foreground"
                            )}
                          >
                            {field.value.start
                              ? format(field.value.start, "PPP")
                              : "Pick a start date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value.start}
                          onSelect={(date) =>
                            field.onChange({ ...field.value, start: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-center">to</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value.end && "text-muted-foreground"
                            )}
                          >
                            {field.value.end
                              ? format(field.value.end, "PPP")
                              : "Pick an end date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value.end}
                          onSelect={(date) =>
                            field.onChange({ ...field.value, end: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormDescription>
                    Select the start and end dates for the promo code validity.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#1A3B47] hover:bg-[#1A3B47]/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Promo Code"}
            </Button>
          </form>
        </Form>
      </>

      <ToastViewport />
      {isToastOpen && (
        <Toast
          onOpenChange={setIsToastOpen}
          open={isToastOpen}
          duration={3000}
          className={toastType === "success" ? "bg-green-100" : "bg-red-100"}
        >
          <div className="flex items-center">
            {toastType === "success" ? (
              <CheckCircle className="text-green-500 mr-2" />
            ) : (
              <XCircle className="text-red-500 mr-2" />
            )}
            <div>
              <ToastTitle>
                {toastType === "success" ? "Success" : "Error"}
              </ToastTitle>
              <ToastDescription>{toastMessage}</ToastDescription>
            </div>
          </div>
          <ToastClose />
        </Toast>
      )}
    </ToastProvider>
  );
}

