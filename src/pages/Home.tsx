import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, PenToolIcon, UserIcon } from 'lucide-react';
export const Home = () => {
  return <div className="w-full">
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
          Tell Your Stories with Robyn Reads
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Create amazing stories using your voice! Let your imagination run wild
          with Robyn Reads.
        </p>
        <Link to="/create" className="inline-block py-3 px-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-600 transition-colors">
          Start Your Story
        </Link>
      </section>
      <section className="py-12 px-4 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenToolIcon size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create</h3>
            <p className="text-gray-600">
              Tell us about your characters, where they are, and what they're
              doing
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Continue</h3>
            <p className="text-gray-600">
              We'll start your story, then you can write or record the rest
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share</h3>
            <p className="text-gray-600">
              Save your stories, share them with friends, or print them out
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 px-4 text-center mt-12">
        <h2 className="text-3xl font-bold text-purple-600 mb-6">
          Ready to Begin?
        </h2>
        <Link to="/login" className="inline-block py-3 px-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-600 transition-colors">
          Login to Get Started
        </Link>
      </section>
    </div>;
};