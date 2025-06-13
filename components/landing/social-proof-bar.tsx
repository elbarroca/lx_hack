export default function SocialProofBar() {
    const companies = ["InnovateCorp", "FutureTech", "Synergy Inc", "NextGen AI", "DataFlow"]
  
    return (
      <section className="w-full py-8 bg-black border-t border-b border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-400 font-medium tracking-wider mb-6">
            TRUSTED BY LEADERS AT FORWARD-THINKING COMPANIES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {companies.map((company) => (
              <div key={company} className="text-gray-300 font-bold text-xl">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  