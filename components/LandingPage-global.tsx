'use client';

import React, { useState } from 'react';
import { 
  Plane, Bell, TrendingDown, Clock, Shield, ChevronRight, 
  Check, Star, ArrowRight, Zap, Target, Calendar,
  DollarSign, Globe, Sparkles, Play
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add to waitlist
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TravelCart</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/app'}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => document.getElementById('hero-cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">AI-powered price intelligence</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Book flights at the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  perfect moment
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                TravelCart's AI watches flight prices 24/7 and tells you exactly when to book. 
                Stop guessing, start saving.
              </p>

              {/* Value props */}
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { icon: TrendingDown, text: 'Avg. $287 saved per trip' },
                  { icon: Clock, text: 'Checks prices every 6 hours' },
                  { icon: Bell, text: 'Smart booking alerts' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-600">
                    <item.icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <form id="hero-cta" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
                {!submitted ? (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      Get Early Access
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-emerald-800 font-medium">You're on the list! We'll be in touch soon.</span>
                  </div>
                )}
              </form>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['😊', '🙂', '😄', '🤩'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">2,400+</span> travelers on the waitlist
                </div>
              </div>
            </div>

            {/* Hero Image/App Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
              <div
                onClick={() => window.location.href = '/app'}
                className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-200/50 overflow-hidden border border-gray-100 cursor-pointer hover:shadow-indigo-300/60 transition-shadow"
              >
                {/* App Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold text-lg">TravelCart</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🤖</div>
                      <div>
                        <p className="text-white font-medium">AI watching 3 trips</p>
                        <p className="text-indigo-200 text-sm">Last checked: 2 min ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Content */}
                <div className="p-6 space-y-4">
                  {/* Savings Card */}
                  <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-semibold text-emerald-800">You're saving $412</p>
                      <p className="text-sm text-emerald-600">15% below what you'd have paid</p>
                    </div>
                  </div>

                  {/* Flight Card 1 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">NYC → London</p>
                          <p className="text-sm text-gray-500">Jun 15–22 · 2 travelers</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">$892</p>
                          <p className="text-sm text-gray-400 line-through">$1,180</p>
                        </div>
                      </div>
                      <div className="flex items-end gap-1 h-8 mb-2">
                        {[65, 58, 52, 48, 42].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t ${i === 4 ? 'bg-emerald-400' : 'bg-gray-200'}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
                      <span className="text-white font-medium text-sm">🎯 Target hit — Book now!</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Flight Card 2 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">LA → Tokyo</p>
                          <p className="text-sm text-gray-500">Aug 1–14</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">$1,342</p>
                          <p className="text-sm text-gray-400 line-through">$1,520</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 px-4 py-3 flex items-center justify-between">
                      <span className="text-amber-700 font-medium text-sm">⏳ Wait — book Jul 10–15</span>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Price dropped!</p>
                    <p className="text-xs text-emerald-600">-$127 since yesterday</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Book soon</p>
                    <p className="text-xs text-amber-600">Optimal window: 3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust Bar */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-6">Powered by real-time data from</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <span className="text-2xl font-bold text-gray-400">Amadeus</span>
            <span className="text-2xl font-bold text-gray-400">IATA</span>
            <span className="text-2xl font-bold text-gray-400">OAG</span>
            <span className="text-2xl font-bold text-gray-400">Cirium</span>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Flight prices are unpredictable. Until now.
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            You've felt the frustration. The perfect fare that's gone the next day. 
            The nagging feeling you booked too early — or too late.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '📈', title: 'Prices change constantly', desc: 'Airlines adjust fares hundreds of times a day based on demand' },
              { emoji: '🎲', title: "Booking feels like gambling", desc: "Should you buy now or wait? There's no way to know" },
              { emoji: '💸', title: 'Most people overpay', desc: 'The average traveler pays 18% more than they need to' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-left">
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your AI travel assistant
            </h2>
            <p className="text-xl text-indigo-200">
              Three steps to never overpay for flights again
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Plane,
                title: 'Add your trip',
                desc: 'Tell us where you want to go and when. Set your target price or let our AI suggest one.',
              },
              {
                step: '2',
                icon: Zap,
                title: 'AI monitors 24/7',
                desc: 'We check prices every 6 hours, analyze patterns, and predict the best booking window.',
              },
              {
                step: '3',
                icon: Target,
                title: 'Book with confidence',
                desc: "Get notified the moment it's time to book. No more second-guessing.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-full">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="absolute -top-4 -left-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center font-bold text-amber-900">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-indigo-200">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-white/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart features for smart travelers
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to book at the right price
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'AI Price Targets',
                desc: 'Our AI analyzes historical data to suggest the optimal target price for your route.',
                color: 'bg-indigo-100 text-indigo-600',
              },
              {
                icon: TrendingDown,
                title: 'Price Forecasting',
                desc: 'See when prices typically drop and rise for your specific route and dates.',
                color: 'bg-emerald-100 text-emerald-600',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                desc: 'Get alerts for price drops, optimal booking windows, and when to act fast.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                icon: Shield,
                title: 'Price Hold',
                desc: "Lock in today's price while you wait. If it drops, you get the lower price.",
                color: 'bg-violet-100 text-violet-600',
              },
              {
                icon: Calendar,
                title: 'Calendar Sync',
                desc: 'Reminders added directly to your calendar so you never miss the booking window.',
                color: 'bg-rose-100 text-rose-600',
              },
              {
                icon: Globe,
                title: 'All Major Routes',
                desc: 'Works for domestic and international flights on all major airlines.',
                color: 'bg-cyan-100 text-cyan-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$287', label: 'Average savings per trip' },
              { value: '94%', label: 'Prediction accuracy' },
              { value: '6hrs', label: 'Price check frequency' },
              { value: '50K+', label: 'Routes monitored' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Travelers love TravelCart
            </h2>
            <p className="text-xl text-gray-600">
              Real savings from real people
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I was about to book when TravelCart told me to wait. Two weeks later, the price dropped $340. This thing pays for itself instantly.",
                name: 'Sarah M.',
                route: 'SFO → Paris',
                saved: '$340',
                avatar: '👩',
              },
              {
                quote: "Finally, an app that takes the stress out of booking. I just set my trips and forget about it until I get the alert.",
                name: 'James K.',
                route: 'Chicago → London',
                saved: '$287',
                avatar: '👨',
              },
              {
                quote: "The calendar reminders are genius. I added them, got the notification, and booked in 30 seconds. Easiest $200 I ever saved.",
                name: 'Priya R.',
                route: 'NYC → Mumbai',
                saved: '$412',
                avatar: '👩',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Saved</p>
                    <p className="font-bold text-emerald-600">{testimonial.saved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One saved flight pays for a year
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Simple pricing. Cancel anytime.
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Early Access</span>
            </div>

            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold text-gray-900">Free</span>
            </div>
            <p className="text-gray-500 mb-8">
              During beta · No credit card required
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8">
              {[
                'Unlimited price watches',
                'AI buy/wait signals',
                'Price drop alerts',
                'Calendar reminders',
                'Price hold feature',
                'Email support',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.getElementById('hero-cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg"
            >
              Get Early Access
            </button>
            
            <p className="text-sm text-gray-400 mt-4">
              Join 2,400+ travelers already on the waitlist
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop guessing. Start saving.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of travelers who book flights at the perfect price.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            Free during beta · No spam · Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">TravelCart</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 TravelCart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}
