import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { APP_NAME, APP_ROUTES } from "@/lib/constants";

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Hero Section */}
            <main className="flex-1">
                <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-20">
                    <div className="text-center">
                        <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground">
                            Welcome to{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {APP_NAME}
                            </span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                            Connect with people around the world. Share your moments, send
                            messages, and build meaningful connections.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={APP_ROUTES.REGISTER}>
                                <Button size="lg" className="w-full sm:w-auto">
                                    Get Started
                                </Button>
                            </Link>
                            <Link href={APP_ROUTES.LOGIN}>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                Connect
                            </h3>
                            <p className="text-muted-foreground">
                                Build your network and connect with people who share your interests.
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                Message
                            </h3>
                            <p className="text-muted-foreground">
                                Send instant messages and stay connected with your friends.
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-white"
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                Share
                            </h3>
                            <p className="text-muted-foreground">
                                Share your moments with photos, videos, and updates.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
