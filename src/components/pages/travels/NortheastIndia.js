import React, { useState } from 'react';
import PageWrapper from '../../layout/PageWrapper';

const NortheastIndia = ({ setCurrentPage }) => {
  const [viewMode, setViewMode] = useState('story');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const tripDetails = {
    title: "Northeast India Adventure: Exploring Assam and Meghalaya",
    subtitle: "A 7-day journey through the magnificent landscapes of Northeast India",
    duration: "November 9-16, 2024",
    overview: {
      duration: "7 days",
      route: "Bengaluru Guwahati → Shillong (and beyond)",
      arrangement: "AirGennie (travel agent for local transport and accommodation)",
      dietary: "Vegetarian"
    },
    photos: [
      {
        id: 'day1-1',
        url: '/images/travel/northeast-india/day1/Photo1.jpg',
        caption: 'Starting our journey at Bengaluru International Airport',
        day: 1
      },
      {
        id: 'day1-2',
        url: '/images/travel/northeast-india/day1/Photo2.jpg',
        caption: 'Views from the flight',
        day: 1
      },
      {
        id: 'day1-3',
        url: '/images/travel/northeast-india/day1/Photo3.jpg',
        caption: 'Delightful vegetarian lunch at Jiva Restaurant',
        day: 1
      },
      {
        id: 'day1-4',
        url: '/images/travel/northeast-india/day1/Photo4.jpg',
        caption: 'Scenic views of Umiam Lake',
        day: 1
      },
      {
        id: 'day1-5',
        url: '/images/travel/northeast-india/day1/Photo5.jpg',
        caption: 'Our speed boat adventure at Umiam Lake',
        day: 1
      },
      {
        id: 'day1-6',
        url: '/images/travel/northeast-india/day1/Photo6.jpg',
        caption: 'Evening views at Golf Links',
        day: 1
      }
    ]
  };

  const ViewModeSelector = () => (
    <div className="sticky top-[7rem] z-50 -mx-4 px-4 py-4">
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex items-center shadow-md">
          <button
            onClick={() => setViewMode('story')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'story'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Story + Photos
          </button>
          <button
            onClick={() => setViewMode('textonly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'textonly'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Story Only
          </button>
          <button
            onClick={() => setViewMode('journal')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'journal'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Photo Journal
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'gallery'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Gallery
          </button>
        </div>
      </div>
    </div>
  );

  const StoryContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
          As someone from Bengaluru venturing into the northeastern states of India, I was filled with both 
          excitement and slight apprehension, especially regarding our dietary preferences as vegetarians. 
          What unfolded was a beautiful journey that broke stereotypes and created lasting memories.
        </p>

        {/* Trip Overview */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Trip Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tripDetails.overview).map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize mr-2">
                  {key}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day 1 Content */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
            Day 1: Bengaluru to Shillong - A Journey of Pleasant Surprises
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Our northeastern adventure began early morning at Bengaluru International Airport. 
              The excitement was palpable as we prepared for our flight to Guwahati, the gateway to Northeast India.
            </p>

            <div className="my-6">
              <img
                src={tripDetails.photos[0].url}
                alt={tripDetails.photos[0].caption}
                className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(tripDetails.photos[0].url)}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {tripDetails.photos[0].caption}
              </p>
            </div>

            <p>
              The flight journey itself was quite scenic, offering us our first glimpses of the northeastern landscape.
            </p>

            <div className="my-6">
              <img
                src={tripDetails.photos[1].url}
                alt={tripDetails.photos[1].caption}
                className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(tripDetails.photos[1].url)}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {tripDetails.photos[1].caption}
              </p>
            </div>

            <h3>Breaking the Vegetarian Food Myth</h3>
            <p>
              One of our initial concerns was finding vegetarian food in the Northeast, as many had warned us 
              about the scarcity of vegetarian options. However, our first meal in the region at Jiva Veg 
              Restaurant completely dispelled this myth. The restaurant served delicious vegetarian dishes, 
              setting a positive tone for our culinary journey ahead.
            </p>

            <div className="my-6">
              <img
                src={tripDetails.photos[2].url}
                alt={tripDetails.photos[2].caption}
                className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(tripDetails.photos[2].url)}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {tripDetails.photos[2].caption}
              </p>
            </div>

            <h3>Umiam Lake: A Man-Made Marvel</h3>
            <p>
              Our first stop after lunch was the magnificent Umiam Lake, the largest artificial lake in the region. 
              We opted for a speed boat ride (₹600), which offered exhilarating views of the surrounding landscape. 
              The lake's vastness and the surrounding hills created a perfect backdrop for some memorable photographs.
            </p>

            <div className="grid grid-cols-1 gap-4 my-6">
              <div>
                <img
                  src={tripDetails.photos[3].url}
                  alt={tripDetails.photos[3].caption}
                  className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(tripDetails.photos[3].url)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {tripDetails.photos[3].caption}
                </p>
              </div>
              <div>
                <img
                  src={tripDetails.photos[4].url}
                  alt={tripDetails.photos[4].caption}
                  className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(tripDetails.photos[4].url)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {tripDetails.photos[4].caption}
                </p>
              </div>
            </div>

            <h3>Golf Links: A Green Paradise at Sunset</h3>
            <p>
              En route to our hotel in Shillong, we made a quick stop at Golf Links. Though we arrived during sunset, 
              the vast expanse of green was still a sight to behold. My wife Shubha particularly enjoyed our brief 
              walking tour of this historic golf course, even though it's no longer actively used for golfing.
            </p>

            <div className="my-6">
              <img
                src={tripDetails.photos[5].url}
                alt={tripDetails.photos[5].caption}
                className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(tripDetails.photos[5].url)}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {tripDetails.photos[5].caption}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg my-6">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Fun Fact:</strong> One of the most interesting discoveries of the day was the unique daylight 
                schedule in Meghalaya during November - sunrise around 5 AM and sunset as early as 4:30 PM! 
                Quite a contrast from what we're used to in South India.
              </p>
            </div>

            <h3>Night Stay at Lady Bird Hotel</h3>
            <p>
              We concluded our first day at Lady Bird Hotel in Shillong. After a long day of travel, we relished 
              a simple but satisfying dinner of Tawa Roti with Mixed Veg Curry before retiring for the night. 
              The hotel provided comfortable accommodation, setting us up well for the adventures ahead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const TextOnlyContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
          As someone from Bengaluru venturing into the northeastern states of India, I was filled with both 
          excitement and slight apprehension, especially regarding our dietary preferences as vegetarians. 
          What unfolded was a beautiful journey that broke stereotypes and created lasting memories.
        </p>

        {/* Trip Overview */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Trip Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tripDetails.overview).map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize mr-2">
                  {key}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day 1 Content */}
        <div>
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
            Day 1: Bengaluru to Shillong - A Journey of Pleasant Surprises
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Our northeastern adventure began early morning at Bengaluru International Airport. 
              The excitement was palpable as we prepared for our flight to Guwahati, the gateway to Northeast India.
            </p>

            <h3>Breaking the Vegetarian Food Myth</h3>
            <p>
              One of our initial concerns was finding vegetarian food in the Northeast, as many had warned us 
              about the scarcity of vegetarian options. However, our first meal in the region at Jiva Veg 
              Restaurant completely dispelled this myth. The restaurant served delicious vegetarian dishes, 
              setting a positive tone for our culinary journey ahead.
            </p>

            <h3>Umiam Lake: A Man-Made Marvel</h3>
            <p>
              Our first stop after lunch was the magnificent Umiam Lake, the largest artificial lake in the region. 
              We opted for a speed boat ride (₹600), which offered exhilarating views of the surrounding landscape. 
              The lake's vastness and the surrounding hills created a perfect backdrop for some memorable photographs.
            </p>

            <h3>Golf Links: A Green Paradise at Sunset</h3>
            <p>
              En route to our hotel in Shillong, we made a quick stop at Golf Links. Though we arrived during sunset, 
              the vast expanse of green was still a sight to behold. My wife Shubha particularly enjoyed our brief 
              walking tour of this historic golf course, even though it's no longer actively used for golfing.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg my-6">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Fun Fact:</strong> One of the most interesting discoveries of the day was the unique daylight 
                schedule in Meghalaya during November - sunrise around 5 AM and sunset as early as 4:30 PM! 
                Quite a contrast from what we're used to in South India.
              </p>
            </div>

            <h3>Night Stay at Lady Bird Hotel</h3>
            <p>
              We concluded our first day at Lady Bird Hotel in Shillong. After a long day of travel, we relished 
              a simple but satisfying dinner of Tawa Roti with Mixed Veg Curry before retiring for the night. 
              The hotel provided comfortable accommodation, setting us up well for the adventures ahead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const PhotoJournalContent = () => (
    <div className="space-y-8 animate-fade-in">
      {tripDetails.photos.filter(photo => photo.day === 1).map((photo) => (
        <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-[400px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(photo.url)}
          />
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300">{photo.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const GalleryContent = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
      {tripDetails.photos.map((photo) => (
        <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(photo.url)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <PageWrapper setCurrentPage={setCurrentPage}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Fixed Header Section */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-center mb-2 dark:text-gray-100">{tripDetails.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-2">{tripDetails.subtitle}</p>
          <p className="text-gray-500 dark:text-gray-500 text-center">{tripDetails.duration}</p>
        </div>
        
        {/* Sticky View Mode Selector */}
        <ViewModeSelector />
        
        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={closeModal}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Expanded view"
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="mt-8">
          {viewMode === 'story' && <StoryContent />}
          {viewMode === 'textonly' && <TextOnlyContent />}
          {viewMode === 'journal' && <PhotoJournalContent />}
          {viewMode === 'gallery' && <GalleryContent />}
        </div>
      </div>
    </PageWrapper>
  );
};

export default NortheastIndia;
