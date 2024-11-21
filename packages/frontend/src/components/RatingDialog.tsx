"use client"

import { ReactNode, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession } from "next-auth/react";
import { getQueryClient } from "@/lib/query";
import { toast } from "sonner";



const formSchema = z.object({
  name: z.string(),
  note: z.array(z.number().min(0).max(5)),
  submit: z.boolean()
});

type NewRatingDialogProps = { open?: boolean; setOpen?: (open: boolean) => void; children?: ReactNode };

export default function NewRatingDialog({ children, ...props }: NewRatingDialogProps) {
  const [open, setOpen] = useState(props.open);
  const [note, setNote] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
  });

  const { mutate, isPending } = useMutation({
      async mutationFn(values: z.infer<typeof formSchema>) {
          const session = await getSession();
          const res = await fetch("http://localhost:8080/{cip}/rating", {
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

  return(
    <Dialog open={open} onOpenChange={(s) => setOpen(s)}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Noter le conducteur</DialogTitle>
          <DialogDescription>Évaluez votre expérience globale</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className= "flex-1 flex flex-col gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du conducteur</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      type="text"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                          etoile <= note ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setNote(etoile)}
                      />
                    ))}
                  </div>
                  <FormDescription>Donnez une note entre 1 et 5</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-4">
              <Button type="submit" disabled={isPending}>
                  Soumettre
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  );

}
