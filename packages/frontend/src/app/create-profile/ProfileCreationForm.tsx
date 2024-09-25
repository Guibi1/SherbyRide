"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/auth";
import { type Faculty, faculties } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email(),
    phone: z.string().regex(/^(\+1\s?)?(\(?\d{3}\)?)[-\s.]?\d{3}[-\s.]?\d{4}$/, "Numéro invalide"),
    faculty: z.enum(faculties),
});

export default function ProfileCreationForm({ user }: { user: User }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: user.email,
            phone: "",
            faculty: "" as Faculty,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const session = await getSession();
        const res = await fetch("http://localhost:8080/profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                cip: user.cip,
                name: user.name,
                email: values.email,
                phone: values.phone,
                faculty: values.faculty,
            }),
        });

        if (res.ok) {
            router.refresh();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 container">
                <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                        <Input value={user.name} disabled />
                    </FormControl>
                    <FormDescription>Votre nom ne peut être modifié</FormDescription>
                    <FormMessage />
                </FormItem>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Courriel</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                                Vous n'êtes pas obligé de mettre votre courriel universitaire
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Numéro de téléphone</FormLabel>
                            <FormControl>
                                <Input {...field} type="tel" />
                            </FormControl>
                            <FormDescription>
                                Afin de permettre aux autres utilisateurs de vous contacter
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="faculty"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Faculté</FormLabel>
                            <FormControl>
                                <Select
                                    name={field.name}
                                    value={field.value}
                                    disabled={field.disabled}
                                    onValueChange={field.onChange}
                                    onOpenChange={field.onBlur}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {faculties.map((f) => (
                                            <SelectItem value={f} key={f}>
                                                {f}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>Dans quelle faculté étudiez-vous?</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Créer mon compte</Button>
            </form>
        </Form>
    );
}