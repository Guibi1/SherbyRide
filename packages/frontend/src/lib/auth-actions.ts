"use server";

import * as auth from "./auth";

export async function signIn() {
    await auth.signIn();
}
