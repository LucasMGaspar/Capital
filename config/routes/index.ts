import type { ConfigRoutes } from "@/types/routes";

export const configRoutes: ConfigRoutes = {
	publicRoutes: [
		"/",
		"/auth/login",
		"/auth/register",
		"/auth/change-password",
		"/auth/reset-password",
		"/auth/verify-email",
		"/contact",
		"/about",
		"/product",
		"/cart"
	],
	authRoutes: ["/api/auth/signin"],
	apiRoutes: ["/api/protected-api"],
	protectedRoutes: ["/auth/settings", "/auth/settings/2fa", ],
	adminRoutes: ["/admin"],
};
