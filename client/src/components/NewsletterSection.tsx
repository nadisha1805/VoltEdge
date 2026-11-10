import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';
import { useToast } from '../context/ToastContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await subscribeNewsletter(email);
      setIsSuccess(true);
      showToast(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Subscription failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-brand-navyDark text-white relative overflow-hidden border-t border-slate-800">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-brand-blue/15 border border-brand-blue/30 px-3.5 py-1 rounded-full text-brand-blue text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>VOLTEDGE INSIDER ACCESS</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] mb-4">
          Power Your Inbox With Next-Gen Tech Drops
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
          Be the first to know about new showroom releases, secret flash sales, and early-access pre-orders for flagship devices.
        </p>

        {isSuccess ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-6 max-w-md mx-auto flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h4 className="font-bold text-white text-base">You're on the VIP List!</h4>
            <p className="text-xs text-slate-300">
              Check your inbox shortly for our curated tech briefing and your exclusive showroom welcome pass.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand-blue hover:bg-brand-blueHover disabled:bg-slate-700 text-white px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              We respect your privacy. Zero spam, unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
