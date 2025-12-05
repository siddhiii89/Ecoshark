import React from "react";
import { FiUserPlus, FiCamera, FiGift, FiSmile } from "react-icons/fi";

const steps = [
  {
    icon: FiUserPlus,
    title: "Create your account",
    text: "Sign up with your email to start sharing and discovering free items.",
  },
  {
    icon: FiCamera,
    title: "Upload and analyze",
    text: "Take a clear photo, let our AI help you describe the item, and fill in a few details.",
  },
  {
    icon: FiGift,
    title: "Share with your community",
    text: "Post your item so neighbors can find it and request to pick it up.",
  },
  {
    icon: FiSmile,
    title: "Celebrate the impact",
    text: "You’ve just saved something from going to waste and helped someone in need.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8 soft-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900">How EcoShare Works</h1>
          <p className="mt-3 text-base sm:text-lg text-emerald-800 max-w-2xl mx-auto">
            EcoShare makes it simple to pass on items you no longer need and discover pre-loved treasures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {steps.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-emerald-100 p-5 soft-scale-hover flex flex-col items-start gap-3"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-emerald-900">{title}</h2>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-7 soft-scale-hover">
          <h2 className="text-lg font-semibold text-emerald-900 mb-2">Tips for great donations</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Clean items before you photograph and post them.</li>
            <li>Mention any small defects honestly so people know what to expect.</li>
            <li>Choose safe, public, or mutually agreed locations for handovers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
