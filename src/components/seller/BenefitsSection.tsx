import type { LucideIcon } from 'lucide-react';

interface Benefit {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

interface BenefitsSectionProps {
  readonly benefits: Benefit[];
  readonly gridClassName?: string;
}

export default function BenefitsSection({
  benefits,
  gridClassName = 'grid-cols-2 md:grid-cols-4',
}: BenefitsSectionProps) {
  return (
    <section className="py-8 bg-white border-b">
      <div className="container-1200 px-4">
        <div className={`grid ${gridClassName} gap-4 md:gap-6`}>
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-0.5">{benefit.title}</h3>
              <p className="text-xs text-gray-500 hidden md:block">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
