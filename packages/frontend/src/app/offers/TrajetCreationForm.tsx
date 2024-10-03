"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    depart: z.string().max(50),
    arrive: z.string().max(50),
    date: z.string(),
    passagers: z.number().min(1),
});

export default function TrajetCreationForm({ user }: { user: User }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            depart: "",
            arrive: "",
            date: "",
            passagers: 0,
        },
    });

    const { mutate, isPending } = useMutation({
        async mutationFn(values: z.infer<typeof formSchema>) {
            const session = await getSession();
            const res = await fetch("http://localhost:8080/trajet", {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    driver: user.cip,
                    departureLoc: values.depart,
                    arrivalLoc: values.arrive,
                    departureTime: values.date,
                    maxPassagers: values.passagers,
                }),
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        onSuccess() {
            toast.success("Votre offre de trajet à été sauvegardé avec succès");
            router.refresh();
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="flex flex-col gap-8 container">
                <FormField
                    control={form.control}
                    name="depart"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lieu de départ</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="arrive"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date de départ</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="datetime-local"
                                    min={`${new Date().toISOString().slice(0, 15)}5`}
                                    step="300"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="passagers"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Combien de passagers pouvez-vous apporter?</FormLabel>
                            <FormControl>
                                <Select
                                    name={field.name}
                                    value={field.value.toString()}
                                    disabled={field.disabled}
                                    onValueChange={(v) => field.onChange(+v)}
                                    onOpenChange={field.onBlur}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="6">6</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    Publier l'offre
                </Button>
            </form>
        </Form>
    );
}
