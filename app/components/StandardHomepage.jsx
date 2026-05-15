"use client";

import { useState } from "react";
import {
  MapPin, Calendar, Search, ArrowRight, ShieldCheck,
  Clock, CheckCircle, CreditCard, Smartphone, Star,
  Wifi, Coffee, Zap, Users, ChevronRight, ArrowLeftRight,
  Tag, Gift, Phone, Mail
} from "lucide-react";

// Inline social SVGs (lucide-react v0.x doesn't export these)
const FbIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#060810" />
  </svg>
);

const ROUTES = [
  { from: "Mumbai", to: "Pune", time: "3h 30m", price: "₹450", buses: "128 Buses", rating: 4.8 },
  { from: "Delhi", to: "Manali", time: "12h 45m", price: "₹1,200", buses: "64 Buses", rating: 4.7 },
  { from: "Bangalore", to: "Chennai", time: "6h 15m", price: "₹850", buses: "96 Buses", rating: 4.9 },
  { from: "Hyderabad", to: "Vijayawada", time: "5h 20m", price: "₹650", buses: "80 Buses", rating: 4.6 },
];

const OFFERS = [
  { code: "SSPFIRST", discount: "Flat ₹200 Off", desc: "On your first SSP Travels booking", color: "from-cyan-500/20 to-blue-600/20", border: "border-cyan-500/30", badge: "NEW USER" },
  { code: "SSPLUX10", discount: "10% Off", desc: "On all luxury & sleeper bus bookings", color: "from-purple-500/20 to-pink-600/20", border: "border-purple-500/30", badge: "HOT DEAL" },
  { code: "SSPWKND", discount: "₹150 Off", desc: "Weekend special — travel Fri–Sun", color: "from-amber-500/20 to-orange-600/20", border: "border-amber-500/30", badge: "WEEKEND" },
];

const AMENITIES = [
  { icon: <Wifi className="w-5 h-5" />, label: "Free WiFi" },
  { icon: <Coffee className="w-5 h-5" />, label: "Refreshments" },
  { icon: <Zap className="w-5 h-5" />, label: "USB Charging" },
  { icon: <ShieldCheck className="w-5 h-5" />, label: "GPS Tracked" },
  { icon: <Users className="w-5 h-5" />, label: "Trained Staff" },
  { icon: <Star className="w-5 h-5" />, label: "5-Star Rated" },
];

export default function StandardHomepage() {
  const [activeTab, setActiveTab] = useState("oneway");

  return (
    <div className="relative z-10 w-full">

      {/* ─────────────── BOOKING HERO ─────────────── */}
      <section className="booking-section py-20 px-4 lg:px-16">
        <div className="max-w-6xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-semibold mb-3">
              India&apos;s Premium Bus Network
            </p>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Ready for your{" "}
              <span className="text-gradient-cyan">Next Journey?</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              Book 10,000+ routes across India with instant confirmation & zero hidden fees.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex glass rounded-full p-1 border border-white/10">
              {["oneway", "return"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-7 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === t
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "text-white/50 hover:text-white"
                    }`}
                >
                  {t === "oneway" ? "One Way" : "Round Trip"}
                </button>
              ))}
            </div>
          </div>

          {/* Search Card */}
          <div className="search-card-wrapper relative group">
            {/* Glow ring */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-[2rem] blur-md opacity-20 group-hover:opacity-40 transition-all duration-700" />

            <div className="relative glass-strong rounded-[1.75rem] border border-white/15 p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row items-stretch">

                {/* From */}
                <div className="search-field flex items-center flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 md:rounded-l-[1.5rem] transition-colors cursor-text group/field">
                  <MapPin className="text-cyan-400 w-6 h-6 mr-4 shrink-0" />
                  <label htmlFor="from-city" className="flex flex-col w-full min-w-0 cursor-pointer">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-bold mb-1">From</span>
                    <input
                      id="from-city"
                      type="text"
                      placeholder="Origin City"
                      defaultValue="Mumbai"
                      className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/30 font-bold text-xl truncate"
                    />
                  </label>
                </div>

                {/* Swap icon */}
                <button className="hidden md:flex self-center mx-2 w-9 h-9 bg-white/10 hover:bg-cyan-500/20 border border-white/20 rounded-full items-center justify-center transition-all hover:scale-110 hover:border-cyan-500/40 group/swap shrink-0">
                  <ArrowLeftRight className="w-4 h-4 text-white/70 group-hover/swap:text-cyan-400 transition-colors" />
                </button>

                {/* To */}
                <div className="search-field flex items-center flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors cursor-text">
                  <MapPin className="text-white/40 w-6 h-6 mr-4 shrink-0" />
                  <label htmlFor="to-city" className="flex flex-col w-full min-w-0 cursor-pointer">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">To</span>
                    <input
                      id="to-city"
                      type="text"
                      placeholder="Destination City"
                      defaultValue="Pune"
                      className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/30 font-bold text-xl truncate"
                    />
                  </label>
                </div>

                {/* Date */}
                <div className="search-field flex items-center flex-1 px-6 py-5 border-b md:border-b-0 hover:bg-white/5 transition-colors cursor-text">
                  <Calendar className="text-cyan-400 w-6 h-6 mr-4 shrink-0" />
                  <label htmlFor="journey-date" className="flex flex-col w-full min-w-0 cursor-pointer">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-bold mb-1">Journey Date</span>
                    <input
                      id="journey-date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="bg-transparent border-none outline-none w-full text-white font-bold text-xl [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </label>
                </div>

                {/* Return Date (Visible only for Round Trip) */}
                {activeTab === "return" && (
                  <div className="search-field flex items-center flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors cursor-text animate-fade-in">
                    <Calendar className="text-purple-400 w-6 h-6 mr-4 shrink-0" />
                    <label htmlFor="return-date" className="flex flex-col w-full min-w-0 cursor-pointer">
                      <span className="text-[10px] uppercase tracking-widest text-purple-400/70 font-bold mb-1">Return Date</span>
                      <input
                        id="return-date"
                        type="date"
                        className="bg-transparent border-none outline-none w-full text-white font-bold text-xl [&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </label>
                  </div>
                )}

                {/* CTA */}
                <div className="p-2 flex items-center">
                  <button className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-[1.25rem] flex items-center justify-center gap-3 px-10 py-5 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-cyan-500/20 whitespace-nowrap text-lg">
                    <Search className="w-5 h-5" />
                    Search Buses
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Amenity pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {AMENITIES.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-white/70 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-default"
              >
                <span className="text-cyan-400">{a.icon}</span>
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── OFFERS / COUPONS ─────────────── */}
      <section className="py-16 px-4 lg:px-16 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400/70 font-semibold mb-2">Save More</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-white">Exclusive Offers</h3>
            </div>
            <button className="flex items-center gap-2 text-cyan-400 hover:text-white text-sm font-semibold transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERS.map((offer, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border ${offer.border} bg-gradient-to-br ${offer.color} p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">
                  {offer.badge}
                </span>

                <Tag className="w-7 h-7 text-cyan-400 mb-4" />
                <div className="text-2xl font-black text-white mb-1">{offer.discount}</div>
                <div className="text-white/60 text-sm mb-4">{offer.desc}</div>

                <div className="flex items-center justify-between">
                  <div className="glass border border-white/10 rounded-lg px-4 py-2 font-mono text-sm font-bold text-cyan-400 tracking-widest">
                    {offer.code}
                  </div>
                  <button className="text-xs text-white/50 hover:text-cyan-400 font-semibold transition-colors group-hover:underline">
                    Copy Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── POPULAR ROUTES ─────────────── */}
      <section className="py-16 px-4 lg:px-16 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400/70 font-semibold mb-2">Top Picks</p>
              <h3 className="text-3xl lg:text-4xl font-bold text-white">Popular Routes</h3>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm font-semibold glass border border-white/10 text-cyan-400 hover:border-cyan-500/40 hover:bg-white/10 px-5 py-2.5 rounded-full transition-all">
              All Routes <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROUTES.map((route, i) => (
              <div
                key={i}
                className="route-card glass border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-3 py-1 rounded-full">
                    {route.buses}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold">{route.rating}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/50 text-sm font-medium">{route.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-white font-bold">{route.to}</span>
                </div>
                <div className="text-white/40 text-xs mb-5">{route.time} journey</div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <div className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Starting</div>
                    <div className="text-2xl font-black text-cyan-400">{route.price}</div>
                  </div>
                  <button className="bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-white rounded-xl px-4 py-2 text-xs font-semibold transition-all group-hover:text-cyan-400">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── WHY CHOOSE US ─────────────── */}
      <section className="py-16 px-4 lg:px-16 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-cyan-400/70 font-semibold mb-2">Our Promise</p>
            <h3 className="text-3xl lg:text-5xl font-bold text-white mb-3">The Premium Difference</h3>
            <p className="text-white/50 max-w-md mx-auto">Why millions of travelers across India choose SSP Travels every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-cyan-400" />,
                title: "Safety First",
                desc: "Every bus undergoes a rigorous 40-point safety inspection before every journey, monitored via GPS in real-time.",
              },
              {
                icon: <Clock className="w-8 h-8 text-cyan-400" />,
                title: "On-Time, Every Time",
                desc: "We value your time. Our strict schedule adherence ensures 98.6% on-time departures nationwide.",
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-cyan-400" />,
                title: "Hassle-Free Refunds",
                desc: "Cancel anytime before departure. Full refunds processed instantly with zero questions asked.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="glass border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer group"
              >
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-300">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                <p className="text-white/55 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── APP DOWNLOAD BANNER ─────────────── */}
      <section className="py-16 px-4 lg:px-16 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Mobile Exclusive</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Download the SSP App</h3>
              <p className="text-white/50 max-w-sm">Get ₹100 off on your first app booking. Live seat tracking, digital tickets & 24/7 support.</p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3">
              <button className="flex items-center gap-3 glass border border-white/15 hover:border-white/30 text-white px-6 py-3.5 rounded-xl transition-all hover:bg-white/10">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-[10px] text-white/50">Download on</div>
                  <div className="font-bold text-sm">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 glass border border-white/15 hover:border-white/30 text-white px-6 py-3.5 rounded-xl transition-all hover:bg-white/10">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-[10px] text-white/50">Get it on</div>
                  <div className="font-bold text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-white/[0.06] pt-16 pb-8 px-4 lg:px-16 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <h2 className="text-3xl font-black tracking-tight text-white mb-3">
                SSP <span className="text-gradient-cyan">TRAVELS</span>
              </h2>
              <p className="text-white/40 max-w-xs text-sm leading-relaxed mb-6">
                Redefining luxury road travel with comfort, safety, and uncompromising elegance. Your journey, elevated.
              </p>
              <div className="flex gap-3 mb-6">
                {[FbIcon, TwIcon, IgIcon, YtIcon].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 glass border border-white/10 rounded-full flex items-center justify-center hover:border-cyan-500/40 hover:text-cyan-400 text-white/50 transition-all">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 glass border border-white/10 rounded-lg px-3 py-2 text-white/50">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs">1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-2 glass border border-white/10 rounded-lg px-3 py-2 text-white/50">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs">support@ssptravels.in</span>
                </div>
              </div>
            </div>

            {/* Links */}
            {[
              {
                heading: "Company",
                links: ["About Us", "Careers", "Press", "Partner with Us"],
              },
              {
                heading: "Support",
                links: ["Help Center", "Contact Us", "Live Chat", "Track Bus"],
              },
              {
                heading: "Legal",
                links: ["Terms of Service", "Privacy Policy", "Refund Policy", "Cookie Policy"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/40 hover:text-cyan-400 text-sm transition-colors block">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4 text-white/25 text-xs">
            <span>© 2026 SSP Travels Pvt. Ltd. All rights reserved.</span>
            <div className="flex items-center gap-4">
              {[CreditCard, Smartphone].map((Icon, i) => (
                <div key={i} className="w-10 h-7 glass border border-white/10 rounded flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
              ))}
            </div>
            <span>Designed for the premium traveler.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
