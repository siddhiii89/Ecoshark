import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function MyListings() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const q = query(collection(db, "donations"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setItems(arr);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const remove = async (id) => {
    await deleteDoc(doc(db, "donations", id));
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4">My Listings</h2>
      {items.length === 0 ? (
        <div className="text-gray-600">No listings yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-md border">
              <Link to={`/listings/${item.id}`}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded" />
                <div className="mt-2 font-medium">{item.title}</div>
                <div className="text-sm text-gray-600">{item.age || "N/A"} • {item.location?.city || ""} {item.location?.zip || ""}</div>
              </Link>
              <button className="mt-2 w-full border py-1.5 rounded-md" onClick={() => remove(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
