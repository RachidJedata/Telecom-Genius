"use client"
import { ThemeToggle } from "./theme-toggle"
import { Mail, Wifi } from "lucide-react"
import Link from "next/link"
import { Button } from "./UI/button"
import { Input } from "./UI/input"
import { Separator } from "./separator"
import Image from "next/image"
import IconDisplay from "./UI/iconDisplay"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-gradient-to-b from-accent to-white dark:from-gray-900 dark:to-gray-950 text-gray-700 dark:text-gray-200 pt-16 pb-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
            <div className="absolute top-0 right-12 -translate-y-1/2 hidden md:block">
                <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                    <Wifi className="w-7 h-7 text-primary" />
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent dark:bg-gray-400 flex items-center justify-center">
                                {/* <Wifi className="w-5 h-5 text-white" /> */}
                                <Image
                                    width={40}
                                    height={40}
                                    alt="logo"
                                    src="/logo.png"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-primary dark:text-primary">TelecomGenius</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Interactive telecommunications education platform designed to make complex concepts accessible through
                            simulations and comprehensive learning materials.
                        </p>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Switch Theme</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "About Us", href: "/about" },
                                { label: "Our Team", href: "/team" },
                                { label: "Contact", href: "/contact" },
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-primary/70 inline-block"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Legal</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Cookie Policy", href: "/cookies" },
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-primary/70 inline-block"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Social */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Stay Updated</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            Subscribe to our newsletter for the latest telecommunications education updates.
                        </p>

                        <div className="flex gap-2 mb-6">
                            <Input type="email" placeholder="Your email address" className="bg-white dark:bg-gray-800" />
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                                <Mail className="h-4 w-4 mr-1" />
                                <span>Subscribe</span>
                            </Button>
                        </div>

                        <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Connect With Us</h4>
                        <div className="flex gap-3">
                            {[
                                { icon: 'Twitter', href: "https://twitter.com", label: "Twitter" },
                                { icon: 'Facebook', href: "https://facebook.com", label: "Facebook" },
                                { icon: 'Instagram', href: "https://instagram.com", label: "Instagram" },
                                { icon: 'Linkedin', href: "https://linkedin.com", label: "LinkedIn" },
                            ].map((social, index) => {
                                const Icon = social.icon
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                        aria-label={social.label}
                                    >
                                        <IconDisplay iconName={social.icon} className="h-4 w-4" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <Separator className="my-8 bg-gray-200 dark:bg-gray-700" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {currentYear} TelecomGenius. All rights reserved.
                    </p>

                    <p className="text-xs text-gray-500 mr-20 dark:text-gray-400">
                        Project of Final Year PFA | ISIC
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

