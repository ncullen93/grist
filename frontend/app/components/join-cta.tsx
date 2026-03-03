export function JoinCta() {
  return (
    <section className="bg-primary px-8 py-24 lg:px-10 lg:py-32">
      <div className="flex min-h-[300px] flex-col justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium leading-[1.2] tracking-tight text-white sm:text-4xl">
            We&rsquo;re building the community we wish we&rsquo;d had.
            Be&nbsp;one of the first.
          </h2>
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-950 transition-colors hover:bg-white"
          >
            Become a founding member
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-950 transition-colors hover:bg-white"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
