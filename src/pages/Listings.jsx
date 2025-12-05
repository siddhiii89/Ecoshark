import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setItems(arr);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4">Latest Donations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link to={`/listings/${item.id}`} key={item.id} className="bg-white p-3 rounded-md border hover:shadow">
            <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded" />
            <div className="mt-2 font-medium">{item.title}</div>
            <div className="text-sm text-gray-600">{item.age || "N/A"} • {item.location?.city || ""} {item.location?.zip || ""}</div>
            <div className="text-xs text-gray-500">{item.category || ""}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
