import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Form,
  FormControl,
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const phoneValidator = (value) => {
  const phoneNumber = parsePhoneNumberFromString("+" + value);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return false;
  }
  return true;
};

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, {
        message: "Username must be at least 3 characters.",
      })
      .trim(),
    email: z
      .string()
      .email({
        message: "Please enter a valid email address.",
      })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.\nOnly these characters are allowed: @$!%*?&",
      })
      .trim(),
    userType: z.enum(["tourist", "tour-guide", "advertiser", "seller"], {
      required_error: "Please select a user type.",
    }),
    mobile: z.string().trim().optional(),
    nationality: z.string().optional(),
    dateOfBirth: z.date().optional(),
    jobOrStudent: z.string().trim().optional(),
    yearsOfExperience: z.number().int().optional(),
    previousWorks: z
      .array(
        z.object({
          title: z.string().trim().optional(),
          company: z.string().trim().optional(),
          duration: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
      )
      .optional(),
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    website: z.string().trim().optional(),
    hotline: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.userType === "tourist" ||
      data.userType === "tour-guide" ||
      data.userType === "seller"
    ) {
      if (!phoneValidator(data.mobile)) {
        ctx.addIssue({
          path: ["mobile"],
          message:
            "Please enter a valid phone number with a valid country code.",
        });
      }
    }
    if (data.userType === "tourist" || data.userType === "tour-guide") {
      if (!data.nationality) {
        ctx.addIssue({
          path: ["nationality"],
          message: "Nationality is required.",
        });
      }
    }
    if (data.userType === "tourist") {
      if (
        data.dateOfBirth > new Date() ||
        data.dateOfBirth > new Date().setFullYear(new Date().getFullYear() - 18)
      ) {
        ctx.addIssue({
          path: ["dateOfBirth"],
          message: "You must be at least 18 years old.",
        });
      }
      if (!data.jobOrStudent) {
        ctx.addIssue({
          path: ["jobOrStudent"],
          message: "Occupation is required.",
        });
      }
    }
    if (data.userType === "tour-guide") {
      if (data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
        ctx.addIssue({
          path: ["yearsOfExperience"],
          message: "Experience must be between 0 and 50 years.",
        });
      }
      if (!Number.isInteger(data.yearsOfExperience)) {
        ctx.addIssue({
          path: ["yearsOfExperience"],
          message: "Experience must be an integer value.",
        });
      }
      if (data.previousWorks && data.previousWorks.length > 0) {
        data.previousWorks.forEach((work, index) => {
          if (work.title === "") {
            ctx.addIssue({
              path: ["previousWorks", index, "title"],
              message: "Please enter the title for your previous work.",
            });
          }
          if (work.company === "") {
            ctx.addIssue({
              path: ["previousWorks", index, "company"],
              message: "Please enter the company for your previous work.",
            });
          }
          if (work.duration === "") {
            ctx.addIssue({
              path: ["previousWorks", index, "duration"],
              message: "Please enter the duration for your previous work.",
            });
          }
        });
      }
    }
    if (
      data.userType === "advertiser" ||
      data.userType === "seller" ||
      data.userType === "tour-guide"
    ) {
      if (!data.name) {
        ctx.addIssue({
          path: ["name"],
          message: "Name is required.",
        });
      }
    }
    if (data.userType === "advertiser") {
      if (!data.hotline) {
        ctx.addIssue({
          path: ["hotline"],
          message: "Hotline is required.",
        });
      }

      if (!data.hotline.match(/^\d+$/)) {
        ctx.addIssue({
          path: ["hotline"],
          message: "Hotline must be a number.",
        });
      }

      if (
        data.website &&
        !data.website.match(/^(https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*$/i)
      ) {
        ctx.addIssue({
          path: ["website"],
          message: "Website must be a valid URL.",
        });
      }
    }
  });
