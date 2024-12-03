"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getMyRides, getProfile } from "@/lib/api";
import type { MyRide } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { getSession } from "next-auth/react";
import { type ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    evaluator: z.string(),
    evaluated: z.string(),
    ride: z.number(),
    note: z.number().min(0).max(5),
});

type NewRatingDialogProps = { ride: MyRide; children?: ReactNode };

export default function NewRatingDialog({ children, ride }: NewRatingDialogProps) {
    const { data: user } = useQuery({
        queryKey: ["user-profile"],
        queryFn: () => getProfile(false),
    });

    const { refetch } = useQuery({
        queryKey: ["my-rides"],
        queryFn: getMyRides,
    });

    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            evaluator: user?.cip || "",
            evaluated: ride.driver?.cip || " ",
            ride: ride.id,
            note: 0,
        },
    });

    const { mutate, isPending } = useMutation({
        async mutationFn(values: z.infer<typeof formSchema>) {
            const session = await getSession();
            const res = await fetch(`http://localhost:8080/profile/${ride.driver?.cip}/rating`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        async onSuccess() {
            toast.success("Votre véhicule à été créé avec succès");
            refetch();
            setOpen(false);
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    const now = useMemo(() => new Date(), []);
    if (ride.rated || ride.departureTime >= now) return null;

    return (
        <Dialog open={open} onOpenChange={(s) => setOpen(s)}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Noter le conducteur</DialogTitle>
                    <DialogDescription>Évaluez votre expérience globale</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutate(v))} className="flex-1 flex flex-col gap-8">
                        <FormItem>
                            <FormLabel>Nom du conducteur</FormLabel>
                            <Input value={ride.driver?.name} disabled />
                        </FormItem>

                        {/* Note */}
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((etoile) => (
                                            <Star
                                                key={etoile}
                                                className={`h-8 w-8 cursor-pointer ${
                                                    etoile <= field.value
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                                onClick={() => field.onChange(etoile)} ///changer setNote
                                            />
                                        ))}
                                    </div>
                                    <FormDescription>Donnez une note entre 1 et 5</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 flex justify-end space-x-4">
                            <Button type="submit" disabled={isPending}>
                                Soumettre
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
