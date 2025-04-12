import Link from "next/link";

export default function HomeLink({ text, href }: { text: string, href: string }) {
    return (
        <Link
        href={href}
         className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            {text}
        </Link>
    );
}