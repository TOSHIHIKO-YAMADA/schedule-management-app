import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string()
    .min(1, "従業員名は必須です")
    .max(100, "従業員名は100文字以内で入力してください"),
  nameKana: z.string()
    .min(1, "ふりがなは必須です")
    .max(100, "ふりがなは100文字以内で入力してください"),
  email: z.string()
    .email("有効なメールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  phone: z.string()
    .max(20, "電話番号は20文字以内で入力してください")
    .optional(),
  lineId: z.string()
    .max(50, "LINE IDは50文字以内で入力してください")
    .optional(),
  notificationMethod: z.enum(["email", "line", "both"], {
    required_error: "通知方法を選択してください",
  }),
  department: z.string()
    .min(1, "所属は必須です")
    .max(100, "所属は100文字以内で入力してください"),
  nearestStation: z.string()
    .min(1, "最寄り駅は必須です")
    .max(100, "最寄り駅は100文字以内で入力してください"),
  transportation: z.enum(["train", "car", "bicycle", "walk", "bus"], {
    required_error: "主な通勤手段を選択してください",
  }),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "ステータスを選択してください",
  }),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;