"use client";

import { useState, FormEvent } from "react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [contactValue, setContactValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitForm();
  };

  const submitForm = () => {
    console.log("Button clicked!");
    setIsSubmitting(true);
    // TODO: Handle form submission
    console.log("Form submitted with:", { contactType, contactValue });
    // Reset submission state after 2 seconds (simulating submission)
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="relative mb-8">
        <h1 className={`${dancingScript.className} text-5xl font-bold text-center text-amber-900 relative transform -rotate-2 drop-shadow-lg`}>
          Surprise Envelope
        </h1>
        <div className="w-48 h-1 bg-amber-300 mx-auto rounded-full transform rotate-2 mt-2 shadow-sm"></div>
      </div>

      <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative mt-8">
          {/* Toggle between email and phone */}
          <div className="flex bg-amber-50/50 rounded-lg p-1 border border-amber-200">
            <button
              type="button"
              onClick={() => setContactType("email")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                contactType === "email"
                  ? "bg-white shadow-sm text-amber-900"
                  : "text-amber-700 hover:text-amber-900"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactType("phone")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                contactType === "phone"
                  ? "bg-white shadow-sm text-amber-900"
                  : "text-amber-700 hover:text-amber-900"
              }`}
            >
              Phone
            </button>
          </div>

          {/* Input field */}
          <div>
            <label
              htmlFor={contactType === "email" ? "email" : "phone"}
              className="block text-sm font-medium text-amber-800 mb-2"
            >
              {contactType === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              type={contactType === "email" ? "email" : "tel"}
              id={contactType === "email" ? "email" : "phone"}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                contactType === "email"
                  ? "Enter email address"
                  : "Enter phone number"
              }
              className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white/80 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors text-amber-900 placeholder-amber-400"
              required
            />
          </div>

          {/* Submit button with envelope animation */}
          <div className="relative">
            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-500 relative overflow-hidden
                ${isSubmitting 
                  ? 'bg-amber-100 text-transparent transform scale-95' 
                  : 'bg-amber-600 text-white hover:bg-amber-700'}`}
            >
                Fill the envelope
            </button>
            
            {/* Envelope animation */}
            <div className={`absolute inset-0 transition-all duration-500 ${isSubmitting ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-8 relative">
                  {/* Envelope body */}
                  <div className="absolute inset-0 border-2 border-amber-600 bg-amber-50"></div>
                  {/* Envelope flap */}
                  <div className={`absolute top-0 left-0 right-0 h-4 bg-amber-100 border-2 border-amber-600 transition-transform duration-500 origin-top
                    ${isSubmitting ? 'rotate-0' : '-rotate-180'}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
