"use client";

import { changeSettings } from "@/actions/auth/settings";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserSettingsSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import AuthFormMessage from "./auth-form-message";
import { User } from "next-auth";
import { useRouter } from "next/navigation";

interface Props {
  user?: User;
}

export default function UserSettingsForm({ user }: Props) {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const router = useRouter();

  const form = useForm<z.infer<typeof UserSettingsSchema>>({
    resolver: zodResolver(UserSettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof UserSettingsSchema>) => {
    startTransition(async () => {
      try {
        const resp = await changeSettings(values);
        const { success, error, user: updatedUser } = resp;
        if (!resp) {
          setError("Invalid server response.");
          setSuccess("");
          form.reset();
          return;
        }

        if (error) {
          setError(error);
          setSuccess("");
          return;
        }

        if (success && updatedUser) {
          setSuccess(success);
          setError("");

          // Atualiza a sessão com os novos dados do usuário
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUser.name,
              email: updatedUser.email,
            },
          });

          // Revalida a sessão chamando signIn com redirect: false
          await signIn("credentials", {
            redirect: false,
            email: updatedUser.email,
            password: values.password, // Passa a senha original para revalidar
		  });
			
		  router.refresh();
        }
      } catch (error) {
        setSuccess("");
        setError("Something went wrong.");
        form.reset();
      }
    });
  };

  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Change user information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          type="name"
                          placeholder="João da Silva"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription className="hidden">Your Name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@provider.com" {...field} disabled />
                      </FormControl>
                      <FormDescription className="hidden">Your e-mail.</FormDescription>
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
                        <Input type="password" placeholder="******" {...field} disabled={isPending} />
                      </FormControl>
                      <FormDescription className="hidden">Your password.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} disabled={isPending} />
                      </FormControl>
                      <FormDescription className="hidden">Your new password.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPasswordConfirmed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} disabled={isPending} />
                      </FormControl>
                      <FormDescription className="hidden">Confirm your new password.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <AuthFormMessage type="error" message={error} title="Erro" />}
                {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}
                <div className="w-full flex justify-end items-center">
                  <Button variant={"default"} disabled={isPending}>
                    <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
                    <span>Save</span>
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Home
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
