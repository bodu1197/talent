import { HelpCircle } from 'lucide-react';

interface FAQ {
  readonly question: string;
  readonly answer: string;
}

interface FAQSectionProps {
  readonly faqs: FAQ[];
  readonly title?: string;
}

export default function FAQSection({ faqs, title = '자주 묻는 질문' }: FAQSectionProps) {
  return (
    <section className="py-10 md:py-12">
      <div className="container-1200 px-4">
        <h2 className="text-lg md:text-xl font-bold text-center mb-6">{title}</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">{faq.question}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
