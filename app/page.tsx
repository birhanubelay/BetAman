// 'use client';

// import Header from '@/components/Header';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Shield, CheckCircle2, TrendingUp, Home } from 'lucide-react';
// import Link from 'next/link';

// export default function Dashboard() {
//   return (
//     <>
//       <Header />
//       <main className="min-h-screen pt-12">
//         <div className="max-w-7xl mx-auto px-6">
//           {/* Hero Section */}
//           <div className="mb-20 text-center">
//             <div className="inline-block mb-6 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
//               <p className="text-sm font-semibold text-[#d4af37]">AI-Powered Verification</p>
//             </div>
//             <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
//               Trust Before You <span className="text-[#d4af37]">Commit</span>
//             </h2>
//             <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
//               Advanced fraud detection using AI analysis, location verification, and blockchain-backed escrow. 
//               Every property verified. Every transaction secure.
//             </p>
//             <div className="flex items-center justify-center gap-4">
//               <Link href="/submit">
//                 <Button size="lg" className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 px-8">
//                   Submit Property
//                 </Button>
//               </Link>
//               <Link href="/reputation">
//                 <Button variant="outline" size="lg" className="h-12 px-8 border-[#2d2d2d] hover:bg-[#1a1a1a]">
//                   View Reputation Scores
//                 </Button>
//               </Link>
//             </div>
//           </div>

//           {/* Features Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
//             <FeatureCard
//               icon={<Shield className="w-6 h-6" />}
//               title="AI Fraud Detection"
//               description="5-point verification: reverse image search, location analysis, price anomalies, urgency flags, and description matching"
//             />
//             <FeatureCard
//               icon={<Home className="w-6 h-6" />}
//               title="Location Verification"
//               description="EXIF GPS extraction, landmark recognition, and area comparison for accurate property location validation"
//             />
//             <FeatureCard
//               icon={<CheckCircle2 className="w-6 h-6" />}
//               title="Secure Escrow"
//               description="SPL token escrow on Solana devnet. Deposits locked until viewing confirmation or 24h auto-refund"
//             />
//             <FeatureCard
//               icon={<TrendingUp className="w-6 h-6" />}
//               title="Reputation NFT"
//               description="Earn soulbound cNFT reputation badges on successful escrow completion. Non-transferable proof of trust"
//             />
//           </div>

//           {/* How It Works */}
//           <div className="mb-20">
//             <h3 className="text-3xl font-bold text-white mb-12 text-center">How BetAman Works</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <Step
//                 number={1}
//                 title="Submit Property"
//                 description="Upload property images, location, price, and description for AI analysis"
//               />
//               <Step
//                 number={2}
//                 title="Get AI Verification"
//                 description="Receive detailed fraud analysis: risk score, location verification, image authenticity checks"
//               />
//               <Step
//                 number={3}
//                 title="Secure Escrow & Reputation"
//                 description="Use SPL escrow for safe transactions, earn soulbound NFT reputation on confirmed viewings"
//               />
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
//             <StatCard number="98.5%" label="Fraud Detection Accuracy" />
//             <StatCard number="24/7" label="Instant AI Verification" />
//             <StatCard number="Zero" label="Hidden Fees" />
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// function FeatureCard({
//   icon,
//   title,
//   description,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <Card className="bg-[#1a1a1a] border-[#2d2d2d] hover:border-[#d4af37]/30 transition group cursor-pointer">
//       <div className="p-6">
//         <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 group-hover:bg-[#d4af37]/20 transition">
//           {icon}
//         </div>
//         <h4 className="font-bold text-white mb-2">{title}</h4>
//         <p className="text-sm text-gray-400">{description}</p>
//       </div>
//     </Card>
//   );
// }

// function Step({
//   number,
//   title,
//   description,
// }: {
//   number: number;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="relative">
//       <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0f0f0f] font-bold text-lg">
//         {number}
//       </div>
//       <Card className="bg-[#1a1a1a] border-[#2d2d2d] pt-12 pl-6">
//         <div className="p-6">
//           <h4 className="font-bold text-white mb-3">{title}</h4>
//           <p className="text-sm text-gray-400">{description}</p>
//         </div>
//       </Card>
//     </div>
//   );
// }

// function StatCard({ number, label }: { number: string; label: string }) {
//   return (
//     <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
//       <div className="p-6 text-center">
//         <div className="text-3xl font-bold text-[#d4af37] mb-2">{number}</div>
//         <p className="text-sm text-gray-400">{label}</p>
//       </div>
//     </Card>
//   );
// }


'use client';

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, CheckCircle2, TrendingUp, Home, MapPin, Star, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        
        {/*  HERO SECTION - Full Background Image */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/house-1.jpg"
              alt="Luxury Property"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0f0f0f]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block mb-6 px-6 py-2 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 backdrop-blur-sm">
              <p className="text-sm font-semibold text-[#d4af37]">🛡️ AI-Powered Verification</p>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trust Before You <span className="text-[#d4af37]">Commit</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Advanced fraud detection using AI analysis, location verification, and blockchain-backed escrow. 
              Every property verified. Every transaction secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/submit">
                <Button size="lg" className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-14 px-10 text-lg rounded-xl shadow-2xl shadow-[#d4af37]/20">
                  Submit Property
                </Button>
              </Link>
              <Link href="/reputation">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-2 border-white/30 hover:bg-white/10 text-white rounded-xl backdrop-blur-sm">
                  View Reputation Scores
                </Button>
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm">Verified Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm">Secure Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm">98.5% Accuracy</span>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 STATS SECTION */}
        <section className="py-20 bg-[#1a1a1a] border-y border-[#2d2d2d]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard number="500+" label="Properties Verified" icon={<Home className="w-6 h-6" />} />
              <StatCard number="98.5%" label="Fraud Detection" icon={<Shield className="w-6 h-6" />} />
              <StatCard number="1,200+" label="Happy Renters" icon={<Users className="w-6 h-6" />} />
              <StatCard number="$2M+" label="Secured in Escrow" icon={<Lock className="w-6 h-6" />} />
            </div>
          </div>
        </section>

        {/* 🏡 FEATURED PROPERTIES */}
        <section className="py-24 bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Verified Properties</h2>
              <p className="text-xl text-gray-400">Every property AI-verified and blockchain-secured</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PropertyCard
                image="/images/house-1.jpg"
                title="Modern Downtown Apartment"
                location="Bole, Addis Ababa"
                price="$850/month"
                verified={true}
                trustScore={98}
              />
              <PropertyCard
                image="/images/house-2.jpg"
                title="Luxury Villa with Garden"
                location="Old Airport, Addis Ababa"
                price="$1,200/month"
                verified={true}
                trustScore={96}
              />
              <PropertyCard
                image="/images/house-3.jpg"
                title="Spacious Family Home"
                location="Kazanchis, Addis Ababa"
                price="$950/month"
                verified={true}
                trustScore={99}
              />
            </div>
            
            <div className="text-center mt-12">
              <Link href="/submit">
                <Button className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold px-8 py-6 rounded-xl">
                  View All Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 🔐 FEATURES GRID */}
        <section className="py-24 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose BetAman?</h2>
              <p className="text-xl text-gray-400">Complete protection for every rental transaction</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="AI Fraud Detection"
                description="5-point verification: reverse image search, location analysis, price anomalies, urgency flags, and description matching"
              />
              <FeatureCard
                icon={<MapPin className="w-6 h-6" />}
                title="Location Verification"
                description="EXIF GPS extraction, landmark recognition, and area comparison for accurate property location validation"
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6" />}
                title="Secure Escrow"
                description="SPL token escrow on Solana devnet. Deposits locked until viewing confirmation or 24h auto-refund"
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Reputation NFT"
                description="Earn soulbound cNFT reputation badges on successful escrow completion. Non-transferable proof of trust"
              />
            </div>
          </div>
        </section>

        {/* 📋 HOW IT WORKS */}
        <section className="py-24 bg-[#0f0f0f] relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How BetAman Works</h2>
              <p className="text-xl text-gray-400">Three simple steps to secure your rental</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Step
                number={1}
                title="Submit Property"
                description="Upload property images, location, price, and description for AI analysis"
              />
              <Step
                number={2}
                title="Get AI Verification"
                description="Receive detailed fraud analysis: risk score, location verification, image authenticity checks"
              />
              <Step
                number={3}
                title="Secure Escrow & Reputation"
                description="Use SPL escrow for safe transactions, earn soulbound NFT reputation on confirmed viewings"
              />
            </div>
          </div>
        </section>

        {/* 🌟 TESTIMONIALS */}
        <section className="py-24 bg-[#1a1a1a] border-t border-[#2d2d2d]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-400">Trusted by thousands of renters and landlords</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="BetAman saved me from a scam listing. The AI detected fake photos that looked completely real!"
                author="Sarah M."
                role="Tenant"
                rating={5}
              />
              <TestimonialCard
                quote="As a landlord, the reputation system helps me attract serious, trustworthy tenants."
                author="Abebe K."
                role="Property Owner"
                rating={5}
              />
              <TestimonialCard
                quote="The escrow system gives me peace of mind. Money is only released after I confirm the viewing."
                author="Michael T."
                role="Tenant"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* 🚀 CTA SECTION */}
        <section className="py-24 bg-gradient-to-br from-[#d4af37]/20 to-[#0f0f0f] border-t border-[#2d2d2d]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Rent with Confidence?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of verified renters and landlords on Ethiopia's most trusted rental platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/submit">
                <Button size="lg" className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-14 px-10 text-lg rounded-xl shadow-2xl shadow-[#d4af37]/20">
                  List Your Property
                </Button>
              </Link>
              <Link href="/reputation">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-2 border-[#d4af37] hover:bg-[#d4af37]/10 text-white rounded-xl">
                  Check Reputation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0f0f0f] border-t border-[#2d2d2d] py-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
            <p>© 2026 BetAman. Securing rentals with AI and blockchain.</p>
          </div>
        </footer>

      </main>
    </>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2d2d2d] hover:border-[#d4af37]/30 transition group cursor-pointer">
      <div className="p-6">
        <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 group-hover:bg-[#d4af37]/20 transition">
          {icon}
        </div>
        <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

// Property Card Component
function PropertyCard({
  image,
  title,
  location,
  price,
  verified,
  trustScore,
}: {
  image: string;
  title: string;
  location: string;
  price: string;
  verified: boolean;
  trustScore: number;
}) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2d2d2d] overflow-hidden hover:border-[#d4af37]/30 transition group cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {verified && (
            <div className="px-3 py-1 rounded-full bg-[#d4af37] text-black text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
          Trust: {trustScore}%
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-white text-xl mb-2">{title}</h3>
        <div className="flex items-center gap-2 text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#d4af37]">{price}</span>
          <Button size="sm" className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Step Component
function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="absolute -left-4 -top-4 w-14 h-14 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0f0f0f] font-bold text-xl shadow-lg shadow-[#d4af37]/30">
        {number}
      </div>
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] pt-14 pl-6">
        <div className="p-6">
          <h4 className="font-bold text-white text-xl mb-3">{title}</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#d4af37]/10 text-[#d4af37] mb-4">
        {icon}
      </div>
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
        ))}
      </div>
      <p className="text-gray-300 mb-6 leading-relaxed">"{quote}"</p>
      <div>
        <p className="font-bold text-white">{author}</p>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </Card>
  );
}