/**
 * Travel Page Component
 * 
 * Travel experiences and information including:
 * - Travel stories
 * - Photo galleries
 * - Destination guides
 * - Travel tips
 * 
 * Features:
 * - Image optimization
 * - Gallery view
 * - Location mapping
 * - Interactive content
 * - Dark mode support
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';

const Travel = ({ setCurrentPage }) => {
  const navigate = useNavigate();

  const travelArticles = [
    {
      id: 'northeast-india-2024',
      title: 'Northeast India',
      date: 'January 2024',
      description: 'A journey through the cleanest state of India and the living root bridges.',
      imageUrl: '/images/travel/northeast-india/cover.jpg',
      tags: ['Meghalaya', 'Assam', 'Nature', 'Culture'],
      path: '/northeast-india',
      status: 'published'
    },
    // More articles will be added here as you travel
  ];

  const handleArticleClick = (path) => {
    navigate(path);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Travel Stories</h2>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Join me on my journeys as I explore different parts of the world, 
            sharing experiences, photographs, and travel tips along the way.
          </p>
        </div>

        {/* Travel Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {travelArticles.map((article) => (
            <div 
              key={article.id}
              onClick={() => handleArticleClick(article.path)}
              className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
                {article.status === 'coming-soon' ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Images Coming Soon
                    </span>
                  </div>
                ) : (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>{article.date}</span>
                  {article.status === 'coming-soon' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {article.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Future Travels Section */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Future Adventures
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Stay tuned for more travel stories! I'll be adding new articles about my adventures 
            and experiences from different parts of the world.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Travel;
