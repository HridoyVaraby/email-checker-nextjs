import Link from "next/link";
import { MockEmailRecord, mockEmailData } from "@/lib/mockData";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-black uppercase bg-gray-100 rounded-full">
          Professional Email Validation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
          Verify your email lists <br />
          <span className="text-gray-400">with confidence.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
          Clean your email lists, remove verify validity, and protect your sender reputation with our secure, client-side first verification tool.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Verification
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-black mb-2">99%</div>
              <div className="text-gray-500 font-medium">Accuracy Rate</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-black mb-2">Fast</div>
              <div className="text-gray-500 font-medium">Batch Processing</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-black mb-2">Secure</div>
              <div className="text-gray-500 font-medium">Data Protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">
              Everything you need to <br />clean your lists
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Syntax Validation', desc: 'Checks for standard email formatting protocols.' },
                { title: 'Domain Verification', desc: 'Ensures the domain uses valid MX records.' },
                { title: 'Disposable Detection', desc: 'Filters out temporary and burner addresses.' },
                { title: 'Role-based Detection', desc: 'Identifies generic addresses like admin@ or info@.' },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black flex items-center justify-center mt-1">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{feature.title}</h3>
                    <p className="text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gray-100 rounded-2xl transform rotate-3 scale-95" />
            <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                {/* Mock data preview */}
                <div className="space-y-3">
                  {mockEmailData.slice(0, 5).map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{row.email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i === 0 ? 'bg-black text-white' : i === 1 ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'
                        }`}>
                        {i === 1 ? 'Risky' : 'Valid'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
