import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FooterProps {
    logo: React.ReactNode
    brandName: string
    socialLinks: Array<{
        icon: React.ReactNode
        href: string
        label: string
    }>
    legalLinks: Array<{
        href: string
        label: string
    }>
    copyright: {
        text: string
        license?: string
    }
}

export function Footer({
    logo,
    brandName,
    socialLinks,
    legalLinks,
    copyright,
}: FooterProps) {
    return (
        <footer className="pb-6 lg:pb-8 lg:pt-24">
            <div className="px-4 lg:px-8">
                <div className="md:flex md:items-start md:justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-x-2"
                        aria-label={brandName}
                    >
                        {logo}
                        <span className="font-bold text-xl">{brandName}</span>
                    </Link>
                    <ul className="flex list-none mt-6 md:mt-0 space-x-3">
                        {socialLinks.map((link, i) => (
                            <li key={i}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-full text-primary"
                                    asChild
                                >
                                    <Link href={link.href} target="_blank" aria-label={link.label}>
                                        {link.icon}
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
                    <nav className="lg:mt-0 lg:col-[4/11]">
                    </nav>
                    <div className="mt-6 lg:mt-0 lg:col-[4/11]">
                        <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
                            {legalLinks.map((link, i) => (
                                <li key={i} className="my-1 mx-3 shrink-0">
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
                        <div>{copyright.text}</div>
                        {copyright.license && <div>{copyright.license}</div>}
                    </div>
                </div>
            </div>
        </footer>
    )
}
