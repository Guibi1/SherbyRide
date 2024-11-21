import { isServer } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { auth } from "./auth";
import type { Car, MyRide, Profile, ProfileRatings, Ride, RidePassenger } from "./types";

export async function getProfile<R extends boolean>(
    ratings?: R,
): Promise<(R extends true ? Profile & { ratings: ProfileRatings } : Profile) | null> {
    const session = isServer ? await auth() : await getSession();
    if (!session) return null;
    const token = session.accessToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile?ratings=${ratings}`, {
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
    mine?: boolean;
};

export async function getRides(options?: GetRidesOptions): Promise<Ride[] | string> {
    const session = isServer ? await auth() : await getSession();
    const searchParams = Object.entries(options ?? {})
        .map((e) => e.join("="))
        .join("&");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet?${searchParams}`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return (json as Ride[]).map((t) => ({ ...t, departureTime: new Date(t.departureTime) }));
}

export async function getMyRides(): Promise<MyRide[] | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet/me`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return (json as MyRide[]).map((t) => ({ ...t, departureTime: new Date(t.departureTime) }));
}

export async function getRide(id: string): Promise<Ride | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet/${id}`, { headers });

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/car`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return json as Car[];
}

export async function getRideRequests(ride: Ride ): Promise<Profile[] | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`http://localhost:8080/trajet/${ride.id}/passengerRequest`, { headers });

    if (!res.ok) {
        return res.statusText;
    }

    const json = await res.json();
    return json as Profile[];
}

export async function setState(ride: Ride, passenger: Profile, accepted: boolean): Promise<RidePassenger | string> {
    const session = isServer ? await auth() : await getSession();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
    const res = await fetch(`http://localhost:8080/trajet/${ride.id}/passengerRequest`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cip: passenger.cip, accepted}),
    });
    

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Erreur lors de la mise à jour de l'état : ${error}`);
    }

    const json = await res.json();
    return json as RidePassenger;
}
