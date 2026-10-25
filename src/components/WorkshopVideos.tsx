const channelUrl = "https://www.youtube.com/@amitkavale2466";
const shortsUrl = "https://www.youtube.com/@amitkavale2466/shorts";
const shortVideoIds = "uFeVtUAipNg d98orGEeqcw Nsnd79-iZRA 1hZdTMPv9uQ 61bEp-AjCPk dxqMXCkKLDs hUr-BItt4f0 2C-WSvvIKj4 Zix4ECZETX8 uKo8jJ9D9Q4 Ty6jPeg57Us J3TSqbNW22U XJePJ03136Y Ek6CcUP2Fhk cij-El55EfE 43lRA41xXdk Wr10WpwSbzQ b0Oh2fcNp70 9sp7cIp8Jjk KSqPDWZSRHM F-DNQh8Ajrw suJbw4jCZZU eW3rycHv9L8 ZqQhcitEIqA zS7KzCRu8zY 4XBrN7QEWqU ou4YPhXZJds vrCnjNd88vA h9IphdJDM88 v2i4G4gwU8A Ui6A7OevFH8 lFvqNmlUTrE aymEQoUjbhw zQUGuq8f3DY D6QeaThGdg8 w_nH2VSyreg n6v7F9b34o l3_Khqn3sO0 LxE0gVQOc20 EU706RqC6FQ wvY7cVEFci4 fc-BNcNc0v0 PMQUjKSkXdU tVvn2E9bdPs U58huASKwlU xACPdAdwkKk pNWg8ahDWx8 8z68Du2UUzw".split(" ");

export function WorkshopVideos() {
  return (
    <section id="workshop-videos" className="bg-[#141414] px-5 py-20 text-white lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#d9a441]">Workshop videos</p>
            <h2 className="display mt-4 text-4xl leading-[.98] sm:text-6xl">See the movement in action.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
              Explore workshop demonstrations, movement lessons, and training Shorts from Amit Kavale.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={shortsUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-[#d9a441] px-6 text-sm font-bold text-[#141414] transition hover:bg-[#e8b858]">
              View all Shorts
            </a>
            <a href={channelUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10">
              Visit the channel
            </a>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {shortVideoIds.map((videoId, index) => (
            <div key={videoId} className="overflow-hidden border border-white/10 bg-black">
              <div className="aspect-[9/16]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Amit Kavale workshop Short ${index + 1}`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
