import { CircleOffIcon } from "lucide-react";

type ErrorProps = { message: string };

export default function ErrorOccured({ message }: ErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <CircleOffIcon className="h-32 w-32 text-muted-foreground mb-2" />
            <p className="text-xl font-semibold">Une erreur s'est produite</p>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
