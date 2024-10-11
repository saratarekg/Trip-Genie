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

// Custom validator for mobile number
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
    logoUrl: z.string().trim().optional(),
    sellerType: z
      .enum(["VTP", "External Seller"], {
        required_error: "Please select a seller type.",
      })
      .optional(),
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
    if (data.userType === "seller") {
      if (!data.sellerType) {
        ctx.addIssue({
          path: ["sellerType"],
          message: "Seller type is required.",
        });
      }
    }
    if (data.userType === "advertiser" || data.userType === "seller") {
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

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [nationalities, setNationalities] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const alertRef = useRef(null);
  const navigate = useNavigate();

  // Create refs for form fields
  const formRefs = {
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    userType: useRef(null),
    mobile: useRef(null),
    nationality: useRef(null),
    dateOfBirth: useRef(null),
    jobOrStudent: useRef(null),
    yearsOfExperience: useRef(null),
    name: useRef(null),
    description: useRef(null),
    website: useRef(null),
    hotline: useRef(null),
    logoUrl: useRef(null),
    sellerType: useRef(null),
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      userType: undefined,
      mobile: "",
      nationality: "",
      dateOfBirth: undefined,
      jobOrStudent: "",
      yearsOfExperience: 0,
      previousWorks: [],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "previousWorks",
  });

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/nationalities"
        );
        setNationalities(response.data);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
      }
    };
    fetchNationalities();
  }, []);

  useEffect(() => {
    if (apiError && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiError]);

  const userType = watch("userType");

  const scrollToError = (errors) => {
    for (const field in errors) {
      if (formRefs[field] && formRefs[field].current) {
        formRefs[field].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;
      }
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    setApiError(null);
    values.mobile = "+" + values.mobile;
    try {
      await axios.post(
        `http://localhost:4000/auth/sign-up/${values.userType}`,
        values
      );
      setShowSignupSuccess(true);
      // navigate("/login", {
      //   state: {
      //     successMessage:
      //       "Your account has been created successfully. Please log in.",
      //   },
      // });
    } catch (error) {
      if (error.response) {
        setApiError(
          error.response.data.message || "An error occurred during signup"
        );
      } else if (error.request) {
        setApiError("No response received from server. Please try again.");
      } else {
        setApiError("An error occurred during signup. Please try again.");
      }
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg mt-20 mb-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start your unforgettable journey
          </p>
        </div>
        {apiError && (
          <div ref={alertRef}>
            <Alert
              variant="destructive"
              className="mb-4"
              onClose={() => setApiError(null)}
            >
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
            {/* <Alert message={apiError} onClose={() => setApiError(null)} /> */}
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, scrollToError)}
            className="space-y-6"
          >
            <FormField
              control={control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      {...field}
                      ref={formRefs.username}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="mail@example.com"
                      {...field}
                      ref={formRefs.email}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password*</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                      ref={formRefs.password}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger ref={formRefs.userType}>
                        <SelectValue placeholder="Please choose your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist</SelectItem>
                      <SelectItem value="tour-guide">Tour Guide</SelectItem>
                      <SelectItem value="advertiser">Advertiser</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(userType === "tourist" ||
              userType === "tour-guide" ||
              userType === "seller") && (
              <>
                <FormField
                  control={control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile*</FormLabel>
                      <FormControl>
                        <PhoneInput
                          country={"eg"}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          excludeCountries={["il"]}
                          inputProps={{
                            name: "mobile",
                            required: true,
                            autoFocus: true,
                            placeholder: "+1234567890",
                            ref: formRefs.mobile,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {(userType === "tourist" || userType === "tour-guide") && (
              <>
                <FormField
                  control={control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger ref={formRefs.nationality}>
                            <SelectValue placeholder="Please choose your nationality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nationalities.map((nat) => (
                            <SelectItem key={nat._id} value={nat._id}>
                              {nat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {userType === "tourist" && (
              <>
                <FormField
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              ref={formRefs.dateOfBirth}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            minDate={new Date("1900-01-01")}
                            maxDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            inline
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="jobOrStudent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation/Student*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your occupation"
                          {...field}
                          ref={formRefs.jobOrStudent}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {userType === "tour-guide" && (
              <>
                <FormField
                  control={control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of experience*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Years of experience"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : +e.target.value
                            )
                          }
                          ref={formRefs.yearsOfExperience}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold">
                    Previous works
                  </FormLabel>
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col space-y-2 mb-4 border p-4 rounded-md shadow-sm"
                    >
                      <FormControl>
                        <>
                          <Input
                            placeholder="Title"
                            {...register(`previousWorks.${index}.title`)}
                            defaultValue={item.title}
                            className="border rounded-md p-2"
                          />
                          {errors?.previousWorks?.[index]?.title && (
                            <p className="text-red-500 text-sm">
                              {errors.previousWorks[index].title.message}
                            </p>
                          )}
                        </>
                      </FormControl>
                      <FormControl>
                        <>
                          <Input
                            placeholder="Company"
                            {...register(`previousWorks.${index}.company`)}
                            defaultValue={item.company}
                            className="border rounded-md p-2"
                          />
                          {errors?.previousWorks?.[index]?.company && (
                            <p className="text-red-500 text-sm">
                              {errors.previousWorks[index].company.message}
                            </p>
                          )}
                        </>
                      </FormControl>
                      <FormControl>
                        <>
                          <Input
                            type="number"
                            placeholder="Duration in years"
                            min="0"
                            {...register(`previousWorks.${index}.duration`)}
                            defaultValue={item.duration}
                            className="border rounded-md p-2"
                          />
                          {errors?.previousWorks?.[index]?.duration && (
                            <p className="text-red-500 text-sm">
                              {errors.previousWorks[index].duration.message}
                            </p>
                          )}
                        </>
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="Description"
                          {...register(`previousWorks.${index}.description`)}
                          defaultValue={item.description}
                          className="border rounded-md p-2"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        className="self-end bg-orange-500 text-white p-2 rounded-md"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      type="button"
                      onClick={() =>
                        append({
                          title: "",
                          company: "",
                          duration: "",
                          description: "",
                        })
                      }
                      className="bg-purple-900 text-white p-2 rounded-md"
                    >
                      Add Previous Work
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              </>
            )}
            {(userType === "seller" || userType === "advertiser") && (
              <>
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          {...field}
                          ref={formRefs.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Description"
                          {...field}
                          ref={formRefs.description}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {userType === "seller" && (
              <>
                <FormField
                  control={control}
                  name="sellerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger ref={formRefs.sellerType}>
                            <SelectValue placeholder="Please choose your seller type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VTP">VTP</SelectItem>
                          <SelectItem value="External Seller">
                            External Seller
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {userType === "advertiser" && (
              <>
                <FormField
                  control={control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Website"
                          {...field}
                          ref={formRefs.website}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hotline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotline*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Hotline"
                          {...field}
                          ref={formRefs.hotline}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Logo URL"
                          {...field}
                          ref={formRefs.logoUrl}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={showSignupSuccess} onOpenChange={setShowSignupSuccess}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
        Successful Signup
      </DialogTitle>
      <DialogDescription>
        Your account has been created successfully! Please log in.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="flex justify-center items-center w-full">
      {/* Adding a div around the button to provide margin */}
      <div className="flex justify-center w-full">
        <Button
          className="bg-orange-500 mr-4" // Add margin-right here
          variant="default"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
