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
  DialogTrigger 
} from "@/components/ui/dialog"; 
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"; 
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"; 
import { Input } from "@/components/ui/input"; 
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod"; 
import * as z from "zod"; 
import Cookies from 'js-cookie';

const formSchema = z.object({ 
  type: z.enum(["admin", "governor"], { 
    required_error: "You need to select a user type.", 
  }), 
  username: z.string().min(3, { 
    message: "Username must be at least 3 characters.", 
  }), 
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters.", 
  }), 
}); 

export function AdminGovernorPopup() { 
  const [open, setOpen] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(""); 

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
      const {username,password}= values;
      console.log({username,password});
 
      console.log(values);
      let response= undefined ;
      const token= Cookies.get('jwt');
      if(values.type="admin"){
        response = await fetch("http://localhost:4000/admin/admins", { 
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}`, "Content-Type":"application/json"
        }, 
        body: JSON.stringify({username,password}), 
      }); 
      }
      else{
        if(values.type="governor"){
          response = await fetch("http://localhost:4000/admin/governors", { 
            method: "POST", 
            headers: { 
              Authorization: `Bearer ${token}`, 
            }, 
            body: JSON.stringify(values), 
          }); 
          }

      }
      
      if (!response.ok) 
     { 
        const reply = await response.json();
        throw new Error(reply.message); 
      } 
      
      setSuccessMessage(`User added successfully!`); 
      setTimeout(() => { 
        setSuccessMessage(""); 
        setOpen(false); 
      }, 2000); 
    } catch (error) { 
      console.error("Error:", error.message); 
      setSuccessMessage(error.message); 
    } 
  }; 

  return ( 
    <Dialog open={open} onOpenChange={setOpen}> 
      <DialogTrigger asChild> 
        <Button 
          variant="outline" 
          className="w-60 h-[230] bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none"
        > 
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]"> 
            Add Admin/ 
            <br /> 
            Governor 
          </div> 
        </Button> 
      </DialogTrigger> 
      <DialogContent className="sm:max-w-[425px]"> 
        <DialogHeader> 
          <DialogTitle>Add Admin/Governor</DialogTitle> 
          <DialogDescription> 
            Enter the details for the new admin or governor. 
          </DialogDescription> 
        </DialogHeader> 
        <Form {...form}> 
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> 
            <FormField 
              control={form.control} 
              name="type" 
              render={({ field }) => ( 
                <FormItem> 
                  <FormLabel>Type</FormLabel> 
                  <Select onValueChange={field.onChange} defaultValue={field.value}> 
                    <FormControl> 
                      <SelectTrigger> 
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
                  <FormLabel>Username</FormLabel> 
                  <FormControl> 
                    <Input placeholder="Enter username" {...field} /> 
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
                  <FormLabel>Password</FormLabel> 
                  <FormControl> 
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      {...field} 
                    /> 
                  </FormControl> 
                  <FormMessage /> 
                </FormItem> 
              )} 
            /> 
            <DialogFooter> 
              <Button 
                type="submit" 
                className="w-full h-full bg-black rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none" 
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
