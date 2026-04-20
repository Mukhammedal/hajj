import { z } from "zod";

const kzPhoneRegex = /^\+7\d{10}$/;
const iinRegex = /^\d{12}$/;

export const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  role: z.enum(["pilgrim", "operator"]),
  firstName: z.string().min(2, "Введите имя"),
  lastName: z.string().min(2, "Введите фамилию"),
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  phone: z.string().regex(kzPhoneRegex, "Телефон должен быть в формате +7XXXXXXXXXX"),
  iin: z.string().regex(iinRegex, "ИИН должен состоять из 12 цифр"),
  password: z
    .string()
    .min(10, "Минимум 10 символов")
    .regex(/\d/, "Добавьте хотя бы одну цифру"),
  accepted: z.literal(true, {
    errorMap: () => ({ message: "Нужно принять оферту и политику" }),
  }),
});

export const groupSchema = z
  .object({
    name: z.string().min(3, "Введите название группы"),
    flightDate: z.string().min(1, "Укажите дату вылета"),
    returnDate: z.string().min(1, "Укажите дату возврата"),
    hotelMecca: z.string().min(2, "Укажите отель в Мекке"),
    hotelMedina: z.string().min(2, "Укажите отель в Медине"),
    quotaTotal: z.coerce.number().int().min(1, "Квота должна быть больше 0"),
    guideName: z.string().min(2, "Укажите имя гида"),
    guidePhone: z.string().min(6, "Укажите телефон гида"),
    departureCity: z.enum(["Almaty", "Astana", "Shymkent", "Turkestan", "Aktau"]),
  })
  .refine((value) => new Date(value.returnDate) >= new Date(value.flightDate), {
    message: "Дата возврата не может быть раньше вылета",
    path: ["returnDate"],
  });

export const reminderSchema = z.object({
  pilgrimIds: z.array(z.string()).min(1, "Выберите хотя бы одного паломника"),
  channel: z.enum(["whatsapp", "sms"]),
  type: z.enum(["reminder_docs", "reminder_payment", "reminder_flight", "welcome", "checklist"]),
  message: z.string().min(10, "Сообщение слишком короткое").max(1000, "Сообщение слишком длинное"),
});

export const pilgrimCreateSchema = z.object({
  fullName: z.string().min(3, "Введите ФИО паломника"),
  iin: z.string().regex(iinRegex, "ИИН должен состоять из 12 цифр"),
  phone: z.string().regex(kzPhoneRegex, "Телефон должен быть в формате +7XXXXXXXXXX"),
  dateOfBirth: z.string().min(1, "Укажите дату рождения"),
  gender: z.enum(["male", "female"], { message: "Выберите пол" }),
  email: z.string().min(1, "Введите email для входа").email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов для пароля"),
});

export const groupAssignmentSchema = z.object({
  groupId: z.string().uuid("Выберите группу"),
  pilgrimIds: z.array(z.string()).min(1, "Выберите хотя бы одного паломника"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type PilgrimCreateInput = z.infer<typeof pilgrimCreateSchema>;
export type GroupAssignmentInput = z.infer<typeof groupAssignmentSchema>;
