import { isServer } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { auth, signOut } from "./auth";
import type { Profile } from "./types";

export async function getProfile() {
    const session = isServer ? await auth() : await getSession();
    if (!session) return null;
    const token = session?.accessToken;

    const res = await fetch("http://localhost:8080/profile", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
        if (isServer && res.status === 404) await signOut();
        console.error("Couldn't get profile", res.status);
        return null;
    }

    const json = await res.json();
    return json as Profile;
}
