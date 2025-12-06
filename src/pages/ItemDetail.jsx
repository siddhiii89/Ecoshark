import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setItem(data);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-300" /></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-gray-500">Not found</div>;

  const mailto = item.userEmail ? `mailto:${encodeURIComponent(item.userEmail)}?subject=${encodeURIComponent('Interested in ' + (item.title || 'your donation'))}` : null;

  return (
    <div className="min-h-screen bg-emerald-50/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-6 lg:p-8 soft-fade-in-up shadow-md">
          <img src={item.imageUrl} alt={item.title} className="w-full max-h-[420px] object-contain rounded-xl bg-emerald-50" />
          <h1 className="text-2xl font-semibold mt-4 text-emerald-900">{item.title}</h1>
          <p className="text-gray-700 mt-2">{item.description}</p>
        <div className="mt-2 text-sm text-gray-600">Age: {item.age || 'N/A'}</div>
        <div className="mt-1 text-sm text-gray-600">Location: {item.location?.city || ''} {item.location?.zip || ''}</div>
        <div className="mt-1 text-sm text-gray-600">Category: {item.category || ''} • Condition: {item.condition || ''}</div>
        {item.ai?.label && (
          <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
            AI: {item.ai.label} ({item.ai.confidence ? Math.round(item.ai.confidence * 100) : 0}% confidence)
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {mailto ? (
            <a href={mailto} className="inline-flex items-center px-4 py-2 rounded-md text-emerald-900 bg-emerald-200 hover:bg-emerald-300 soft-scale-hover">
              Contact Donor
            </a>
          ) : (
            <button className="border px-4 py-2 rounded-md text-gray-400 cursor-not-allowed" disabled>
              Contact not available
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
