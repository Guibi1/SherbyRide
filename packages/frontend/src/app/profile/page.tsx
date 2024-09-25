import { auth } from "@/lib/auth";
import Form from "./form";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) notFound();

    return (
        <>
            <Form user={session?.user} />
        </>
    );
}
