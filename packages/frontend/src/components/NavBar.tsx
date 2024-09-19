import { auth, signIn, signOut } from "@/lib/auth";
import { CarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default async function NavBar() {
    const session = await auth();

    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b">
            <Link className="flex items-center justify-center" href="/">
                <CarIcon className="h-6 w-6" />
                <span className="ml-2 text-lg font-semibold">SherbyRide</span>
            </Link>

            {session ? (
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <Button type="submit">Log out</Button>
                </form>
            ) : (
                <form
                    action={async () => {
                        "use server";
                        await signIn("keycloak");
                    }}
                >
                    <Button type="submit">Login</Button>
                </form>
            )}

            <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="/rides" className="text-sm font-medium hover:underline underline-offset-4">
                    Find a Ride
                </Link>

                <Link href="" className="text-sm font-medium hover:underline underline-offset-4">
                    Offer a Ride
                </Link>

                <Link href="" className="text-sm font-medium hover:underline underline-offset-4">
                    How It Works
                </Link>
            </nav>
        </header>
    );
}
