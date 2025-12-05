// src/components/ImageUploader.jsx
import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { WASTENET_LABELS, LABEL_TO_CATEGORY } from "../utils/labels";
import DonateForm from "./DonateForm";
import { uploadImageAndCreatePost } from "../services/firebaseService";
import { useNavigate } from "react-router-dom";

export default function ImageUploader({ userId, userEmail }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

  const imgRef = useRef();

  useEffect(() => {
    let mounted = true;
    const loadModel = async () => {
      setLoadingModel(true);
      try {
        let m;
        try {
          m = await tf.loadGraphModel("/tfjs_model/model.json");
        } catch (e) {
          m = await tf.loadLayersModel("/tfjs_model/model.json");
        }
        if (mounted) {
          setModel(m);
        }
      } catch (err) {
        console.error("Failed to load model", err);
        alert("Failed to load the TFJS model. Ensure /public/tfjs_model/model.json exists.");
      } finally {
        setLoadingModel(false);
      }
    };
    loadModel();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(null);
  };

  const preprocessImage = (imageElement) => {
    const t = tf.browser.fromPixels(imageElement).toFloat();
    const resized = tf.image.resizeBilinear(t, [224,224]);
    const normalized = resized.div(255.0);
    const batched = normalized.expandDims(0);
    return batched;
  };

  const runPrediction = async () => {
    if (!model) { alert("Model not loaded yet."); return; }
    if (!imgRef.current) { alert("Image not ready"); return; }
    try {
      const input = preprocessImage(imgRef.current);
      let out = model.predict(input);
      if (Array.isArray(out)) out = out[0];
      const scores = await out.data();
      let topIndex = 0;
      for (let i=1;i<scores.length;i++) if (scores[i] > scores[topIndex]) topIndex = i;
      const confidence = scores[topIndex];
      const label = WASTENET_LABELS[topIndex] || `label_${topIndex}`;
      const category = LABEL_TO_CATEGORY[label] || "Other";
      const recyclableLabels = new Set(["Brown-glass","Green-glass","White-glass","Paper","Cardboard","Plastic","Metal","Battery"]);
      const reusableLabels = new Set(["Clothes","Shoes","Cardboard","Paper"]);
      const reusable = reusableLabels.has(label);
      const recyclable = recyclableLabels.has(label);
      setPrediction({ label, confidence, category, reusable, recyclable });
    } catch (err) {
      console.error(err);
      alert("Prediction failed. See console.");
    }
  };

  const onDonateClick = () => setShowDonateForm(true);

  const handleCreatePost = async (formData) => {
    if (!file) { alert("No image to upload"); return; }
    setIsPosting(true);
    try {
      const ai = prediction ? { label: prediction.label, confidence: prediction.confidence } : null;
      const res = await uploadImageAndCreatePost(file, formData, userId, userEmail, ai);
      alert("Donation posted! ID: " + res.docId);
      setFile(null);
      setPreviewUrl(null);
      setPrediction(null);
      setShowDonateForm(false);
      navigate('/listings');
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div>
      <div className="form-row">
        <label className="small-muted">Upload a photo of the item</label>
        <input type="file" accept="image/*" onChange={onFileChange} />
        {previewUrl && <img ref={imgRef} src={previewUrl} alt="preview" className="preview" />}
        <div className="buttons">
          <button className="primary-btn" onClick={runPrediction} disabled={!previewUrl || loadingModel}>Analyze & Show Tips</button>
          <button className="secondary-btn" onClick={() => { setFile(null); setPreviewUrl(null); setPrediction(null);} }>Clear</button>
        </div>
      </div>

      {loadingModel && <div className="small-muted">Loading model...</div>}

      {prediction && (
        <div>
          <h3 style={{marginTop:12}}>Result</h3>
          <div className="card">
            <strong>{prediction.label}</strong> — {(prediction.confidence * 100).toFixed(0)}% confidence
            <div className="small-muted">Category: {prediction.category}</div>
          </div>

          <div className="tip-cards">
            <div className="card">
              <h4>Reuse</h4>
              <p>{prediction.reusable ? `This looks reusable. Consider cleaning and gifting or keeping it for reuse.` : `This item is not usually reused as-is. Consider repurposing parts or upcycling.`}</p>
            </div>
            <div className="card">
              <h4>Recycle</h4>
              <p>{prediction.recyclable ? `Likely recyclable — remove contaminants, batteries, and check local guidelines.` : `Not normally recyclable curbside. Try specialized centers.`}</p>
            </div>
            <div className="card">
              <h4>Donate</h4>
              <p>Donate to local community members. EcoShare will prefill a donation listing. Edit before posting.</p>
              <div style={{marginTop:8}}>
                <button className="primary-btn" onClick={onDonateClick}>Donate this item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDonateForm && (
        <DonateForm
          defaultTitle={`Donating: ${prediction ? prediction.label : "Item"}`}
          defaultDescription={`Auto suggestion: ${prediction ? prediction.label : ""}. Condition: ${prediction ? (prediction.reusable ? "Good" : "Fair") : "Not specified"}.`}
          defaultCategory={prediction ? prediction.category : ""}
          onCancel={() => setShowDonateForm(false)}
          onSubmit={handleCreatePost}
          disabled={isPosting}
        />
      )}
    </div>
  );
}
