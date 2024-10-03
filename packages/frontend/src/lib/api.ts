import { isServer } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { string } from "zod";
import { auth } from "./auth";
import type { Profile, Trajet } from "./types";

export async function getProfile() {
    const session = isServer ? await auth() : await getSession();
    if (!session) return null;
    const token = session.accessToken;

    const res = await fetch("http://localhost:8080/profile", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
        console.error("Couldn't get profile", res.status);
        return null;
    }

    const json = await res.json();
    return json as Profile;
}

export type GetRidesOptions = {
    from?: string;
    to?: string;
    date?: Date;
    passengers?: number;
};

export async function getRides(options?: GetRidesOptions): Promise<Trajet[]> {
    const session = isServer ? await auth() : await getSession();
    const searchParams = Object.entries(options ?? {})
        .map((e) => e.join("="))
        .join("&");
    console.log("🚀 ~ getRides ~ searchParams:", searchParams);

    const res = await fetch(`http://localhost:8080/trajet?${searchParams}`, {
        headers: { Authorization: session ? `Bearer ${session.accessToken}` : "", "Content-Type": "application/json" },
    });

    if (!res.ok) {
        console.error("Couldn't get rides", res.status);
        return [];
    }

    const json = await res.json();
    return (json as Trajet[]).map((t) => ({ ...t, departureTime: new Date(t.departureTime) }));
}
