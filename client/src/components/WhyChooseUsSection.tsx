import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Award,
  Zap,
} from 'lucide-react';

export const WhyChooseUsSection: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50 border-emerald-200/60',
      title: '100% Genuine Guaranteed',
      description:
        'Direct factory-sealed inventory sourced exclusively through official brand partnerships with full manufacturer warranty.',
    },
    {
      icon: <Truck className="w-6 h-6 text-brand-blue" />,
      bg: 'bg-blue-50 border-blue-200/60',
      title: 'White-Glove Express Delivery',
      description:
        'Fast, fully insured courier dispatch nationwide with real-time GPS tracking and tamper-evident packaging.',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50 border-amber-200/60',
      title: '30-Day Showroom Trial',
      description:
        'Test out your new computing or audio rig with complete peace of mind. Zero-hassle returns or direct replacements.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 border-purple-200/60',
      title: 'Expert Tech Concierge',
      description:
        'Our certified hardware engineers provide audio matching, laptop tuning, and custom workstation consultation.',
    },
    {
      icon: <Award className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-50 border-rose-200/60',
      title: 'Price Match Promise',
      description:
        'Get the best showroom value on all flagship electronics with our transparent, competitive pricing policy.',
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-500" />,
      bg: 'bg-cyan-50 border-cyan-200/60',
      title: 'Physical & Digital Showroom',
      description:
        'Experience hands-on product testing at our Silicon Valley flagship showroom or order online seamlessly.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 px-3 py-1 rounded-full text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
            <span>The VOLTEDGE Standard</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans'] mb-4">
            Why Choose VOLTEDGE Electronics
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We are dedicated to elevating tech retail into a premium, transparent, and customer-first showroom experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-13 h-13 w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${feat.bg} group-hover:scale-110 transition-transform`}
                >
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
