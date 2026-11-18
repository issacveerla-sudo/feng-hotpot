// Static menu content. Categories come from fenghotpot.com; items are
// representative Sichuan-hotpot dishes you can edit freely.
export const MENU = [
  {
    category: "Broth",
    blurb: "Pick your base — the soul of the pot.",
    items: [
      { name: "Signature Red Oil Spicy Soup", desc: "House málà broth, numbing & fiery.", price: "$16", heat: 3, tag: "Legend" },
      { name: "Tomato Sweet & Sour", desc: "Bright, comforting, kid-friendly.", price: "$14", heat: 0 },
      { name: "Mushroom Umami Broth", desc: "Slow-simmered wild mushrooms.", price: "$15", heat: 0 },
      { name: "Half & Half Yin-Yang Pot", desc: "Spicy + mild in one pot.", price: "$18", heat: 2, tag: "Popular" },
    ],
  },
  {
    category: "Special Meat Dishes",
    blurb: "Hand-cut, marbled, made for the boil.",
    items: [
      { name: "Premium Angus Beef", desc: "Thin-sliced, 10-second swish.", price: "$18", heat: 0, tag: "Chef's pick" },
      { name: "Lamb Shoulder Roll", desc: "Tender, fragrant, melts fast.", price: "$16", heat: 0 },
      { name: "Wagyu Short Rib", desc: "Rich marbling, limited daily.", price: "$28", heat: 0, tag: "Limited" },
      { name: "Spicy Beef Tripe", desc: "Classic crunch for the brave.", price: "$13", heat: 2 },
    ],
  },
  {
    category: "Handmade Dishes",
    blurb: "Made in-house, every morning.",
    items: [
      { name: "Handmade Shrimp Paste", desc: "Spooned straight into the pot.", price: "$15", heat: 1, tag: "Fresh" },
      { name: "Fish Tofu", desc: "Bouncy, soaks up the broth.", price: "$9", heat: 0 },
      { name: "Beef Meatballs", desc: "Springy, house-rolled.", price: "$10", heat: 0 },
      { name: "Cuttlefish Balls", desc: "Ocean-sweet bite.", price: "$11", heat: 0 },
    ],
  },
  {
    category: "Garden Vegetables",
    blurb: "Fresh greens to balance the fire.",
    items: [
      { name: "Napa Cabbage", desc: "Sweet, crisp, essential.", price: "$7", heat: 0 },
      { name: "Lotus Root", desc: "Crunchy, holds the broth.", price: "$8", heat: 0 },
      { name: "Enoki Mushrooms", desc: "Silky golden threads.", price: "$7", heat: 0 },
      { name: "Baby Bok Choy", desc: "Tender and green.", price: "$6", heat: 0 },
    ],
  },
  {
    category: "Chef's Recommend",
    blurb: "Don't leave without these.",
    items: [
      { name: "Signature Platter for Two", desc: "Beef, lamb, handmade bites, veg.", price: "$52", heat: 2, tag: "Best value" },
      { name: "Spicy Duck Blood", desc: "Silky, authentic Chengdu classic.", price: "$9", heat: 3 },
      { name: "Crispy Pork Intestine", desc: "For the true hotpot heads.", price: "$12", heat: 2 },
    ],
  },
  {
    category: "Others",
    blurb: "Noodles, sides & cool-downs.",
    items: [
      { name: "Hand-Pulled Noodles", desc: "Made to order, chewy.", price: "$6", heat: 0 },
      { name: "Sweet Rice Cake", desc: "Soft, soaks up flavor.", price: "$6", heat: 0 },
      { name: "House Plum Juice", desc: "Sweet-tart, cools the heat.", price: "$5", heat: 0, tag: "Cool-down" },
    ],
  },
];

export const REWARDS = [
  { id: "app", name: "Free Appetizer", points: 200, desc: "Fish tofu, meatballs, or greens on us." },
  { id: "broth", name: "Free Premium Broth Upgrade", points: 350, desc: "Upgrade to Yin-Yang or Wagyu broth." },
  { id: "beef", name: "Free Angus Beef Plate", points: 500, desc: "A plate of premium beef, free." },
  { id: "platter", name: "$25 Off Signature Platter", points: 800, desc: "Our best-value feast for two." },
  { id: "vip", name: "VIP Skip-the-Line Pass", points: 1200, desc: "Jump the waitlist on your next visit." },
];

export const TIERS = [
  { name: "Spark", min: 0, perk: "Earn 10 pts per visit", color: "#E8B04B" },
  { name: "Ember", min: 500, perk: "+ Birthday reward", color: "#F2792B" },
  { name: "Blaze", min: 1500, perk: "+ Priority waitlist", color: "#E23B2E" },
  { name: "Legend", min: 3500, perk: "+ Chef's table invites", color: "#B5121B" },
];

export function tierForPoints(points) {
  let current = TIERS[0];
  for (const t of TIERS) if (points >= t.min) current = t;
  return current;
}
