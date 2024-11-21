"use client";

import NewCarDialog from "@/components/NewCarDialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCars } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import type { Car } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CarIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { toast } from "sonner";

export default function CarsList() {
    const { data: cars } = useQuery({
        queryKey: ["user-cars"],
        queryFn: getCars,
    });

    const { mutate, isPending } = useMutation({
        async mutationFn(car: Car) {
            const session = await getSession();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/car/${car.licencePlate}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        async onSuccess() {
            toast.success("Votre véhicule à été supprimé avec succès");
            await getQueryClient().refetchQueries({ queryKey: ["user-cars"] });
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    if (!cars || typeof cars === "string") return null;

    return (
        <div className="flex flex-col gap-1">
            {cars.map((car) => (
                <Popover key={car.licencePlate}>
                    <PopoverTrigger asChild>
                        <Button
                            className="relative justify-start font-normal py-1.5 pr-2 pl-8 text-sm outline-none"
                            variant="ghost"
                        >
                            <ChevronDownIcon size={12} className="stroke-muted-foreground absolute left-2" />
                            {car.model}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent>
                        <h1 className="font-semibold">{car.model}</h1>

                        <div className="flex items-end justify-between gap-4">
                            <div className="space-y-2">
                                <h2 className="text-sm text-muted-foreground">
                                    {car.year} · {car.color}
                                </h2>

                                <p className="inline-flex items-center gap-2">
                                    <CarIcon size={16} />
                                    {car.licencePlate}
                                </p>
                            </div>

                            <Button variant="destructive" onClick={() => mutate(car)} disabled={isPending}>
                                Supprimer
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            ))}

            <NewCarDialog>
                <Button
                    className="relative rounded-sm justify-start font-normal py-1.5 pr-2 pl-8 text-sm outline-none"
                    variant="ghost"
                >
                    <PlusIcon size={12} className="stroke-muted-foreground absolute left-2" />
                    Ajouter
                </Button>
            </NewCarDialog>
        </div>
    );
}
