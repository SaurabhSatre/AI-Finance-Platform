import { z } from "zod";

export const accountSchema = z.object({
  name: z.string()
    .regex(/^\d+$/, "Only numbers are allowed")
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number cannot exceed 18 digits"),
  bname:z.string().min(1, "Bank name is required"),
  ifsc: z.string()
    .length(11, "IFSC code must be exactly 11 characters")
    .regex(
      /^[A-Z]{4}0\d{6}$/,
      "IFSC must start with 4 capital letters, followed by 0, and end with 6 digits"
    ),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });
