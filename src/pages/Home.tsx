import { Link } from 'react-router-dom';
import { BookOpenIcon, PenToolIcon, MicIcon, SparklesIcon, StarIcon, CrownIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="animate-float inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl">
            <BookOpenIcon size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-display text-purple-600 mb-4">
          Robyn Reads
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 font-body">
          Create amazing stories using your voice and imagination!
          Tell your own magical tales with a little help from Robyn.
        </p>
        <Link
          to={user ? '/create' : '/login'}
          className="inline-flex items-center gap-2 py-4 px-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-bold rounded-2xl shadow-xl hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-105 font-body"
        >
          <SparklesIcon size={24} />
          {user ? 'Start a New Story' : 'Get Started Free'}
        </Link>
      </section>

      {/* How it Works */}
      <section className="py-12 px-4 bg-white rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-display text-center text-purple-600 mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <StarIcon size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-body">Choose</h3>
            <p className="text-gray-600 font-body text-sm">Pick your characters, where they are, and what adventure they go on</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpenIcon size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-body">Read</h3>
            <p className="text-gray-600 font-body text-sm">Robyn creates the beginning of your story to get you started</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <PenToolIcon size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-body">Create</h3>
            <p className="text-gray-600 font-body text-sm">Continue the story by typing or using your voice to record</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MicIcon size={32} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-body">Share</h3>
            <p className="text-gray-600 font-body text-sm">Finish your book with a cover and share it with everyone!</p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-12 px-4 mb-12">
        <h2 className="text-3xl font-display text-center text-purple-600 mb-10">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            <h3 className="text-2xl font-display text-gray-700 mb-4">Free</h3>
            <p className="text-4xl font-bold text-gray-800 mb-6 font-body">Free</p>
            <ul className="space-y-3 mb-8 font-body text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">&#10003;</span> Up to 2 characters per story
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">&#10003;</span> Save up to 3 stories
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">&#10003;</span> Images in stories
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">&#10003;</span> Voice recording
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>&#10007;</span> Print to real book
              </li>
            </ul>
            <Link
              to={user ? '/create' : '/login'}
              className="block text-center py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors font-body"
            >
              {user ? 'Create Story' : 'Get Started Free'}
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <CrownIcon size={32} className="text-yellow-300" />
            </div>
            <h3 className="text-2xl font-display mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-6 font-body">Coming Soon</p>
            <ul className="space-y-3 mb-8 font-body">
              <li className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">&#10003;</span> Up to 5 characters per story
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">&#10003;</span> Unlimited saved stories
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">&#10003;</span> Longer story formats
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">&#10003;</span> All free features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold">&#10003;</span> Print & ship via Amazon KDP
              </li>
            </ul>
            <button
              disabled
              className="block w-full text-center py-3 px-6 bg-white/20 text-white font-bold rounded-xl cursor-not-allowed font-body"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 text-center mb-8">
        <h2 className="text-3xl font-display text-purple-600 mb-4">
          Ready to Tell Your Story?
        </h2>
        <p className="text-gray-600 font-body mb-6 max-w-lg mx-auto">
          Every great author started with "Once upon a time..." — now it's your turn!
        </p>
        <Link
          to={user ? '/create' : '/login'}
          className="inline-flex items-center gap-2 py-4 px-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-bold rounded-2xl shadow-xl hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-105 font-body"
        >
          <PenToolIcon size={24} />
          {user ? 'Create a Story Now' : 'Login to Get Started'}
        </Link>
      </section>
    </div>
  );
};
