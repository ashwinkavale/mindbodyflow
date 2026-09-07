import { Play, Video } from "lucide-react";
import { contact } from "@/data/site";

const topics = ["Movement demonstrations", "Rotational training", "Workshop moments"];

export function TestimonialsVideos() {
  return (
    <section id="testimonials" className="bg-[#fbfaf7] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a6c18]">Testimonials & videos</p>
          <h2 className="display mt-4 text-4xl leading-[.98] text-[#141414] sm:text-6xl">See the practice in motion.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/58">
            Explore Amit’s personal YouTube channel for fitness videos, movement demonstrations, workshop moments, and training ideas from the Mind Body Flow practice.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {topics.map((title, index) => (
            <a key={title} href={contact.youtube} target="_blank" rel="noreferrer" className="group border border-black/10 bg-[#f2eee5] p-6 transition hover:-translate-y-1 hover:border-[#d9a441]">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-[#141414] text-[#d9a441]"><Play size={19} fill="currentColor" /></span>
                <span className="text-xs font-bold text-black/35">0{index + 1}</span>
              </div>
              <h3 className="mt-16 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/55">Watch on Amit Kavale’s YouTube channel.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#9a6c18] group-hover:text-[#141414]"><Video size={15} /> Open channel</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
