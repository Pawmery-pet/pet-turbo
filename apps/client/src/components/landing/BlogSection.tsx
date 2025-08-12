import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { landingData } from '@/data/landingData';

export function BlogSection() {
  const { blog } = landingData;
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Memory Tips & Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover helpful tips, heartwarming stories, and guidance on preserving precious memories with your beloved pets
          </p>
        </div>
        
        {/* Blog posts grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {blog.map((post, index) => (
            <Card key={index} hover padding="none" className="overflow-hidden group">
              {/* Post image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Post content */}
              <div className="p-6">
                {/* Meta information */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span className="text-orange-600 font-medium">{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{post.date}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                
                {/* Read more link */}
                <Link 
                  href={post.href}
                  className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700 transition-colors duration-200"
                >
                  Read more
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </Card>
          ))}
        </div>
        
        {/* View all posts link */}
        <div className="text-center mt-12">
          <Link 
            href="#"
            className="inline-flex items-center bg-orange-50 text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-100 transition-colors duration-200"
          >
            View All Posts
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}