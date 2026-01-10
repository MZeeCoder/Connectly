import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { APP_ROUTES } from "@/lib/constants";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center">
                <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    Page Not Found
                </h2>
                <p className="mb-8 text-muted-foreground">
                    The page you're looking for doesn't exist.
                </p>
                <Link href={APP_ROUTES.HOME}>
                    <Button>Go Home</Button>
                </Link>
            </div>
        </div>
    );
}
