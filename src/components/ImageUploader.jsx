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
    setFile(e.target.files[0] || null);
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

  const getDescriptionSuggestions = () => {
    if (!prediction) {
      return [
        "Auto suggestion: Item. Condition: Not specified. Please describe what the item is, how it has been used, and mention any marks or issues so the next owner knows exactly what to expect.",
        "Auto suggestion: Item. A pre-loved piece that you no longer need but someone else could still use. Add details about size, material, brand and why you are giving it away.",
        "Auto suggestion: Item. Please write a short product-style description in your own words, including how old it is, overall condition, and anything the receiver should be careful about."
      ];
    }

    const label = prediction.label || "Item";
    const condition = prediction.reusable ? "Good" : "Fair";

    switch (label) {
      case "Shoes":
        return [
          `Auto suggestion: Shoes. Condition: ${condition}. A gently used pair of shoes that is still comfortable to wear, with normal signs of use but no major damage. Please mention the size, brand (if any), sole condition and any small marks or scuffs so the next owner knows exactly what to expect.`,
          `Auto suggestion: Casual/regular-use shoes in ${condition} condition. Ideal for daily wear, walking or college use. Describe whether they are sports shoes, sandals or formal shoes, how they fit you, and if there are any areas with extra wear such as the heel or inner lining.`,
          `Auto suggestion: Pre-loved footwear looking for a new home. Note the exact size, style (for example, sneakers, flats, sandals), how many months/years you have used them, and if they come with original laces/insoles so buyers can quickly decide if it suits them.`
        ];
      case "Clothes":
        return [
          `Auto suggestion: Clothes. Condition: ${condition}. A pre-loved clothing item that is still in wearable condition, with light signs of use. Please describe the type of garment (for example, t-shirt, kurta, jeans), size, fabric, fit and any stains, fading or loose threads so it feels like a clear product listing.`,
          `Auto suggestion: Everyday wear clothing item in ${condition} condition. Mention if it is more suitable for casual, office, festival or home use, and add details about colour, pattern and whether it has any noticeable wear around the neck, cuffs or hem.`,
          `Auto suggestion: Gently used apparel. Share the approximate age of the garment, washing/care preferences (machine wash/hand wash), and if there are any alterations or custom stitching so the next owner can decide comfortably.`
        ];
      case "Plastic":
        return [
          `Auto suggestion: Plastic item. Condition: ${condition}. A reusable plastic item that is still sturdy and functional. Please describe what it is used for (bottle, box, container, organizer), its size or capacity, and mention any scratches, discoloration or cracks so the receiver can judge if it suits their needs.`,
          `Auto suggestion: Multi-use plastic storage or utility item. Note whether it is food-safe, has a tight lid or locking system, and if there are any stains or smells from previous use so people know how they can safely reuse it.`,
          `Auto suggestion: Durable plastic piece for everyday organisation. Explain how you used it (for example, storing snacks, stationery, tools), if it stacks with other containers, and whether there are any chips or rough edges.`
        ];
      case "Paper":
        return [
          `Auto suggestion: Paper item. Condition: ${condition}. Usable paper or notebooks that can still be written or printed on. Please mention whether the pages are blank or partly used, approximate number of sheets, and any folds, markings or damage so the next owner can plan how to use it.`,
          `Auto suggestion: Notebooks or sheets suitable for study, notes or craft. Mention the page size (A4, A5 etc.), type of ruling (plain, ruled, grid) and whether there are any previous notes, highlights or doodles on the pages.`,
          `Auto suggestion: Reusable paper bundle. Describe if it is more suitable for school projects, office printouts or art work, and mention if the edges are clean, punched or slightly worn.`
        ];
      case "Cardboard":
        return [
          `Auto suggestion: Cardboard. Condition: ${condition}. Sturdy cardboard boxes or sheets that are still strong enough for storage or craft. Please describe the size, thickness, whether they are clean or have tape/labels, and if there are any tears or damp spots.`,
          `Auto suggestion: Reusable cartons or packaging boards. Mention if they are foldable or already assembled, how many boxes/sheets you are giving, and whether they were previously used for electronics, groceries or deliveries.`,
          `Auto suggestion: Craft or storage-friendly cardboard. Let people know if the surfaces are plain or printed, if there are any dents or crushed corners, and suggest how it could be reused (moving, DIY projects, kids’ models).`
        ];
      case "Brown-glass":
      case "Green-glass":
      case "White-glass":
        return [
          `Auto suggestion: Glass container. Condition: ${condition}. A reusable glass bottle or jar that can be used for storage or decor. Please mention the approximate volume, colour (brown/green/clear), whether it has a lid, and note any chips, scratches or labels still attached.`,
          `Auto suggestion: Decorative/utility glass bottle or jar. Explain if it was earlier used for food, drinks or decor, and mention if it is heavy or lightweight glass so people know how safely it can be handled or upcycled.`,
          `Auto suggestion: Upcyclable glass piece. Suggest how it could be reused (as a vase, storage jar, lamp, terrarium) and clearly mention if there are any sharp edges, cracks or missing caps.`
        ];
      case "Battery":
        return [
          `Auto suggestion: Batteries/device with batteries. Condition: ${condition}. Please clearly state if the batteries are new, partially used or near the end of life. If you are donating a device with batteries installed, describe if it is working properly and if there are any cracks, loose covers or missing parts.`,
          `Auto suggestion: Battery-powered item. Mention the battery type (AA, AAA, button cell etc.), whether you are including spare cells, and if the receiver should replace them soon for best performance.`,
          `Auto suggestion: Electrical/electronic item using batteries. Add a note about when it was last used, if there are any known issues like flickering, loose contact or corrosion, and whether basic cleaning is required before reuse.`
        ];
      case "Metal":
        return [
          `Auto suggestion: Metal item. Condition: ${condition}. A metal container, tool or household item that is still strong and usable. Please describe what it is (for example, tin, utensil, rack), its size, and mention any rust, dents or sharp edges so the receiver can handle it safely.`,
          `Auto suggestion: Reusable metal piece for kitchen, storage or DIY. Let people know if it is stainless steel, aluminium or another metal, and whether it is better suited for food use, tools or craft projects.`,
          `Auto suggestion: Sturdy metal item with some signs of age. Highlight if it has any decorative value, how you used it earlier, and if a quick cleaning or polishing would make it look better.`
        ];
      case "Biological":
        return [
          `Auto suggestion: Organic/biological material. Condition: ${condition}. This category is usually better suited for composting, not direct donation. If you are sharing safe, non-perishable food or plants, describe clearly what it is, the quantity, and any storage or expiry details so it remains safe to use.`,
          `Auto suggestion: Natural/organic item. If it is a plant, mention the type, pot size and any care tips. If it is food, clearly state whether it is sealed, homemade or packaged, and how soon it should be consumed.`,
          `Auto suggestion: Compost-friendly material. If your intention is to give this for composting or gardening, mention that clearly and describe whether it is kitchen scraps, dry leaves or other organic matter so it is used correctly.`
        ];
      case "Trash":
        return [
          `Auto suggestion: Trash/low-value mixed waste. This type of item is generally not suitable for donation. If you are offering it for upcycling projects, describe what kind of packaging or material it is, how clean it is, and how someone might safely reuse it for crafts or eco-bricks.`,
          `Auto suggestion: Mixed low-value material mainly suitable for recycling or craft. Be honest about cleanliness and condition, and suggest creative uses like eco-bricks, collage art or school projects if appropriate.`,
          `Auto suggestion: Non-usable item for experimental reuse. Clearly mention that this is not fit for direct use but may help someone who is specifically looking for waste material for DIY or research.`
        ];
      default:
        return [
          `Auto suggestion: ${label}. Condition: ${condition}. A gently used item that is still practical and usable, with normal signs of wear but no major damage. Please describe what it is, how it is typically used, and mention size, brand or material plus any marks or defects so the next owner has a clear picture before requesting it.`,
          `Auto suggestion: ${label}. A pre-owned item you no longer need. Share how long you have used it, what you liked about it, and why you think it could still be helpful to someone else.`,
          `Auto suggestion: ${label}. Please give a short, product-style description including age, usage history and any small issues so that the receiver can decide confidently.`
        ];
    }
  };

  const onDonateClick = () => setShowDonateForm(true);

  // Per-label cycling tips
  const TIPS = {
    Shoes: {
      reuse: [
        "Clean and use old shoes as indoor slippers for home use.",
        "Use shoelaces as plant ties or DIY craft strings.",
        "Repurpose shoes as quirky indoor plant pots.",
        "Use old sports shoes as garden or yard work shoes.",
        "Turn canvas shoes into decorative storage containers.",
        "Use baby shoes as keepsake memory displays.",
        "Convert flat shoes into pin cushions for sewing kits.",
        "Use old shoes as door-stoppers by adding weight inside.",
        "Turn shoe soles into grip mats for toolboxes.",
        "Use shoe bodies as quirky pen or paintbrush holders."
      ],
      recycle: [
        "Cut rubber soles and use them as anti-slip pads for furniture legs.",
        "Cut the inner foam layers to use as cushioning material.",
        "Turn shoe insoles into kneeling pads for gardening.",
        "Cut fabric sides into small patches for craft or repair stitching.",
        "Turn soles into DIY coasters by smoothing edges.",
        "Use stripped shoe fabric as material for making keychains.",
        "Shred leather shoes to make small leather strips for crafts.",
        "Use rubber soles as a base for DIY door stoppers.",
        "Cut shoe tongues to create mini storage pockets.",
        "Use broken shoe parts in mosaics or decorative art projects."
      ],
      donate: [
        "Bundle shoes in pairs and mention size/condition in your listing.",
        "Donate shoes to community drives or friends in need.",
        "Offer shoes to local sports clubs or schools."
      ]
    },
    Clothes: {
      reuse: [
        "Convert T-shirts into no-sew tote bags.",
        "Use old shirts as decorative pillow covers.",
        "Turn jeans pockets into wall or desk organizers.",
        "Use denim sleeves as plant pot covers.",
        "Make hair ties or headbands from stretchy fabric.",
        "Use cotton clothes as reusable kitchen towels.",
        "Turn old T-shirts into braided rugs.",
        "Cut fabric to make gift-wrapping cloths (furoshiki).",
        "Use fabric to create reusable handkerchiefs.",
        "Convert kids' clothes into memory quilts."
      ],
      recycle: [
        "Cut clothes into cleaning rags for home use.",
        "Shred clothes to use as cushion or pillow stuffing.",
        "Use fabric strips to make braided baskets.",
        "Turn sleeves into drawstring bags.",
        "Cut jeans into sturdy patches for repairs.",
        "Shred cloth to use as compost carbon material (only natural fabrics).",
        "Turn thick fabric into pot holders.",
        "Create fabric rope by twisting long strips.",
        "Turn old scarves into lampshade covers.",
        "Use pieces of cloth for quilting or patchwork crafts."
      ],
      donate: [
        "Donate to local charities, shelters, or community groups.",
        "Organize a clothing swap with friends.",
        "List gently used clothes online for free pickup."
      ]
    },
    Plastic: {
      reuse: [
        "Use bottles as water sprinklers by poking tiny holes in the cap.",
        "Turn plastic containers into storage for grains, screws, or beads.",
        "Use plastic jars as fridge organizers.",
        "Cut bottles to create snack organizers.",
        "Mark measurement levels on bottles to use as measuring cups.",
        "Use strong plastic tubs as plant watering trays.",
        "Transform jars into spice containers with labels.",
        "Use thin plastic sheets as drawer liners.",
        "Convert big plastic boxes into meal-prep containers.",
        "Use bottle caps as counters for games or educational tools."
      ],
      recycle: [
        "Cut bottles to make herb or succulent planters.",
        "Create vertical gardens using stacked or hanging bottles.",
        "Slice bottle sides into strips to create a DIY broom.",
        "Make bird feeders using spoons or sticks.",
        "Turn containers into desk organizers.",
        "Craft wall art using spoons and caps.",
        "Make drip-irrigation systems using punctured bottles.",
        "Convert tubs into mini compost bins.",
        "Shred clean plastic to use as lightweight filler.",
        "Use bottle bottoms as decorated candle holders."
      ],
      donate: [
        "Donate clean, useful plastic items to community centers.",
        "Offer storage bins or organizers online.",
        "Only donate plastic items in very good condition."
      ]
    },
    Paper: {
      reuse: [
        "Use blank sides of old sheets for notes.",
        "Create bookmarks from colored paper strips.",
        "Fold paper for origami decorations.",
        "Use paper to wrap fragile objects.",
        "Make simple envelopes from reused sheets.",
        "Use paper as temporary table mats.",
        "Create paper labels for jars and boxes.",
        "Use paper as scratch paper for doodling or calculations.",
        "Make kids’ craft cutouts from old sheets.",
        "Use colorful paper pieces to make collage art."
      ],
      recycle: [
        "Tear, soak, and blend paper to make handmade recycled sheets.",
        "Use paper-mache to craft bowls, masks, or shapes.",
        "Shred paper for compost as carbon material.",
        "Use shredded paper for packaging filler.",
        "Make seed paper by mixing pulp with plant seeds.",
        "Create paper clay by blending pulp with glue.",
        "Make recycled notebook covers using layered paper.",
        "Turn paper tubes into cable organizers.",
        "Roll paper tightly to make DIY coasters.",
        "Make paper beads for jewelry or decoration."
      ],
      donate: [
        "Offer clean paper to schools for art projects.",
        "Donate cardboard boxes to people who are moving.",
        "Give unused notebooks to local organizations."
      ]
    },
    Cardboard: {
      reuse: [
        "Use cardboard boxes for general household storage.",
        "Create kids’ playhouses or mini models.",
        "Use flat cardboard as drawer liners.",
        "Turn cardboard into laptop stands.",
        "Make DIY picture frames.",
        "Use cardboard as a paint shield for wall painting.",
        "Create DIY coasters by cutting sturdy pieces.",
        "Use cardboard sheets for school project bases.",
        "Convert boxes into toy organizers.",
        "Make a simple charging dock from cardboard."
      ],
      recycle: [
        "Cut cardboard into drawer organizers.",
        "Reinforce boxes to make storage baskets.",
        "Create a pet house using large boxes.",
        "Make compostable seed starter pots.",
        "Use cardboard strips to weave baskets.",
        "Turn cardboard into a scratchpad for cats.",
        "Shred cardboard for compost (brown material).",
        "Use cardboard triangles to strengthen shelves.",
        "Make a DIY pinboard covered with cloth.",
        "Cut and paint cardboard to make wall décor pieces."
      ],
      donate: [
        "Offer clean boxes to local shops or movers.",
        "Donate sturdy boxes to community centers.",
        "Post on community boards for free pickup."
      ]
    },
    "Brown-glass": {
      reuse: [
        "Use brown bottles to store oils or vinegar.",
        "Use them as rustic table vases.",
        "Use bottles as minimalist home décor.",
        "Use them as elegant water bottles for dinner settings.",
        "Fill bottles with colored water for decoration.",
        "Use brown jars for storing dry foods.",
        "Use bottles as stick diffusers for fragrances.",
        "Use bottles as photo-holders by inserting wires.",
        "Use jars for storing DIY cleaners.",
        "Use bottles as rolling pins for baking in emergencies."
      ],
      recycle: [
        "Insert fairy lights inside bottles for DIY lamps.",
        "Cut bottles to make candle holders.",
        "Use bottles placed upside-down as garden borders.",
        "Turn glass pieces into mosaic art.",
        "Use bottles as weights for pressing plants or papers.",
        "Fill bottles with sand to make doorstoppers.",
        "Make bottle wind chimes by cutting sections.",
        "Use cut bottles as small planters.",
        "Paint bottles to create home décor pieces.",
        "Use smoothened glass pieces for jewelry crafts."
      ],
      donate: [
        "Donate decorative glass to thrift stores.",
        "Offer glassware to local artists for reuse.",
        "Give away jars for home canning."
      ]
    },
    "Green-glass": {
      reuse: [
        "Use bottles as tall vases for flowers.",
        "Use green bottles as table centerpieces.",
        "Store infused oils or beverages.",
        "Use bottles for DIY fragrance diffusers.",
        "Fill with sand or shells for décor.",
        "Use jars for pantry storage.",
        "Use bottles as watering tools for plants.",
        "Turn bottles into stylish candle stands.",
        "Use bottles as rolling rods for clay projects.",
        "Use jars as paintbrush cleaning jars."
      ],
      recycle: [
        "Cut bottles into drinking glasses.",
        "Use bottles as garden edging.",
        "Make wind chimes using bottle sections.",
        "Turn bottles into self-watering plant systems.",
        "Use cut glass for stained-glass art.",
        "Create hanging lamps using bottle tops.",
        "Make candle covers by cutting bottles evenly.",
        "Turn bottle necks into funnels.",
        "Create mini terrariums in cut bottles.",
        "Use polished glass shards in stepping-stone art."
      ],
      donate: [
        "Donate colored glass bottles to artists.",
        "Offer to local schools for art projects.",
        "Give away for upcycling crafts."
      ]
    },
    "White-glass": {
      reuse: [
        "Use jars for storing spices or grains.",
        "Store stationery or craft items inside jars.",
        "Use clear bottles as minimalist décor.",
        "Turn jars into mini sewing kits.",
        "Use jars to store leftover sauces or dry snacks.",
        "Use jars as coin banks.",
        "Turn jars into transparent display containers.",
        "Use bottles as water containers during meals.",
        "Use jars to store bathroom essentials.",
        "Use jars for candle making."
      ],
      recycle: [
        "Turn jars into candle lanterns filled with pebbles.",
        "Paint jars for decorative lamps.",
        "Create mini terrariums using soil and small plants.",
        "Turn jars into indoor plant pots.",
        "Use jars as sand-art containers.",
        "Make hanging lights using jar lids.",
        "Turn smooth glass into mosaic art.",
        "Cut bottles to make drinking glasses.",
        "Use jars as fermentation containers for pickles.",
        "Convert jars into bird seed containers."
      ],
      donate: [
        "Donate clear glass to thrift shops.",
        "Offer jars to local gardeners.",
        "Give away for science projects."
      ]
    },
    Battery: {
      reuse: [
        "Use partially drained batteries in clocks.",
        "Use weak batteries in remote controls.",
        "Use drained batteries for LED toys.",
        "Group similar low-power batteries for better output.",
        "Use weak batteries in fairy lights.",
        "Test remaining battery life using simple testers.",
        "Use batteries for school science projects.",
        "Use weak batteries for small emergency torches.",
        "Label batteries to reuse them efficiently.",
        "Rotate batteries between devices to maximize life."
      ],
      recycle: [
        "Tape terminals to prevent sparks during storage.",
        "Store used batteries in a non-metal box.",
        "Mark batteries as 'used' for sorting.",
        "Place batteries in separate sealed bags.",
        "Keep batteries in cool, dry spaces to prevent leaks.",
        "Use old AA casings in craft models (non-electrical).",
        "Use battery shapes as molds for clay or crafts.",
        "Use dead batteries as weight fillers for small items.",
        "Use cylindrical batteries as rolling guides for crafts.",
        "Make dummy battery connectors for school exhibits (NO electrical use)."
      ],
      donate: [
        "Donate only new, unused batteries.",
        "Do not donate used batteries.",
        "Donate devices with installed batteries if still working."
      ]
    },
    Metal: {
      reuse: [
        "Use tins as pen holders.",
        "Use cans as mini plant pots.",
        "Use metal containers as kitchen organizers.",
        "Convert tins into cutlery holders.",
        "Use cans to store screws or nails.",
        "Use cans as paintbrush wash jars.",
        "Use metal cups as candle holders.",
        "Decorate tins for craft storage.",
        "Use tins as food bowls for pets.",
        "Turn cans into hanging storage using hooks."
      ],
      recycle: [
        "Punch holes into cans to make lanterns.",
        "Convert cans into wall-mounted tool holders.",
        "Flatten metal to make DIY craft tags.",
        "Use cans as molds for candles.",
        "Cut and shape metal to make labels or signs.",
        "Use cans as planters with drainage holes.",
        "Create musical shakers with beads inside.",
        "Turn tins into bird feeders.",
        "Make mini stoves using metal cans.",
        "Use metal pieces for mosaic art."
      ],
      donate: [
        "Donate usable metal tools or cookware.",
        "Offer metal racks to community centers.",
        "Give away metal parts for recycling projects."
      ]
    },
    Biological: {
      reuse: [
        "Regrow vegetables like spring onions or herbs.",
        "Use citrus peels as natural room fresheners.",
        "Boil vegetable scraps to make broth.",
        "Use coffee grounds as odor absorbers.",
        "Blend fruit peels into plant sprays.",
        "Use overripe fruits for smoothies or jams.",
        "Dry bread to make breadcrumbs.",
        "Use tea leaves as deodorizer for shoe cabinets.",
        "Use eggshell halves as seed starters.",
        "Use banana peels to polish plant leaves."
      ],
      recycle: [
        "Compost food scraps for nutrient-rich soil.",
        "Make bio-enzyme cleaners using citrus peels.",
        "Dry and crush eggshells as fertilizer.",
        "Use vegetable peels as compost boosters.",
        "Create worm compost with kitchen waste.",
        "Turn fruit pulp into natural dyes.",
        "Dry orange peels for mosquito-repellent powder.",
        "Blend spoiled fruits into plant nutrient slurry.",
        "Turn coconut shells into plant pots.",
        "Use dried leaves and scraps as mulch."
      ],
      donate: [
        "Do not donate biological waste.",
        "Donate only safe, non-perishable food.",
        "Focus on composting or proper disposal."
      ]
    },
    Trash: {
      reuse: [
        "Use clean wrappers as drawer liners.",
        "Use packaging foam as cushion filler.",
        "Use sturdy wrappers as protective table covers.",
        "Use soft plastic bags as stuffing for pillows.",
        "Turn large wrappers into waterproof book covers.",
        "Use clear wrappers as small greenhouse covers for seedlings.",
        "Reuse bubble wrap for storage protection.",
        "Use clean foil wrappers for kids' craft projects.",
        "Turn cardboard-backed wrappers into bookmarks.",
        "Use packaging ribbons for gift wrapping."
      ],
      recycle: [
        "Make eco-bricks by stuffing wrappers tightly into bottles.",
        "Use eco-bricks to build stools or small furniture.",
        "Use eco-bricks to make garden borders.",
        "Shred soft plastics to fill cushions or toys.",
        "Fuse plastic sheets with low heat to make reusable pouches (carefully).",
        "Use wrappers to create waterproof mats.",
        "Make art mosaics using colored plastic pieces.",
        "Turn plastic packaging into DIY rope by twisting strips.",
        "Use wrappers as insulators for plant pots.",
        "Use laminated plastic sheets to make outdoor banners."
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
        "Check online for reuse inspiration.",
        "Before buying new, ask if this item can be repaired or refreshed.",
        "Combine several small items into one useful kit (for example, a sewing or art kit).",
        "Use sturdy containers to organize drawers, shelves, or your workspace.",
        "Label boxes and jars so you can keep reusing them instead of buying new storage.",
        "Turn colourful items into decorative pieces for your room or study area.",
        "Offer items to neighbours or friends through your building or college group.",
        "Host a mini swap event with classmates to exchange things you no longer need.",
        "Use old fabric, paper and containers for school projects instead of new materials.",
        "Turn old packaging into organizers for stationery, cables, or accessories.",
        "If you have multiple similar items, keep the best ones and reuse the rest occasionally.",
        "Keep a small 'reuse' box at home where family members can place items before throwing away.",
        "Combine two half-broken items (for example, toys or tools) to make one fully working piece.",
        "Use containers and boxes to pack gifts instead of buying gift bags.",
        "Create simple storage for chargers and headphones using old pouches or cases.",
        "Use leftover materials from one project as the starting point for your next DIY idea.",
        "Keep a note of what you successfully reused so you remember similar ideas next time.",
        "Think of reuse as keeping the item the same but moving it to a new place or purpose—no factory or melting needed.",
        "Whenever you are about to throw something, pause and ask: can this be used again by me or someone else as it is?",
        "Practice reuse by rotating items in your home—for example, an old mug can become a pen stand or plant pot.",
        "If you upgrade to a new version of something, try reusing the old one in a guest room, hostel or workspace.",
        "Use sturdy shopping bags again and again instead of collecting new disposable ones.",
        "Reuse packaging by keeping a small stock of envelopes, bubble wrap and boxes for future parcels.",
        "When you borrow or lend items in your community, you are also reusing shared resources instead of buying new.",
        "Teach younger siblings or friends how to reuse school supplies across multiple semesters.",
        "Create a small repair corner at home where you can fix reusable items with glue, thread or basic tools."
      ],
      recycle: [
        "Check your local recycling guide for this item.",
        "Ask your municipality about recycling options.",
        "See if any parts can be recycled.",
        "Separate paper, plastic, metal and glass into different bags or bins.",
        "Rinse food containers so they do not contaminate other recyclables.",
        "Flatten boxes and crush bottles to save space in the recycling bin.",
        "Remove tape, labels or mixed materials when possible before recycling.",
        "Look for recycling symbols and numbers on plastic to know what is accepted locally.",
        "Collect e‑waste (old chargers, cables, gadgets) separately and take it to a special drive.",
        "Keep a small recycling corner at home so everyone knows where to place items.",
        "Avoid mixing hazardous items like batteries or chemicals with normal recyclables.",
        "Join or start a college or community recycling drive once a semester.",
        "Share photos or reminders with friends about local recycling drop‑off points.",
        "Bundle paper with string instead of tape or plastic when giving it for recycling.",
        "Reuse or recycle packaging you receive from online orders instead of binning it.",
        "Keep reusable bags handy so you generate fewer low‑quality plastic bags.",
        "Choose products with minimal or recyclable packaging when you shop.",
        "If you are unsure about an item, check your city website instead of guessing.",
        "Teach one friend or family member how to sort waste correctly this week.",
        "Remember that recycling changes the material itself—like melting metal or pulping paper—to make something new.",
        "If an item is too damaged for reuse, recycling its material is often the next best step.",
        "When you recycle properly, you reduce the need to extract fresh raw materials from the earth.",
        "Check if your area has separate collections for dry recyclables and wet organic waste, and follow them.",
        "Label home recycling containers clearly so everyone puts the right material in the right bin.",
        "Look up special collection days for glass, e‑waste and bulky recyclables in your city calendar.",
        "Encourage your college, office or housing society to set up clearly marked recycling stations.",
        "Track how many bags or boxes of recyclables you divert from landfill each month as a small personal goal."
      ],
      donate: [
        "Donate through EcoShare or a local charity.",
        "List the item online for free pickup.",
        "Offer to friends or family.",
        "Clean the item properly so the next person feels happy to receive it.",
        "Add clear photos from different angles so people know what they are getting.",
        "Describe any scratches, stains or missing parts honestly in your listing.",
        "Group small related items into a single donation bundle (for example, stationery set).",
        "Check with shelters, hostels or community centres about what items they currently need.",
        "Avoid donating broken or unsafe items—repair first or recycle instead.",
        "If clothing is too worn to donate, consider textile recycling rather than listing it.",
        "Pack the item securely so it reaches the receiver in one piece.",
        "Be responsive in chat and fix a clear pickup time to avoid last‑minute cancellations.",
        "Mark the listing as completed once the item has been given away.",
        "Share your positive donation stories to inspire friends to try it.",
        "If demand is high, consider splitting items across multiple receivers fairly.",
        "Use EcoShare to donate seasonal items (books, decor, uniforms) before they go out of use.",
        "Respect people’s privacy and comfort during pickup; choose safe, public locations.",
        "Ask the receiver for quick feedback so you can improve future donations.",
        "Remember that every donated item keeps one more thing out of the landfill.",
        "Think of donating as a special form of reuse—your item continues its life with a new owner instead of being thrown away.",
        "Write your description so that a stranger can understand how to use and care for the item safely.",
        "Include information like size, material and age so receivers can decide if the item suits their needs.",
        "If an item has emotional or cultural value, mention it kindly so the next owner can respect its story.",
        "Use donation as a chance to declutter gently—start with items you haven’t used in six months or more.",
        "Bundle items for students or NGOs, such as study kits, kitchen starter sets or basic clothing packs.",
        "After a successful donation, note what worked well (timing, packaging, communication) and repeat that pattern next time."
      ]
    }
  };

  // Cycling tip state
  const [tipIndexes, setTipIndexes] = useState({});

  // When prediction changes, cycle the tip index for that label
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (prediction && prediction.label) {
      setTipIndexes(prev => {
        const next = { ...prev };
        const label = prediction.label;
        // For each type, increment index mod tip count
        ["reuse", "recycle", "donate"].forEach(type => {
          const specific = (TIPS[label] && TIPS[label][type]) || [];
          const combined = specific.length ? [...specific, ...TIPS.default[type]] : TIPS.default[type];
          const prevIdx = prev[label + type] || 0;
          next[label + type] = (prevIdx + 1) % combined.length;
        });
        return next;
      });
    }
  }, [prediction]);

  // Helper to get the cycling tip
  const getCyclingTip = (label, type) => {
    const specific = (TIPS[label] && TIPS[label][type]) || [];
    const combined = specific.length ? [...specific, ...TIPS.default[type]] : TIPS.default[type];
    const key = label + type;
    const idx = tipIndexes[key] || 0;
    return combined[idx % combined.length];
  };


  const handleCreatePost = async (formData) => {
    if (!file) { alert("No image to upload"); return; }
    setIsPosting(true);
    try {
      const ai = prediction ? { label: prediction.label, confidence: prediction.confidence } : null;
      await uploadImageAndCreatePost(file, formData, userId, userEmail, ai);
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
        <label className="small-muted">Upload clear photos of the item you want to donate</label>
        <p className="small-muted" style={{ marginTop: 4 }}>
          Choose a bright, well‑lit photo that shows the whole item. Avoid blurry images and try to include
          any important details like brand labels, scratches or wear so receivers can clearly understand
          the condition before they request it.
        </p>
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
          defaultDescription={getDescriptionSuggestions()[0]}
          descriptionSuggestions={getDescriptionSuggestions()}
          defaultCategory={prediction ? prediction.category : ""}
          onCancel={() => setShowDonateForm(false)}
          onSubmit={handleCreatePost}
          disabled={isPosting}
        />
      )}
    </div>
  );
}
