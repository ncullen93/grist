export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)]  overflow-hidden">
      {/* Background image - right ~60% of viewport, inset with padding */}
      <div className="absolute bottom-10 right-8 top-0 hidden w-[60%] lg:right-10 lg:block">
        <img
          src="https://assets.historicnewengland.org/main/wp-content/uploads/2021/03/25121306/Bowman-Thumb.jpg"
          alt="Boston skyline across the water during daytime"
          className="h-full w-full rounded-md object-cover"
        />
      </div>

      {/* Text content - left side */}
      <div className="relative flex min-h-[calc(100vh-64px)] flex-col justify-between px-8 py-20 lg:w-[40%] lg:px-10 lg:py-24">
        <div>
          <div className="mb-6 flex items-center gap-3 text-sm">
            <span className="font-semibold uppercase tracking-wider text-gray-400">
              Est. 2026
            </span>
          </div>

          <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-normal text-gray-900 sm:text-5xl lg:text-4xl">
            The private club for <br />
            owners of historic homes
          </h1>
        </div>

        <div>
          <p className="max-w-sm text-[15px] leading-relaxed text-gray-600">
            Grist Club is an exclusive place for verified owners of historic
            homes to share our passion, exchange knowledge, and meet online or
            in person.
          </p>

          <div className="mt-7">
            <a
              href="#"
              className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Get involved
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
