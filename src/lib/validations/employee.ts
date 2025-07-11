import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string()
    .min(1, "従業員名は必須です")
    .max(100, "従業員名は100文字以内で入力してください"),
  email: z.string()
    .email("有効なメールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  phone: z.string()
    .min(1, "電話番号は必須です")
    .max(20, "電話番号は20文字以内で入力してください"),
  department: z.string()
    .min(1, "部署は必須です")
    .max(100, "部署は100文字以内で入力してください"),
  position: z.string()
    .min(1, "役職は必須です")
    .max(100, "役職は100文字以内で入力してください"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "ステータスを選択してください",
  }),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;