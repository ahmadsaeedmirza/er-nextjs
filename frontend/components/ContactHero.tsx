export default function ContactHero() {
  return (
    <div className="w-full md:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-extralight tracking-tight mb-8">
          Visit the
          <span className="font-semibold text-primary italic"> Salon</span>
        </h1>
        <p className="text-stone-500 mb-12 text-lg leading-relaxed">
          Experience the pinnacle of luxury hair and beauty treatments in our
          serene, marble-accented sanctuary.
        </p>

        <div className="space-y-10">
          {/* Address */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-12 h-12 bg-[#CF1745]/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-location-dot text-[#CF1745] text-lg" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Our Location
              </h3>
              <p className="text-lg">
                1221 Avenue of the Americas
                <br />
                New York, NY 10020
              </p>
              <a
                className="text-xs font-bold uppercase tracking-widest text-[#CF1745]/60 hover:text-[#CF1745] mt-2 inline-block transition-colors"
                href="https://maps.app.goo.gl/QrYeabnGPKS1rkV6A"
                target="_blank"
                rel="noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-12 h-12 bg-[#CF1745]/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-phone text-[#CF1745] text-lg" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Reservation Desk
              </h3>
              <p className="text-lg">+1 (212) 555-0198</p>
              <p className="text-stone-400 text-sm italic">
                Mon - Sat: 9am to 8pm
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-12 h-12 bg-[#CF1745]/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-at text-[#CF1745] text-lg" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                General Inquiries
              </h3>
              <p className="text-lg">concierge@marbleluxe.com</p>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-16 pt-10 border-t border-stone-200 flex items-center space-x-8">
          <a
            className="text-stone-400 hover:text-[#CF1745] transition-colors"
            href="#"
          >
            <i className="fa-brands fa-facebook text-2xl" />
          </a>
          <a
            className="text-stone-400 hover:text-[#CF1745] transition-colors"
            href="#"
          >
            <i className="fa-brands fa-instagram text-2xl" />
          </a>
          <a
            className="text-stone-400 hover:text-[#CF1745] transition-colors"
            href="#"
          >
            <i className="fa-solid fa-at text-2xl" />
          </a>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-300">
            Follow Our Journey
          </span>
        </div>
      </div>
    </div>
  );
}
