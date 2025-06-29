"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      bname: "",
      ifsc: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  const handleAccountNumberChange = (e) => {
    // Remove any non-digit characters
    const value = e.target.value.replace(/\D/g, '');
    setValue('name', value);
  };

  const handleAccountNumberKeyPress = (e) => {
    // Allow only digits and control keys
    if (!/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      e.preventDefault();
    }
  };

  const handleIFSCChange = (e) => {
    // Convert to uppercase and remove any invalid characters
    let value = e.target.value.toUpperCase();
    
    // Apply IFSC format rules
    if (value.length <= 4) {
      // First 4 characters: only letters
      value = value.replace(/[^A-Z]/g, '');
    } else if (value.length === 5) {
      // 5th character: must be 0
      value = value.slice(0, 4) + '0';
    } else if (value.length > 5) {
      // Last 6 characters: only numbers
      const firstPart = value.slice(0, 4);
      const remainingPart = value.slice(5).replace(/[^0-9]/g, '');
      value = firstPart + '0' + remainingPart;
    }

    // Limit to 11 characters
    value = value.slice(0, 11);
    
    setValue('ifsc', value);
  };

  const handleIFSCKeyPress = (e) => {
    const position = e.target.selectionStart;
    
    // For first 4 characters, allow only letters
    if (position < 4 && !/[A-Za-z]/.test(e.key)) {
      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
      }
    }
    // For 5th character, only allow 0
    else if (position === 4 && e.key !== '0') {
      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
      }
    }
    // For last 6 characters, allow only numbers
    else if (position >= 5 && !/[\d]/.test(e.key)) {
      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Welth Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Number
              </label>
              <Input
                id="name"
                type="text"
                inputMode="numeric"
                placeholder="Enter 9-18 digit account number"
                maxLength={18}
                onKeyDown={handleAccountNumberKeyPress}
                onChange={handleAccountNumberChange}
                {...register("name", {
                  onChange: (e) => handleAccountNumberChange(e)
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="bname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Bank Name
                </label>
                <Input id="bname" placeholder="Enter bank name" {...register("bname")} />
                {errors.bname && (
                  <p className="text-sm text-red-500">{errors.bname.message}</p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="ifsc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  IFSC Code
                </label>
                <Input 
                  id="ifsc" 
                  placeholder="e.g., SBIN0123456" 
                  maxLength={11}
                  onKeyDown={handleIFSCKeyPress}
                  onChange={handleIFSCChange}
                  {...register("ifsc", {
                    onChange: (e) => handleIFSCChange(e)
                  })}
                />
                {errors.ifsc && (
                  <p className="text-sm text-red-500">{errors.ifsc.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="balance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-base font-medium cursor-pointer"
                >
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
