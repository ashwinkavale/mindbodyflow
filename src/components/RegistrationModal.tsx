'use client';

import { FormEvent, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

export function RegistrationModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function close() {
    setOpen(false);
    setSubmitted(false);
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#141414] px-6 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[#141414] hover:text-white">Register for 1:1 coaching <ArrowUpRight size={17} /></button>
    {open && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#141414]/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="registration-title" className="max-h-[min(760px,calc(100vh-2rem))] w-full max-w-xl overflow-y-auto bg-[#fbfaf7] p-6 shadow-2xl sm:p-9">
        <div className="flex items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a6c18]">Start your journey</p><h2 id="registration-title" className="display mt-3 text-4xl">1:1 personal coaching</h2><p className="mt-3 text-sm leading-6 text-black/60">Share a few details and Amit will help you find the right starting point.</p></div><button type="button" onClick={close} aria-label="Close registration form" className="rounded-full border border-black/15 p-2 hover:bg-black/5"><X size={18} /></button></div>
        {submitted ? <div className="mt-8 border-t border-black/10 pt-6"><p className="text-lg font-semibold">Thanks for registering your interest.</p><p className="mt-2 text-sm leading-6 text-black/60">Your details are ready for the next connection step. Payment gateway integration can be added once the provider is selected.</p><button type="button" onClick={close} className="mt-6 rounded-full bg-[#d9a441] px-5 py-3 text-sm font-bold hover:bg-[#e8b858]">Close</button></div> : <form onSubmit={handleSubmit} className="mt-8 grid gap-4 border-t border-black/10 pt-6"><label className="grid gap-2 text-sm font-semibold">Name<input required name="name" className="h-12 border border-black/15 bg-white px-4 font-normal outline-none focus:border-[#9a6c18]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Age<input required name="age" type="number" min="13" max="100" className="h-12 border border-black/15 bg-white px-4 font-normal outline-none focus:border-[#9a6c18]" /></label><label className="grid gap-2 text-sm font-semibold">Phone<input required name="phone" type="tel" className="h-12 border border-black/15 bg-white px-4 font-normal outline-none focus:border-[#9a6c18]" /></label></div><label className="grid gap-2 text-sm font-semibold">Email<input required name="email" type="email" className="h-12 border border-black/15 bg-white px-4 font-normal outline-none focus:border-[#9a6c18]" /></label><label className="grid gap-2 text-sm font-semibold">What would you like to work on?<textarea required name="goal" rows={4} className="resize-none border border-black/15 bg-white p-4 font-normal outline-none focus:border-[#9a6c18]" /></label><p className="text-xs leading-5 text-black/50">This form captures your interest. Payment will be connected after the payment provider is confirmed.</p><button type="submit" className="inline-flex h-12 items-center justify-center rounded-full bg-[#d9a441] px-6 text-sm font-bold hover:bg-[#e8b858]">Submit registration interest</button></form>}
      </section>
    </div>}
  </>;
}
