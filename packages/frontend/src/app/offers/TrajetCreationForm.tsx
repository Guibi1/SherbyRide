"use client";

import NewCarDialog from "@/components/NewCarDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getCars } from "@/lib/api";
import type { User } from "@/lib/auth";
import type { Ride } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, ClockIcon, PlusIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    from: z.string().max(50),
    to: z.string().max(50),
    date: z.date(),
    car: z.string().max(6),
    passengers: z.coerce.number().min(1),
});

export default function TrajetCreationForm({ user }: { user: User }) {
    const [newCarDialogOpen, setNewCarDialogOpen] = useState(false);
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            from: "",
            to: "",
            passengers: 0,
        },
    });

    const { data: cars } = useQuery({
        queryKey: ["user-cars"],
        queryFn: getCars,
    });
    if (!cars || typeof cars === "string") return null;

    const { mutate, isPending } = useMutation({
        async mutationFn(values: z.infer<typeof formSchema>) {
            const session = await getSession();
            const res = await fetch("http://localhost:8080/trajet", {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    driver: user.cip,
                    departureLoc: values.from,
                    arrivalLoc: values.to,
                    departureTime: values.date,
                    maxPassengers: values.passengers,
                    licencePlate: values.car,
                }),
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
            return (await res.json()) as Ride;
        },
        onSuccess(ride) {
            toast.success("Votre offre de trajet à été sauvegardé avec succès");
            router.push(`/rides/${ride.id}`);
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    return (
        <>
            <NewCarDialog open={newCarDialogOpen} setOpen={setNewCarDialogOpen} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => mutate(v))} className="flex flex-col gap-8 container">
                    <FormField
                        control={form.control}
                        name="from"
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
                        name="to"
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
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de départ</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className="pl-3 text-left font-normal">
                                                {field.value?.toLocaleString(undefined, {
                                                    dateStyle: "long",
                                                    timeStyle: "short",
                                                })}

                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-muted-foreground" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto h-min p-0 flex flex-col" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date <= new Date()}
                                        />

                                        <div className="px-6 py-2">
                                            <Separator orientation="horizontal" />
                                        </div>

                                        <div className="p-4 overflow-hidden">
                                            <div className="flex items-center justify-center gap-2 text-lg">
                                                <ClockIcon className="h-6 w-6 mr-2" />
                                                <Input
                                                    {...field}
                                                    value={(field.value?.getHours() ?? 0).toString()}
                                                    onChange={(e) => {
                                                        if (e.target.value === "") e.target.value = "0";
                                                        const hours = +e.target.value;
                                                        if (hours < 0 || hours > 23) return;
                                                        const date = new Date(field.value);
                                                        date.setHours(hours);
                                                        field.onChange(date);
                                                    }}
                                                    disabled={!field.value}
                                                    className="w-14 text-center"
                                                />
                                                :
                                                <Input
                                                    {...field}
                                                    value={(field.value?.getMinutes() ?? 0).toString()}
                                                    onChange={(e) => {
                                                        if (e.target.value === "") e.target.value = "0";
                                                        const minutes = +e.target.value;
                                                        if (minutes < 0 || minutes > 59) return;
                                                        const date = new Date(field.value);
                                                        date.setMinutes(minutes);
                                                        field.onChange(date);
                                                    }}
                                                    disabled={!field.value}
                                                    className="w-14 text-center"
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="car"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Véhicule</FormLabel>
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
                                            {cars.map((car) => (
                                                <SelectItem value={car.licencePlate} key={car.licencePlate}>
                                                    {car.model}
                                                </SelectItem>
                                            ))}

                                            <SelectSeparator />

                                            <Button
                                                className="w-full flex justify-start gap-2 font-normal select-none rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none"
                                                variant="ghost"
                                                onClick={() => setNewCarDialogOpen(true)}
                                            >
                                                <PlusIcon size={16} /> Ajouter une voiture
                                            </Button>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="passengers"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passagers</FormLabel>
                                <FormControl>
                                    <Select
                                        name={field.name}
                                        value={field.value.toString()}
                                        disabled={field.disabled}
                                        onValueChange={field.onChange}
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
                                <FormDescription>Combien de passagers voulez-vous transporter?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isPending}>
                        Publier l'offre
                    </Button>
                </form>
            </Form>
        </>
    );
}
