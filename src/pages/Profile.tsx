import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, BookIcon, PrinterIcon, MailIcon } from 'lucide-react';
export const Profile = () => {
  // Mock user data
  const user = {
    name: 'Alex',
    stories: [{
      id: 1,
      title: "The Dragon's Cave",
      date: 'June 5, 2023',
      image: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }, {
      id: 2,
      title: 'Space Adventure',
      date: 'May 22, 2023',
      image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }, {
      id: 3,
      title: 'The Magical Forest',
      date: 'April 10, 2023',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }]
  };
  return <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          {user.name}'s Stories
        </h1>
        <p className="text-gray-600 mb-6">
          Here are all the magical stories you've created!
        </p>
        <Link to="/create" className="inline-flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 transition-colors">
          <PlusIcon size={18} />
          <span>Create New Story</span>
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user.stories.map(story => <div key={story.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img src={story.image} alt={story.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-purple-600 mb-1">
                {story.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Created on {story.date}
              </p>
              <div className="flex justify-between">
                <Link to={`/story/${story.id}`} className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1">
                  <BookIcon size={16} />
                  <span>Read</span>
                </Link>
                <div className="flex gap-2">
                  <button className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    <MailIcon size={16} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <PrinterIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
};