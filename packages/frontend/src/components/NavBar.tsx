import { getProfile } from "@/lib/api";
import { auth, signIn, signOut } from "@/lib/auth";
import { CarIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function NavBar() {
    const user = (await auth())?.user;
    const profile = await getProfile();

    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b gap-8 border-primary sticky bg-background top-0 z-50">
            <Link className="flex items-center justify-center" href="/">
                <CarIcon className="h-6 w-6" />
                <span className="ml-2 text-lg font-semibold">SherbyRide</span>
            </Link>

            <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="/rides" className="text-sm font-medium hover:underline underline-offset-4">
                    Trouve un déplacement
                </Link>

                <Link href="/offers" className="text-sm font-medium hover:underline underline-offset-4">
                    Offre un déplacement
                </Link>
            </nav>

            {user && profile ? (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="border">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>{user.name.at(0)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuLabel>
                            {user.name}
                            <div className="text-muted-foreground font-light text-sm">{profile.email}</div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">Mon profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/rides">Mes rides</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                        >
                            <DropdownMenuItem className="text-destructive w-full" asChild>
                                <button type="submit">Se déconnecter</button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <form
                    action={async () => {
                        "use server";
                        await signIn("keycloak", { redirectTo: "/create-profile" });
                    }}
                >
                    <Button type="submit">Connexion</Button>
                </form>
            )}
        </header>
    );
}
