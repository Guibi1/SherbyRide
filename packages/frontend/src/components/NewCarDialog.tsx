"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQueryClient } from "@/lib/query";
import { colors, vehiculeTypes } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    licencePlate: z.string().max(6, "Plaque d'immatriculation invalide"),
    type: z.enum(vehiculeTypes),
    model: z.string(),
    year: z.coerce.number().min(1970, "Année invalide").max(2040, "Année invalide"),
    color: z.enum(colors),
});

type NewCarDialogProps = { open?: boolean; setOpen?: (open: boolean) => void; children?: ReactNode };

export default function NewCarDialog({ children, ...props }: NewCarDialogProps) {
    const [open, setOpen] = useState(props.open);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { mutate, isPending } = useMutation({
        async mutationFn(values: z.infer<typeof formSchema>) {
            const session = await getSession();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/car`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        async onSuccess() {
            toast.success("Votre véhicule à été créé avec succès");
            await getQueryClient().refetchQueries({ queryKey: ["user-cars"] });
            setOpen(false);
            props.setOpen?.(false);
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    return (
      <Dialog open={props.open ?? open} onOpenChange={(s) => { setOpen(s); props.setOpen?.(s); }}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nouveau véhicule</DialogTitle>
                    <DialogDescription>Ajoutez un véhicule à votre compte</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutate(v))} className="flex-1 flex flex-col gap-8">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
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
                                                {vehiculeTypes.map((f) => (
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

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modèle</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
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
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Couleur</FormLabel>
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
                                                {colors.map((f) => (
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

                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Année</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" />
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
                            name="licencePlate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plaque d'immatriculation</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>
                                        Vous n'êtes pas obligé de mettre votre courriel universitaire
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending}>
                            Sauvegarder
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
