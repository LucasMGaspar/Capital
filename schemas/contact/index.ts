import { z } from "zod";

export const ContactSchema = z.object({
	name: z.string().min(3),
	email: z.string().email(),
    subject: z.string(),
    message: z.string().min(5)
});