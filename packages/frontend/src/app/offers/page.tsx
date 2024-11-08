import ErrorOccured from "@/components/ErrorOccured";
import { getCars } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import TrajetCreationForm from "./TrajetCreationForm";

export default async function OffersPage() {
    const session = await auth();
    if (!session) notFound();

    const cars = await getCars();
    if (typeof cars === "string") {
        return (
            <main className="container my-8">
                <ErrorOccured message={cars} />
            </main>
        );
    }

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["user-cars"],
        initialData: cars,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="container mx-auto px-4 py-8">
                <TrajetCreationForm user={session.user} />
            </div>
        </HydrationBoundary>
    );
}
