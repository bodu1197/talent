
import React, { useEffect } from 'react';
import Card from './components/Card';
import { cardData } from './constants';

// Make TypeScript aware of the global `lucide` object from the CDN
declare const lucide: {
  createIcons: () => void;
};

const App: React.FC = () => {
  useEffect(() => {
    // This function finds all elements with `data-lucide` attributes and replaces them with SVG icons.
    // It needs to be called after the components are rendered to the DOM.
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, []);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="relative isolate w-full">
        {/* Background gradient shapes */}
        <div
          className="fixed inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:overflow-visible md:pb-0 md:snap-none hide-scrollbar">
            {cardData.map((data, index) => (
              <div key={data.id} className="w-[85vw] max-w-sm flex-shrink-0 md:w-auto snap-center">
                <Card
                  title={data.title}
                  icon={data.icon}
                  listItems={data.listItems}
                  description={data.description}
                  theme={data.theme}
                  animationDelay={`${index * 100}ms`}
                />
              </div>
            ))}
          </div>
        </main>
        
        <div
            className="fixed inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
        >
            <div
                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                style={{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
            />
        </div>
      </div>
    </div>
  );
};

export default App;