"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GetRidesOptions } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    from: z.string().max(50).optional(),
    to: z.string().max(50).optional(),
    date: z.date().optional(),
    passengers: z.number().optional(),
});

export default function RideFilter({ initial }: { initial: GetRidesOptions }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            from: initial.from ?? "",
            to: initial.to ?? "",
            passengers: +(initial.passengers ?? 0),
        },
    });

    useEffect(() => {
        if (initial.date) form.setValue("date", new Date(initial.date));
    }, [initial.date, form.setValue]);

    const submit = (values: z.infer<typeof formSchema>) => {
        const a = new URLSearchParams();

        if (values.from) {
            a.append("from", values.from);
        }
        if (values.to) {
            a.append("to", values.to);
        }
        if (values.date) {
            a.append("date", values.date.toISOString());
        }
        if (values.passengers) {
            a.append("passengers", values.passengers.toString());
        }

        router.push(`/rides?${a.toString()}`);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lieu de départ</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-background" />
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
                                <Input {...field} className="bg-background" />
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
                                            {field.value?.toLocaleDateString("fr-CA", { dateStyle: "long" })}

                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-muted-foreground" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(e) => field.onChange(e)}
                                        disabled={(date) => date <= new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="passengers"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de passagers</FormLabel>
                            <FormControl>
                                <Select
                                    name={field.name}
                                    value={field.value?.toString()}
                                    disabled={field.disabled}
                                    onValueChange={(v) => field.onChange(+v)}
                                    onOpenChange={field.onBlur}
                                >
                                    <SelectTrigger className="bg-background">
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

                <Button type="submit">Chercher</Button>
            </form>
        </Form>
    );
}
