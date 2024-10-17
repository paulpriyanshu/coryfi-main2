"use client";
import {
    IconBrandTabler,
    IconHome,
    IconSettings,
    IconUserBolt
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

interface LinkItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export default function Page({ children }: { children: React.ReactNode }) {
    const links: LinkItem[] = [
        {
            label: "Home",
            href: "/",
            icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Profile",
            href: "/profile",
            icon: <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
    ];

    const [open, setOpen] = useState(false);

    return (
        <div className="h-screen w-screen flex overflow-hidden bg-gray-100 dark:bg-neutral-900">
            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="flex flex-col h-full justify-between bg-slate-200" >
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 border-t border-neutral-200 dark:border-neutral-700">
                        <Image
                            src="/images/me.png"
                            className="h-8 w-8 rounded-full"
                            width={32}
                            height={32}
                            alt="Avatar"
                        />
                        {open && (
                            <div className="text-sm text-neutral-700 dark:text-neutral-300">
                                Dana Davis
                            </div>
                        )}
                    </div>
                  
                    <ThemeToggle/>
                </SidebarBody>
            </Sidebar>
            <main className="flex-1 overflow-auto py-2 sm:py-4 md:py-8">
                <div className="w-full px-2 sm:px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

