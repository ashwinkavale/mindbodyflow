import Image from "next/image";

const workshopImages = [
  { src: "/images/workshop/workshop_image1.jpeg", alt: "Mind Body Flow workshop in progress" },
  { src: "/images/workshop/workshop_image2.jpeg", alt: "Participants practising rotational movement" },
  { src: "/images/workshop/workshop_image3.jpeg", alt: "Workshop movement practice" },
  { src: "/images/workshop/workshop_image4.jpeg", alt: "Coach demonstrating a movement pattern" },
  { src: "/images/workshop/workshop_image5.jpeg", alt: "Participants learning together at a workshop" },
];

export function Workshops() {
  return (
    <section id="workshops" className="bg-[#f2eee5] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9a6c18]">Workshops</p>
          <h2 className="display mt-4 text-4xl leading-[.98] text-[#141414] sm:text-6xl">Move, learn, and flow together.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/58">
            Practical, coach-led workshops that make rotational movement accessible, engaging, and easy to experience together.
          </p>
        </div>
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-5 md:grid-cols-4">
          {workshopImages.map((image, index) => (
            <div key={image.src} className={`group relative overflow-hidden bg-[#141414] ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-700 group-hover:scale-105" sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
