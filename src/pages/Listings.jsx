import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FiSearch, FiFilter, FiMapPin, FiClock, FiTag, FiPlusCircle } from "react-icons/fi";

// Categories for filtering
const categories = [
  'All',
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Toys',
  'Kitchen',
  'Other'
];

// Helper to safely convert createdAt from either Firestore Timestamp or ISO/date string
const toJsDate = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp === 'string' || timestamp instanceof Date) return new Date(timestamp);
  // Firestore Timestamp case
  if (timestamp?.toDate) return timestamp.toDate();
  return null;
};

// Helper function to format date (supports Firestore Timestamp and ISO string)
const formatDate = (timestamp) => {
  const date = toJsDate(timestamp);
  if (!date || isNaN(date)) return 'Recently';
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch items from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error("Error fetching listings: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort items based on search, category, and sort preference
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const dateA = toJsDate(a.createdAt);
      const dateB = toJsDate(b.createdAt);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      if (sortBy === 'newest') {
        return dateB - dateA;
      } else if (sortBy === 'oldest') {
        return dateA - dateB;
      }
      return 0;
    });
  }, [items, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Items in Your Community
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover items shared by people in your area
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-emerald-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for items..."
                className="block w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center">
              <FiFilter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 sm:text-sm rounded-md bg-emerald-50/40"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-emerald-900">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </h2>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link 
                to={`/listings/${item.id}`} 
                key={item.id} 
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden soft-scale-hover"
              >
                <div className="relative pb-2/3 h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {item.category || 'General'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span>{item.location?.city || 'Location not specified'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.condition && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.condition}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'There are currently no items listed. Check back later or share an item!'}
            </p>
            {!searchTerm && selectedCategory === 'All' && (
              <div className="mt-6">
                <Link
                  to="/share"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiPlusCircle className="-ml-1 mr-2 h-5 w-5" />
                  Share an Item
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
