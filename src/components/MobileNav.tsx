"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { contact, navItems } from "@/data/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <>
    <button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full border border-white/20 text-white"><Menu size={20} /></button>
    {open ? createPortal(<div className="fixed inset-0 z-50 bg-black/60 p-3"><div className="ml-auto flex h-full w-full max-w-sm flex-col bg-[#f2eee5] p-6 text-[#141414]">
      <div className="flex items-center justify-between"><span className="font-bold tracking-[.18em]">MIND BODY FLOW</span><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full border border-black/15"><X size={20} /></button></div>
      <nav className="mt-12 grid gap-3">{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-black/15 py-4 text-xl font-semibold">{item.label}</Link>)}</nav>
      <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="mt-auto flex h-12 items-center justify-center rounded-full bg-[#d9a441] font-bold">Talk to the coach</a>
    </div></div>, document.body) : null}
  </>;
}
