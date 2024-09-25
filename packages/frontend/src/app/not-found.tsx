import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PageNotFound() {
    return (
        <main className="flex flex-col justify-center items-center flex-1 gap-2">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Page introuvable</h1>
            <h2 className="scroll-m-20 text-xl tracking-tight pb-4">Vérifiez l'url ou réessayez à nouveau</h2>

            <Button asChild>
                <Link href="/">Retourner à l'accueil</Link>
            </Button>
        </main>
    );
}
