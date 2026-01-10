import { APP_NAME } from "@/lib/constants";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="mb-3 text-lg font-bold text-foreground">{APP_NAME}</h3>
                        <p className="text-sm text-muted-foreground">
                            Connect with people around the world. Share moments, messages, and
                            more.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Terms
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-border pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
