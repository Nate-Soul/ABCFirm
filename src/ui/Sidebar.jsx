"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {

    const currentUrl = usePathname();

    const links = [
        {
            url: "/",
            text: "Home",
            icon: "bi-house"
        },
        {
            url: "/files",
            text: "All Files",
            icon: "bi-folder"
        },
        {
            url: "/saved",
            text: "Saved",
            icon: "bi-bookmark"
        },
        {
            url: "/integrations",
            text: "Integrations",
            icon: "bi-share"
        },
        {
            url: "/settings",
            text: "Settings",
            icon: "bi-gear"
        },
        {
            url: "/integrations",
            text: "Help and Support",
            icon: "bi-question-circle"
        },
    ];

  return (
    <aside className="col-span-3 flex flex-col justify-between py-4 px-8 min-h-full">
        <section>
            <h1 className="text-blue-500 mb-8 font-bold">Transcibaar</h1>
            <ul className="flex flex-col gap-3">
                {links && links.map((link, index) => (
                <li key={index} className={`${link.url == currentUrl ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"} py-2 px-3 rounded-lg`}>
                    <Link 
                        href={link.url} 
                        className={`inline-flex gap-3 items-center`}
                    >
                        <span className={link.icon}></span>
                        {link.text}
                    </Link>
                </li>
                ))}
            </ul>
        </section>
        <section className="bg-blue-100 rounded-lg p-5 flex flex-col gap-4 text-center">
            <span className="bi-rocket transform text-xl rotate-45 text-blue-700"></span>
            <h6 className="font-semibold">Upgrade Account</h6>
            <p>Get access to unlimited transcriptions</p>
            <button className="w-full bg-blue-700 px-3 py-2 rounded-lg text-white">
                Upgrade
            </button>
        </section>
    </aside>
  )
}

export default Sidebar
