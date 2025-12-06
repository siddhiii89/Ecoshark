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

  // Per-label cycling tips
  const TIPS = {
    Shoes: {
      reuse: [
        "Clean and donate shoes in good condition to shelters or drives.",
        "Repurpose old shoes as planters for your garden.",
        "Use worn-out shoes for creative art projects."
      ],
      recycle: [
        "Check if your local recycling center accepts shoes for material recovery.",
        "Some brands accept shoes for recycling—ask at the store.",
        "Remove laces and non-recyclable parts before recycling."
      ],
      donate: [
        "Bundle shoes in pairs and mention size/condition in your listing.",
        "Donate shoes to community drives or friends in need.",
        "Offer shoes to local sports clubs or schools."
      ]
    },
    Clothes: {
      reuse: [
        "Repair small tears or missing buttons before reuse.",
        "Turn old t-shirts into cleaning rags.",
        "Use fabric scraps for DIY crafts."
      ],
      recycle: [
        "Textile recycling centers accept damaged clothing for insulation or rags.",
        "Check for clothing drop-off bins in your area.",
        "Remove zippers and buttons before recycling."
      ],
      donate: [
        "Donate to local charities, shelters, or community groups.",
        "Organize a clothing swap with friends.",
        "List gently used clothes online for free pickup."
      ]
    },
    Plastic: {
      reuse: [
        "Reuse sturdy containers for storage or organizing.",
        "Use bottles for DIY watering cans.",
        "Make bird feeders from old plastic bottles."
      ],
      recycle: [
        "Rinse and check local rules for accepted plastic types.",
        "Remove caps and flatten bottles to save space.",
        "Recycle clean plastic at curbside or drop-off locations."
      ],
      donate: [
        "Donate clean, useful plastic items to community centers.",
        "Offer storage bins or organizers online.",
        "Only donate plastic items in very good condition."
      ]
    },
    Paper: {
      reuse: [
        "Use paper for notes, crafts, or wrapping gifts.",
        "Shred old paper for pet bedding.",
        "Reuse envelopes for mailing or storage."
      ],
      recycle: [
        "Keep paper dry and free of food stains before recycling.",
        "Recycle newspapers, magazines, and office paper curbside.",
        "Remove staples and clips before recycling."
      ],
      donate: [
        "Offer clean paper to schools for art projects.",
        "Donate cardboard boxes to people who are moving.",
        "Give unused notebooks to local organizations."
      ]
    },
    Cardboard: {
      reuse: [
        "Reuse boxes for storage or shipping.",
        "Use cardboard for DIY organizers or crafts.",
        "Lay cardboard in your garden to suppress weeds."
      ],
      recycle: [
        "Flatten boxes before recycling to save space.",
        "Keep cardboard dry and free of food residue.",
        "Recycle at curbside or drop-off locations."
      ],
      donate: [
        "Offer clean boxes to local shops or movers.",
        "Donate sturdy boxes to community centers.",
        "Post on community boards for free pickup."
      ]
    },
    "Brown-glass": {
      reuse: [
        "Use jars and bottles for storage or vases.",
        "Make candle holders from glass jars.",
        "Create DIY lanterns for your home."
      ],
      recycle: [
        "Remove caps and rinse glass before recycling.",
        "Sort glass by color if required locally.",
        "Recycle at bottle banks or curbside."
      ],
      donate: [
        "Donate decorative glass to thrift stores.",
        "Offer glassware to local artists for reuse.",
        "Give away jars for home canning."
      ]
    },
    "Green-glass": {
      reuse: [
        "Use for crafts or garden décor.",
        "Repurpose bottles as flower vases.",
        "Store dry goods in clean glass jars."
      ],
      recycle: [
        "Rinse and recycle at glass collection points.",
        "Remove labels before recycling if possible.",
        "Sort by color if your area requires."
      ],
      donate: [
        "Donate colored glass bottles to artists.",
        "Offer to local schools for art projects.",
        "Give away for upcycling crafts."
      ]
    },
    "White-glass": {
      reuse: [
        "Use clear jars for food storage.",
        "Make snow globes from glass jars.",
        "Create terrariums using wide-mouth jars."
      ],
      recycle: [
        "Rinse and recycle with other clear glass.",
        "Sort by color if needed.",
        "Recycle at bottle banks or curbside."
      ],
      donate: [
        "Donate clear glass to thrift shops.",
        "Offer jars to local gardeners.",
        "Give away for science projects."
      ]
    },
    Battery: {
      reuse: [
        "Recharge batteries if possible.",
        "Use old batteries for low-power devices.",
        "Store used batteries safely for recycling."
      ],
      recycle: [
        "Take batteries to certified drop-off points.",
        "Never throw batteries in regular trash.",
        "Check for battery recycling events locally."
      ],
      donate: [
        "Donate only new, unused batteries.",
        "Do not donate used batteries.",
        "Donate devices with installed batteries if still working."
      ]
    },
    Metal: {
      reuse: [
        "Repurpose metal containers for storage.",
        "Use metal scraps for DIY repairs.",
        "Create garden markers from metal pieces."
      ],
      recycle: [
        "Take clean metal to scrap yards.",
        "Recycle aluminum cans curbside.",
        "Remove non-metal parts before recycling."
      ],
      donate: [
        "Donate usable metal tools or cookware.",
        "Offer metal racks to community centers.",
        "Give away metal parts for recycling projects."
      ]
    },
    Biological: {
      reuse: [
        "Compost suitable organic waste.",
        "Use food scraps for animal feed if safe.",
        "Create natural fertilizers from composted waste."
      ],
      recycle: [
        "Compost at home or use municipal programs.",
        "Separate meat and dairy if required.",
        "Use compost bins for garden waste."
      ],
      donate: [
        "Do not donate biological waste.",
        "Donate only safe, non-perishable food.",
        "Focus on composting or proper disposal."
      ]
    },
    Trash: {
      reuse: [
        "Repurpose parts before disposal.",
        "Use trash for art or upcycling projects.",
        "Check if any components can be reused."
      ],
      recycle: [
        "Separate recyclable components before discarding.",
        "Check local rules for hazardous waste.",
        "Dispose of trash responsibly."
      ],
      donate: [
        "Items classified as trash are not suitable for donation.",
        "Donate only usable, safe items.",
        "Offer parts for upcycling if possible."
      ]
    },
    default: {
      reuse: [
        "If the item is in good shape, consider giving it a second life at home or with a friend.",
        "Get creative with upcycling ideas for this item.",
        "Check online for reuse inspiration."
      ],
      recycle: [
        "Check your local recycling guide for this item.",
        "Ask your municipality about recycling options.",
        "See if any parts can be recycled."
      ],
      donate: [
        "Donate through EcoShare or a local charity.",
        "List the item online for free pickup.",
        "Offer to friends or family."
      ]
    }
  };

  // Cycling tip state
  const [tipIndexes, setTipIndexes] = useState({});

  // When prediction changes, cycle the tip index for that label
  useEffect(() => {
    if (prediction && prediction.label) {
      setTipIndexes(prev => {
        const next = { ...prev };
        const label = prediction.label;
        // For each type, increment index mod tip count
        ["reuse", "recycle", "donate"].forEach(type => {
          const arr = (TIPS[label] && TIPS[label][type]) || TIPS.default[type];
          const prevIdx = prev[label + type] || 0;
          next[label + type] = (prevIdx + 1) % arr.length;
        });
        return next;
      });
    }
  }, [prediction]);

  // Helper to get the cycling tip
  const getCyclingTip = (label, type) => {
    const arr = (TIPS[label] && TIPS[label][type]) || TIPS.default[type];
    const idx = tipIndexes[label + type] || 0;
    return arr[idx];
  };


  const handleCreatePost = async (formData) => {
    if (!file) { alert("No image to upload"); return; }
    setIsPosting(true);
    try {
      const ai = prediction ? { label: prediction.label, confidence: prediction.confidence } : null;
      const res = await uploadImageAndCreatePost(file, formData, userId, userEmail, ai);
      window.alert("Item successfully listed");
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
              <p>{getCyclingTip(prediction.label, "reuse")}</p>
            </div>
            <div className="card">
              <h4>Recycle</h4>
              <p>{getCyclingTip(prediction.label, "recycle")}</p>
            </div>
            <div className="card">
              <h4>Donate</h4>
              <p>{getCyclingTip(prediction.label, "donate")}</p>
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
