import { isServer } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { auth } from "./auth";
import type { Car, Profile, ProfileRatings, Ride } from "./types";

export async function getProfile<R extends boolean>(
    ratings?: R,
): Promise<(R extends true ? Profile & { ratings: ProfileRatings } : Profile) | null> {
    const session = isServer ? await auth() : await getSession();
    if (!session) return null;
    const token = session.accessToken;

    const res = await fetch(`http://localhost:8080/profile?ratings=${ratings}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
        console.error("Couldn't get profile", res.status);
        return null;
    }

    const json = await res.json();
    if (ratings) {
        return { ...json.profile, ratings: json.ratings };
    }
    return json;
}

export type GetRidesOptions = {
    from?: string;
    to?: string;
    date?: Date;
    passengers?: number;
};

export async function getRides(options?: GetRidesOptions): Promise<Ride[] | string> {
    const session = isServer ? await auth() : await getSession();
    const searchParams = Object.entries(options ?? {})
        .map((e) => e.join("="))
        .join("&");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`http://localhost:8080/trajet?${searchParams}`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return (json as Ride[]).map((t) => ({ ...t, departureTime: new Date(t.departureTime) }));
}

export async function getRide(id: string): Promise<Ride | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`http://localhost:8080/trajet/${id}`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return { ...json, departureTime: new Date(json.departureTime) } as Ride;
}

export async function getCars(): Promise<Car[] | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch("http://localhost:8080/car", { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return json as Car;
}
