"use client"

import AuthFormMessage from "@/components/auth/auth-form-message"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sendEmail } from "@/lib/resend"
import { ContactSchema } from "@/schemas/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function FormContact() {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ContactSchema>>({
        resolver: zodResolver(ContactSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: 'Suppliers',
            message: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof ContactSchema>) => {
        startTransition(async () => {
            try {
                sendEmail(values);
                form.reset();
            } catch (err) {
                form.reset();
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 m-auto mt-5 mb-12 w-full bg-slate-50 p-8 rounded-lg xl:w-96">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="Name" type="text" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="email@example.com" type="email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subjects</FormLabel>
                                <FormControl>
                                    <select className="block w-full border p-2" {...field} disabled={isPending}>
                                        <option value="Suppliers">Suppliers</option>
                                        <option value="Compliments">Compliments</option>
                                        <option value="Work with us">Work with us</option>
                                        <option value="Complaint">Complaint</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Write your message here..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button variant={"default"} className="w-full" disabled={isPending}>
                    <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
                    <span>Submit</span>
                </Button>
            </form>
        </Form>
    )
}
