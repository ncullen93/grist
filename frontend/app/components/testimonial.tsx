export function Testimonial() {
  return (
    <section className="bg-[#e8ece5] px-8 py-24 lg:px-10 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Quote - left side */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Why we started this
          </p>

          <blockquote className="mt-8 font-sans text-2xl font-normal leading-[1.35] tracking-normal text-gray-900">
            As the fifth generation recently taking the reins of our historic
            home, we started Grist Club to learn from passionate owners and
            build real friendships along the way.
          </blockquote>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              Nick &amp; Cecilia
            </p>
            <p className="text-sm text-gray-500">
              Owners of a historic Cape cottage &middot; Brewster, MA
            </p>
          </div>
        </div>

        {/* Image - right side */}
        <div className="flex justify-center lg:justify-end">
          <img
            src="/nick-and-august.jpg"
            alt="A beautifully restored historic home"
            className="aspect-3/4 w-96 rounded-md object-cover lg:w-105"
          />
        </div>
      </div>
    </section>
  );
}
