import { z } from "zod";

export const CredentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
	name: z.string().min(5),
	email: z.string().email(),
	password: z.string().min(6),
});
// .refine(
//   (values) => {
//     console.log(`Values ${JSON.stringify(values)}`);
//     return values.password === values.matchPassword;
//   },
//   {
//     message: "Passwords must match!",
//     path: ["confirmPassword"],
//   }
// );

export const UserSettingsSchema = z
	.object({
		name: z.optional(z.string().min(5, {
			message: 'The name must contain at least 5 characters.'
		})),
		email: z.optional(z.string().email()),
		password: z.optional(z.string().min(6, {
			message: 'The password must contain at least 6 characters.'
		})),
		newPassword: z.optional(z.string().min(6, {
			message: 'The new password must contain at least 6 characters.'
		})),
		newPasswordConfirmed: z.optional(z.string().min(6, {
			message: "Passwords don't match."
		})),
		isTwoFactorAuthEnabled: z.optional(z.boolean()),
	})
	.refine(
		(values) => {
			if (values.password && !values.newPassword) return false;
			return true;
		},
		{
			message: "New password required.",
			path: ["newPassword"],
		},
	)
	.refine(
		(values) => {
			if (values.password && values.newPassword && values.newPassword !== values.newPasswordConfirmed) return false;
			return true;
		},
		{
			message: "Passwords don't match.",
			path: ["newPasswordConfirmed"],
		},
	)
	.refine(
		(values) => {
			if (values.newPassword && !values.password) return false;
			return true;
		},
		{
			message: "Password required.",
			path: ["password"],
		},
);
	

export const UserSettings2FASchema = z
	.object({
		isTwoFactorAuthEnabled: z.optional(z.boolean()),
	})


export const ResetPasswordSchema = z.object({
	email: z.string().email(),
});

export const NewPasswordSchema = z.object({
	password: z.string().min(6),
});

export const MagicLinkSignInSchema = z.object({
	email: z.string().email(),
});


