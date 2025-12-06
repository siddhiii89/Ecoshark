import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGift, FiHeart, FiShield, FiSearch } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    name: 'Share Freely',
    description: 'Give your pre-loved items a second life by sharing them with others in your community.',
    icon: <FiGift className="h-8 w-8 text-green-500" />,
  },
  {
    name: 'Discover Treasures',
    description: 'Find amazing items shared by people in your local area, all for free!',
    icon: <FiSearch className="h-8 w-8 text-green-500" />,
  },
  {
    name: 'Build Community',
    description: 'Connect with like-minded individuals who care about sustainability.',
    icon: <FiHeart className="h-8 w-8 text-green-500" />,
  },
  {
    name: 'Eco-Friendly',
    description: 'Reduce waste and help the environment by reusing items instead of discarding them.',
    icon: <FiShield className="h-8 w-8 text-green-500" />,
  },
];

const stats = [
  { label: 'Items Shared', value: '1,000+' },
  { label: 'Active Users', value: '500+' },
  { label: 'Communities', value: '50+' },
  { label: 'Carbon Saved', value: '5,000+ kg' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-200 via-teal-100 to-sky-200 overflow-hidden soft-fade-in-up">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-emerald-200/60 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-emerald-900 sm:text-5xl md:text-6xl">
                  <span className="block">Give More,</span>
                  <span className="block text-green-100">Waste Less</span>
                </h1>
                <p className="mt-3 text-base text-emerald-800 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join our community of eco-conscious individuals sharing and finding free items to reduce waste and build sustainable communities.
                </p>
                <div className="mt-10 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="rounded-md shadow soft-scale-hover">
                    <Link
                      to="/listings"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-900 bg-white hover:bg-emerald-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      Browse Listings
                      <FiArrowRight className="ml-2 -mr-1 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="rounded-md shadow soft-scale-hover">
                    <Link
                      to="/share"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-900 bg-emerald-200 hover:bg-emerald-300 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      Share an Item
                      <FiArrowRight className="ml-2 -mr-1 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="/image.png"
            alt="Eco-friendly products and sustainable living"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-green-600">Join our growing community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              {user ? (
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Go to Listings
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Get started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 soft-fade-in-up-slow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to share and find items
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              EcoShare makes it easy to give away items you no longer need and find items you're looking for, all while helping the environment.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 bg-opacity-10 text-white">
                    {feature.icon}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by people in your community
            </h2>
            <p className="mt-3 text-xl text-green-100 sm:mt-4">
              Join thousands of users who are making a difference by sharing and reusing items.
            </p>
          </div>
          <div className="mt-10 text-center">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="px-6">
                  <div className="text-4xl font-extrabold text-white">{stat.value}</div>
                  <div className="mt-2 text-base font-medium text-green-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-green-600">Start sharing or finding items today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <div className="inline-flex rounded-md shadow">
              {user ? (
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Sign up for free
                </Link>
              )}
            </div>
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="bg-emerald-50 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-emerald-900 mb-2">Contact Us</h2>
            <p className="text-emerald-800 mb-4">
              Have questions, feedback, or ideas for EcoShare? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:ecoshareplanet@gmail.com"
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
            >
              ecoshareplanet@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
