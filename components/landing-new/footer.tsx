import { Link } from "react-router-dom";
import { Box } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold">
                                <Box className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-foreground text-lg font-mono font-bold tracking-tighter">
                                TAC
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Advanced logistics for the modern world. Connecting Imphal and New Delhi with precision and speed.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-mono font-bold text-foreground mb-6">Platform</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link to="/tracking" className="hover:text-primary transition-colors">Tracking</Link></li>
                            <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-mono font-bold text-foreground mb-6">Company</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-mono font-bold text-foreground mb-6">Legal</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-xs">
                        © {new Date().getFullYear()} Tapan Associate Cargo. All rights reserved.
                    </p>
                    <p className="text-muted-foreground text-xs font-mono">
                        System Status: <span className="text-emerald-500">OPTIMAL</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}
