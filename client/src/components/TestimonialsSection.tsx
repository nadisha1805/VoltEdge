import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
            <span>Verified Customer Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans'] mb-3">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Read authentic feedback from creators, developers, and audiophiles who trust VOLTEDGE Electronics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card flex flex-col justify-between relative"
            >
              <Quote className="w-8 h-8 text-brand-blue/15 absolute top-5 right-5" />

              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold text-xs">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-brand-navy">{item.name}</h4>
                    {item.verifiedPurchase && (
                      <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {item.role && <p className="text-[11px] text-slate-400">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
