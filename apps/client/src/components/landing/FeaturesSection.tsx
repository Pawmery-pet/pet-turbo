import { Card } from '@/components/ui/Card';
import { landingData } from '@/data/landingData';

export function FeaturesSection() {
  const { features } = landingData;
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Pawmery helps you preserve precious memories and maintain the beautiful bond with your beloved pets
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center group">
              {/* Icon */}
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative element */}
              <div className="mt-6 w-12 h-1 bg-orange-500 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Card>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Ready to start your journey?</p>
          <div className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700 cursor-pointer">
            Learn more about our features
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}