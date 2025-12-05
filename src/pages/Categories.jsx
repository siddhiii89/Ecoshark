import React from "react";
import { useNavigate } from "react-router-dom";
import { FiMonitor, FiHome, FiBook, FiTShirt, FiSmile, FiCoffee } from "react-icons/fi";

const categories = [
  { key: "Electronics", icon: FiMonitor, desc: "Laptops, phones, gadgets & more" },
  { key: "Furniture", icon: FiHome, desc: "Chairs, tables, shelves, decor" },
  { key: "Books", icon: FiBook, desc: "Novels, textbooks, magazines" },
  { key: "Clothing", icon: FiTShirt, desc: "Clothes, shoes, accessories" },
  { key: "Toys", icon: FiSmile, desc: "Toys, games, puzzles" },
  { key: "Kitchen", icon: FiCoffee, desc: "Cookware, dishes, appliances" },
];

export default function Categories() {
  const navigate = useNavigate();

  const goToCategory = (category) => {
    navigate(`/listings?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900">Browse by Category</h1>
          <p className="mt-3 text-base sm:text-lg text-emerald-800 max-w-2xl mx-auto">
            Tap a category to quickly see items that match what you’re looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map(({ key, icon: Icon, desc }) => (
            <button
              key={key}
              onClick={() => goToCategory(key)}
              className="bg-white rounded-2xl border border-emerald-100 p-5 text-left soft-scale-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-emerald-900">{key}</h2>
              <p className="mt-1 text-sm text-gray-700">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
