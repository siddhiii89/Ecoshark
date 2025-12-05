// src/services/firebaseService.js
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { storage, db } from "../firebase";

/**
 * Uploads image file to Firebase Storage and creates a Firestore document in 'donations' collection.
 * file: File from input
 * data: { title, description, category, condition, age, location: { city, zip } }
 * userId: optional
 * userEmail: optional donor email for mailto
 * ai: optional { label, confidence }
 */
export async function uploadImageAndCreatePost(file, data, userId = null, userEmail = null, ai = null) {
  if (!file) throw new Error("No file provided");
  const id = uuidv4();
  const path = `donation_images/${userId || "anon"}/${id}.jpg`;
  const sRef = storageRef(storage, path);
  await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(sRef, file);
    task.on('state_changed', undefined, reject, () => resolve());
  });
  const url = await getDownloadURL(sRef);

  const docRef = await addDoc(collection(db, "donations"), {
    title: data.title || "Donation",
    description: data.description || "",
    category: data.category || "",
    condition: data.condition || "Fair",
    age: data.age || "",
    location: {
      city: data.location?.city || "",
      zip: data.location?.zip || ""
    },
    imageUrl: url,
    createdAt: serverTimestamp(),
    is_for_sale: false,
    userId: userId || null,
    userEmail: userEmail || null,
    ai: ai || null
  });

  return { docId: docRef.id, url };
}
