import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "donations", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!item) return <div className="p-4">Not found</div>;

  const mailto = item.userEmail ? `mailto:${encodeURIComponent(item.userEmail)}?subject=${encodeURIComponent('Interested in ' + (item.title || 'your donation'))}` : null;

  return (
    <div className="py-6">
      <div className="bg-white border rounded-md p-4">
        <img src={item.imageUrl} alt={item.title} className="w-full max-h-[420px] object-contain rounded" />
        <h1 className="text-2xl font-semibold mt-3">{item.title}</h1>
        <p className="text-gray-700 mt-2">{item.description}</p>
        <div className="mt-2 text-sm text-gray-600">Age: {item.age || 'N/A'}</div>
        <div className="mt-1 text-sm text-gray-600">Location: {item.location?.city || ''} {item.location?.zip || ''}</div>
        <div className="mt-1 text-sm text-gray-600">Category: {item.category || ''} • Condition: {item.condition || ''}</div>
        {item.ai?.label && (
          <div className="mt-3 text-sm text-gray-700">AI: {item.ai.label} ({item.ai.confidence ? Math.round(item.ai.confidence * 100) : 0}% confidence)</div>
        )}
        <div className="mt-4">
          {mailto ? (
            <a href={mailto} className="bg-green-700 text-white px-4 py-2 rounded-md">Contact Donor</a>
          ) : (
            <button className="border px-4 py-2 rounded-md" disabled>Contact not available</button>
          )}
        </div>
      </div>
    </div>
  );
}
