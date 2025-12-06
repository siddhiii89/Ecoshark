// src/components/DonateForm.jsx
import React, { useState } from "react";

export default function DonateForm({ defaultTitle, defaultDescription, defaultCategory, descriptionSuggestions, onCancel, onSubmit, disabled }) {
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState(defaultDescription || "");
  const [category, setCategory] = useState(defaultCategory || "");
  const [condition, setCondition] = useState("Fair");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please add a title for your item.");
      return;
    }
    if (!description || description.trim().length < 30) {
      alert("Please enter at least 30 characters describing the item and its condition.");
      return;
    }
    if (!category.trim()) {
      alert("Please specify a category (e.g. Clothes, Electronics).");
      return;
    }
    if (zip && !/^\d{6}$/.test(zip.trim())) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }
    onSubmit({
      title,
      description,
      category,
      condition,
      age,
      location: { city, zip }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{marginTop:12}}>
      <h3>Donate — edit details</h3>
      <div className="form-row">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Description</label>
        {descriptionSuggestions && descriptionSuggestions.length > 0 && (
          <div className="small-muted" style={{ marginBottom: 4 }}>
            You can start from one of these auto-generated descriptions and then edit it in your own words:
          </div>
        )}
        {descriptionSuggestions && descriptionSuggestions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 }}>
            {descriptionSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="secondary-btn"
                style={{ textAlign: "left", whiteSpace: "normal" }}
                onClick={() => setDescription(s)}
              >
                Use suggestion {idx + 1}
              </button>
            ))}
          </div>
        )}
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Condition</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option>New</option>
          <option>Good</option>
          <option>Fair</option>
          <option>For parts</option>
        </select>
      </div>
      <div className="form-row">
        <label>How old is the product</label>
        <select value={age} onChange={(e)=>setAge(e.target.value)}>
          <option value="">Select</option>
          <option>&lt;6 months</option>
          <option>1 year</option>
          <option>2 years</option>
          <option>3+ years</option>
        </select>
      </div>
      <div className="form-row">
        <label>Location</label>
        <div style={{display:'flex', gap:8}}>
          <input placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} />
          <input placeholder="ZIP" value={zip} onChange={(e)=>setZip(e.target.value)} />
        </div>
      </div>

      <div style={{marginTop:10, display:"flex", gap:8}}>
        <button className="primary-btn" type="submit" disabled={disabled}>Share for Donation</button>
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
