"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "next-auth";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Form({ user }: { user: User }) {
    const [phone, setPhone] = useState("");

    const handleSave = async () => {
        const session = await getSession();
        const res = await fetch("http://localhost:8080/profile", {
            method: "PUT",
            headers: { Authorization: `Bearer ${session?.accessToken}` },
            body: JSON.stringify({ cip: session?.user.cip, nom: user.name, email: user.email, phone }),
        });

        console.log("Profile saved:", { user: user.name, email: user.email, phone });
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={user.image!} alt={user.name!} />
                        <AvatarFallback>
                            {user
                                .name!.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" value={user.name!} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Courriel</Label>
                    <Input id="email" value={user.email!} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSave}>
                    Sauvegarder les changements
                </Button>
            </CardFooter>
        </Card>
    );
}
