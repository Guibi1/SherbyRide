import { isServer } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { auth } from "./auth";

export async function fetchUserInfo() {
    const session = isServer ? await auth() : await getSession();
    console.log("🚀 ~ fetchUserInfo ~ session:", session?.user.cip);

    const token = session?.accessToken;
    console.log("🚀 ~ fetchUserInfo ~ token:", token);

    const res = await fetch("http://localhost:8080/hello", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
        const json = await res.text();
        console.log("🚀 ~ fetchUserInfo ~ json:", json);
    } else {
        console.log("FETCH NOT OK");
    }
}
