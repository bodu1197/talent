
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedCategories from './components/FeaturedCategories';
import PlatformBenefits from './components/PlatformBenefits';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedCategories />
        <PlatformBenefits />
      </main>
      <Footer />
    </div>
  );
};

export default App;
