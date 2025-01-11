import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Home, BookOpen, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ComicReader = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);

  // Sample comic data - in a real app this would come from an API/database
  const sampleComic = {
    title: "Sample Comic",
    pages: [
      "/api/placeholder/800/1200",
      "/api/placeholder/800/1200",
      "/api/placeholder/800/1200"
    ],
    totalPages: 3,
    author: "Comic Artist",
    description: "An exciting comic adventure"
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(sampleComic.totalPages - 1, prev + 1));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 20));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 20));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Home className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <h1 className="text-xl font-bold">{sampleComic.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <BookOpen className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <Heart className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <Share2 className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            {/* Comic Viewer */}
            <div className="relative">
              {/* Navigation Controls */}
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === sampleComic.totalPages - 1}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Comic Page */}
              <div className="flex justify-center">
                <img
                  src={sampleComic.pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  style={{ width: `${zoom}%`, maxWidth: '100%', transition: 'width 0.3s ease' }}
                  className="rounded-lg shadow-lg"
                />
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {sampleComic.totalPages}
              </span>
              <input
                type="range"
                min="0"
                max={sampleComic.totalPages - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Comic Information */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">{sampleComic.title}</h2>
            <p className="text-gray-600 mb-2">By {sampleComic.author}</p>
            <p className="text-gray-700">{sampleComic.description}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComicReader;