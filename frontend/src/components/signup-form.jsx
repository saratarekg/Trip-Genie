import { useState, useEffect } from "react"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Custom validator for mobile number
const phoneValidator = (value) => {
  const phoneNumber = parsePhoneNumberFromString('+'+value);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return false;
  }
  return true;
};

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).trim(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).trim().toLowerCase(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.\nOnly these characters are allowed: @$!%*?&",
  }).trim(),
  userType: z.enum(["tourist", "tourGuide", "advertiser", "seller"], {
    required_error: "Please select a user type.",
  }),
  mobile: z.string().trim().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.date().optional(),
  occupation: z.string().trim().optional(),
  yearsOfExperience: z.string(),
  previousWorks: z.array(z.object({
    title: z.string().trim().min(1, {
      message: "Title is required",
    }),
    company: z.string().trim().min(1, {
      message: "Company is required",
    }),
    duration: z.string().trim().min(1, {
      message: "Duration is required",
    }),
    description: z.string().trim().optional(),
  })).optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  website: z.string().trim().optional(),
  hotline: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
  sellerType: z.enum(["VTP", "External Seller"], {
    required_error: "Please select a seller type.",
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.userType === "tourist" || data.userType === "tourGuide" || data.userType === "seller") {
    if (!phoneValidator(data.mobile)) {
      // Use custom validation logic directly inside superRefine
      ctx.addIssue({
        path: ["mobile"],
        message: "Please enter a valid phone number with a valid country code.",
      });
    }
  }
  if (data.userType === "tourist" || data.userType === "tourGuide") {
    if (!data.nationality) {
      ctx.addIssue({
        path: ["nationality"],
        message: "Nationality is required.",
      });
    }
  }
  if (data.userType === "tourist") {
    if (!data.dateOfBirth) {
      ctx.addIssue({
        path: ["dateOfBirth"],
        message: "Date of birth is required.",
      });
    }
    if (!data.occupation) {
      ctx.addIssue({
        path: ["occupation"],
        message: "Occupation is required for tourists.",
      });
    }
  }
  if (data.userType === "tourGuide") {
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
  }
  if (data.userType === "seller") {
    if (!data.sellerType) {
      ctx.addIssue({
        path: ["sellerType"],
        message: "Seller type is required.",
      });
    }
    if (!data.name) {
      ctx.addIssue({
        message: "Name is required for VTP sellers.",
      })
    }
  }

});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [nationalities, setNationalities] = useState([]);
  
  const { control, register } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "previousWorks"
  });

  useEffect(() => {
    // Fetch nationalities from the backend
    const fetchNationalities = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/nationalities')
        console.log('Nationalities:', response.data);
        setNationalities(response.data);
      }catch(error){
        console.error('Error fetching nationalities:', error);
      }
    };
    fetchNationalities();
  }, []);

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
      occupation: "",
    },
  })

  const userType = form.watch("userType")

  function onSubmit(values) {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsLoading(false)
    }, 2000)
  }

  return (
    (<div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg mt-20 mb-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start your unforgettable journey
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="mail@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Please choose your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist</SelectItem>
                      <SelectItem value="tourGuide">Tour Guide</SelectItem>
                      <SelectItem value="advertiser">Advertiser</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            {(userType === "tourist" || userType==="tourGuide" || userType==="seller") && (
              <>
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <PhoneInput
                          country={'eg'} // Default country code
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          //enableSearch={true} // Optional: To search for countries
                          excludeCountries={['il']}
                          inputProps={{
                            name: 'mobile',
                            required: true,
                            autoFocus: true,
                            placeholder: '+1234567890',
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {(userType === "tourist" || userType==="tourGuide") && (
              <>
              <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please choose your nationality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nationalities.map(nat => (
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
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}>
                              {field.value ? (
                                format(field.value, "PPP")  
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" >
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
                  )} />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation/Student</FormLabel>
                      <FormControl>
                        <Input placeholder="Your occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </>
            )}
            {userType === "tourGuide" && (
              <>
                <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of experience</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Years of experience" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold">Previous works</FormLabel>
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex flex-col space-y-2 mb-4 border p-4 rounded-md shadow-sm">
                      <FormControl>
                        <Input placeholder="Title" {...register(`previousWorks.${index}.title`)} className="border rounded-md p-2" />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="Company" {...register(`previousWorks.${index}.company`)} className="border rounded-md p-2" />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="Duration" {...register(`previousWorks.${index}.duration`)} className="border rounded-md p-2" />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="Description" {...register(`previousWorks.${index}.description`)} className="border rounded-md p-2" />
                      </FormControl>
                      <Button type="button" onClick={() => remove(index)} className="self-end bg-orange-500 text-white p-2 rounded-md">
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button type="button" onClick={() => append({ title: "", company: "", duration: "", description: "" })} className="bg-purple-900 text-white p-2 rounded-md">
                      Add Previous Work
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              </>
            )}
            {(userType === "seller" || userType==="advertiser") && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
            )}
            {userType === "seller" && (
                <>
                <FormField
                  control={form.control}
                  name="sellerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please choose your seller type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VTP">VTP</SelectItem>
                          <SelectItem value="External Seller">External Seller</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>)
            }
            {(userType==="advertiser") && (
              <>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                  control={form.control}
                  name="hotline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotline</FormLabel>
                      <FormControl>
                        <Input placeholder="Hotline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Logo URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </>
            )}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="#" className="font-medium text-orange-500 hover:text-orange-600">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>)
  );
}