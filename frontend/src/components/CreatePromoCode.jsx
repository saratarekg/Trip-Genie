import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus } from "lucide-react";
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
    path: ["end", "start"],
  }),
});

export function CreatePromoCode() {
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
          "Content-Type": "application/json", // Include content type
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error("Failed to create promo code");
      }

      const data = await response.json();

      console.log(data);

      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input placeholder="HADWA20" {...field} />
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
                />
              </FormControl>
              <FormDescription>
                Enter the maximum number of times this code can be used.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Range</FormLabel>
              <div className="flex items-center gap-2">
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
                <span>to</span>
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
              <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1A3B47] hover:bg-[#1A3B47]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create Promo Code"}
        </Button>
      </form>
    </Form>
  );
}
