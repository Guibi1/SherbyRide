"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Profile, faculties } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.string().email(),
    phone: z.string().regex(/^(\+1\s?)?(\(?\d{3}\)?)[-\s.]?\d{3}[-\s.]?\d{4}$/, "Numéro invalide"),
    faculty: z.enum(faculties),
});

export default function ProfileCreationForm({ profile }: { profile: Profile }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: profile,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const session = await getSession();
        const res = await fetch("http://localhost:8080/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                cip: profile.cip,
                name: profile.name,
                email: values.email,
                phone: values.phone,
                faculty: values.faculty,
            }),
        });

        if (res.ok) {
            toast("Votre profil a été sauvegardé avec succès !");
            router.refresh();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 container">
                <div className="flex justify-center">
                    <Avatar className="w-24 h-24">
                        {/* <AvatarImage src={user.image!} alt={user.name!} /> */}
                        <AvatarFallback>
                            {profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <FormItem>
                    <FormLabel>Cip</FormLabel>
                    <FormControl>
                        <Input value={profile.cip} disabled />
                    </FormControl>
                </FormItem>

                <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                        <Input value={profile.name} disabled />
                    </FormControl>
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

                <Button type="submit">Sauvegarder</Button>
            </form>
        </Form>
    );
}
