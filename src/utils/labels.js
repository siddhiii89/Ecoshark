// src/utils/labels.js
export const WASTENET_LABELS = [
  "Battery","Biological","Brown-glass","Cardboard","Clothes","Green-glass",
  "Metal","Paper","Plastic","Shoes","Trash","White-glass"
];

// Map to friendly categories
export const LABEL_TO_CATEGORY = {
  "Battery": "Hazardous",
  "Biological": "Hazardous",
  "Brown-glass": "Glass",
  "Green-glass": "Glass",
  "White-glass": "Glass",
  "Cardboard": "Paper & Cardboard",
  "Paper": "Paper & Cardboard",
  "Clothes": "Clothing",
  "Shoes": "Clothing",
  "Plastic": "Plastic",
  "Metal": "Metal",
  "Trash": "Trash/Other"
};
