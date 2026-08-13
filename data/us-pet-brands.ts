/**
 * Pet-food brands sold in North American shops — the seed the coverage page
 * starts from.
 *
 * ── Where this came from, and what that means ─────────────────────────────
 *
 * Written from what the model knew at training time. It is NOT a scrape of a
 * retailer, and nothing in here was checked against a live catalogue: the
 * network in the environment this was written in cannot reach Chewy, Petco or
 * PetSmart. So treat it the way you would treat a list somebody wrote from
 * memory in a good hour — broadly right, certainly incomplete, and out of date
 * in the places the industry moved recently. Ownership in particular changes:
 * Post bought Smucker's pet brands, Mars bought Champion, General Mills bought
 * Blue Buffalo, and any of those could be stale again by the time you read it.
 *
 * That is fine, because this list is a STARTING POINT, not the truth. The
 * coverage page shows brands from here AND brands that turned up on a shelf,
 * side by side. A brand that isn't here appears the moment somebody scans it.
 * A `lines` entry that doesn't exist any more simply shows zero products
 * forever, which is a small cost; a real product whose range isn't listed here
 * still shows, under "Other". Nothing is hidden for not being in this file.
 *
 * ── What `lines` is for ───────────────────────────────────────────────────
 *
 * The range within a brand — Friskies SHREDS, Fancy Feast GRAVY LOVERS, Blue
 * Buffalo WILDERNESS. Ranges are what a shelf is arranged by and what you
 * forget you already did; individual flavours are not listed on purpose. A
 * brand has five to fifteen ranges and I know them; it has hundreds of
 * flavours and I would invent half of them, and a checklist that lies about a
 * flavour is worse than one that stays quiet. Flavours arrive from the shelf
 * instead, as products land under their range.
 *
 * ── `aliases` ─────────────────────────────────────────────────────────────
 *
 * How the same maker gets written on a pack, in Open Food Facts, and by a
 * model reading a photograph. "Friskies", "Purina Friskies" and "PURINA
 * FRISKIES" are one brand and must fold into one row — see lib/brand-key.ts.
 * The brand's own name is always matched, so aliases only need the SPELLINGS
 * THAT DIFFER, not the name again.
 */

export interface SeedBrand {
  /** How the brand is written on the shelf. Also the display name. */
  name: string;
  /** Who owns it. Shown small under the name — useful when a brand is unfamiliar. */
  owner: string;
  /** Which animal it is mostly for, so the list can be narrowed in an aisle. */
  species: "cat" | "dog" | "both";
  /** Other spellings that mean this same brand. */
  aliases?: string[];
  /** Ranges within the brand. Flavours are NOT listed — see the note above. */
  lines?: string[];
}

export const US_PET_BRANDS: SeedBrand[] = [
  // ── Nestlé Purina PetCare ────────────────────────────────────────────────
  {
    name: "Purina",
    owner: "Nestlé Purina",
    species: "both",
    aliases: ["nestle purina", "purina petcare"],
    lines: ["Moist & Meaty", "Kit & Kaboodle", "Puppy Chow", "Kitten Chow"],
  },
  {
    name: "Fancy Feast",
    owner: "Nestlé Purina",
    species: "cat",
    aliases: ["purina fancy feast"],
    lines: [
      "Classic Pâté",
      "Gravy Lovers",
      "Medleys",
      "Grilled",
      "Chunky",
      "Flaked",
      "Roasted",
      "Marinated Morsels",
      "Sliced",
      "Gems",
      "Purely",
      "Petites",
      "Kitten",
      "Savory Cravings",
      "Broths",
      "Appetizers",
      "Creamy Delights",
      "Delights With Cheddar",
      "Savory Centers",
      "Gourmet Naturals",
      "Royale",
    ],
  },
  {
    name: "Friskies",
    owner: "Nestlé Purina",
    species: "cat",
    aliases: ["purina friskies"],
    lines: [
      "Shreds",
      "Pâté",
      "Prime Filets",
      "Savory Shreds",
      "Extra Gravy",
      "Gravy Sensations",
      "Tasty Treasures",
      "Ocean Favorites",
      "Wild Favorites",
      "Indoor Delights",
      "Meaty Bits",
      "Farm Favorites",
      "Lil' Soups",
      "Glaz'd & Infuz'd",
      "Fully Load'd",
      "Chunky",
      "Party Mix",
      "Seafood Sensations",
      "Surfin' & Turfin' Favorites",
      "Gravy Swirlers",
      "Tender & Crunchy",
    ],
  },
  {
    name: "Purina ONE",
    owner: "Nestlé Purina",
    species: "both",
    aliases: ["purina 1"],
    lines: [
      "SmartBlend",
      "True Instinct",
      "Tender Selects Blend",
      "+Plus",
      "Natural",
      "Healthy Kitten",
      "Healthy Puppy",
    ],
  },
  {
    name: "Pro Plan",
    owner: "Nestlé Purina",
    species: "both",
    aliases: ["purina pro plan", "proplan"],
    lines: [
      "Savor",
      "Sport",
      "Focus",
      "Complete Essentials",
      "Sensitive Skin & Stomach",
      "Bright Mind",
      "True Nature",
      "Development",
      "Grain Free",
      "Puppy Starter",
      "LiveClear",
      "Veterinary Diets",
    ],
  },
  {
    name: "Purina Dog Chow",
    owner: "Nestlé Purina",
    species: "dog",
    aliases: ["dog chow"],
    lines: ["Complete Adult", "Healthy Weight", "High Protein", "Puppy", "Little Bites"],
  },
  {
    name: "Purina Cat Chow",
    owner: "Nestlé Purina",
    species: "cat",
    aliases: ["cat chow"],
    lines: ["Complete", "Indoor", "Naturals", "Gentle", "Hairball"],
  },
  {
    name: "Beneful",
    owner: "Nestlé Purina",
    species: "dog",
    aliases: ["purina beneful"],
    lines: [
      "Originals",
      "Healthy Weight",
      "IncrediBites",
      "Grain Free",
      "Prepared Meals",
      "Simple Goodness",
      "Superfood Blend",
    ],
  },
  {
    name: "Beyond",
    owner: "Nestlé Purina",
    species: "both",
    aliases: ["purina beyond"],
    lines: ["Simply", "Grain Free", "Superfood Blend"],
  },
  {
    name: "Alpo",
    owner: "Nestlé Purina",
    species: "dog",
    aliases: ["purina alpo"],
    lines: ["Chop House", "Prime Cuts", "Come & Get It", "Variety Snaps", "T-Bonz"],
  },
  {
    name: "Merrick",
    owner: "Nestlé Purina",
    species: "both",
    lines: [
      "Classic",
      "Grain Free",
      "Backcountry",
      "Limited Ingredient Diet",
      "Lil' Plates",
      "Healthy Grains",
      "Purrfect Bistro",
      "Whole Earth Farms",
    ],
  },
  {
    name: "Castor & Pollux",
    owner: "Nestlé Purina",
    species: "both",
    lines: ["Organix", "PRISTINE", "ButcherHouse"],
  },
  { name: "Zuke's", owner: "Nestlé Purina", species: "dog" },
  { name: "DentaLife", owner: "Nestlé Purina", species: "both", aliases: ["purina dentalife"] },
  { name: "Beggin'", owner: "Nestlé Purina", species: "dog", aliases: ["beggin strips", "purina beggin"] },
  { name: "Waggin' Train", owner: "Nestlé Purina", species: "dog" },

  // ── Mars Petcare ─────────────────────────────────────────────────────────
  {
    name: "Pedigree",
    owner: "Mars",
    species: "dog",
    lines: [
      "Complete Nutrition",
      "Choice Cuts",
      "Chopped Ground Dinner",
      "High Protein",
      "Puppy",
      "DentaStix",
    ],
  },
  {
    name: "Cesar",
    owner: "Mars",
    species: "dog",
    lines: [
      "Classic Loaf in Sauce",
      "Loaf & Topper in Sauce",
      "Filets in Gravy",
      "Home Delights",
      "Wholesome Bowls",
      "Simply Crafted",
    ],
  },
  {
    name: "Sheba",
    owner: "Mars",
    species: "cat",
    lines: ["Perfect Portions", "Filets", "Bistro", "Meaty Tender Sticks"],
  },
  {
    name: "Iams",
    owner: "Mars",
    species: "both",
    lines: [
      "ProActive Health",
      "Minichunks",
      "Healthy Naturals",
      "Perfect Portions",
      "Advanced Health",
      "Grain Free Naturals",
    ],
  },
  {
    name: "Eukanuba",
    owner: "Mars",
    species: "dog",
    lines: ["Premium Performance", "Breed Specific", "Puppy", "Adult"],
  },
  {
    name: "Nutro",
    owner: "Mars",
    species: "both",
    lines: [
      "Natural Choice",
      "Ultra",
      "Wholesome Essentials",
      "Limited Ingredient Diet",
      "So Simple",
      "Max",
    ],
  },
  {
    name: "Royal Canin",
    owner: "Mars",
    species: "both",
    lines: [
      "Breed Health Nutrition",
      "Size Health Nutrition",
      "Feline Care Nutrition",
      "Feline Health Nutrition",
      "Veterinary Diet",
    ],
  },
  {
    name: "Temptations",
    owner: "Mars",
    species: "cat",
    lines: ["Classic", "MixUps", "Creamy Puree", "Jumbo Stuff", "Snacky Mouse"],
  },
  { name: "Crave", owner: "Mars", species: "both", lines: ["Grain Free", "High Protein"] },
  { name: "Greenies", owner: "Mars", species: "both", lines: ["Dental Treats", "Pill Pockets", "Feline Dental"] },
  { name: "Whiskas", owner: "Mars", species: "cat" },
  {
    name: "Orijen",
    owner: "Mars (Champion)",
    species: "both",
    lines: ["Original", "Six Fish", "Regional Red", "Tundra", "Amazing Grains", "Guardian 8"],
  },
  {
    name: "Acana",
    owner: "Mars (Champion)",
    species: "both",
    lines: [
      "Singles",
      "Wholesome Grains",
      "Highest Protein",
      "Premium Pâté",
      "Homestead Harvest",
      "Bountiful Catch",
    ],
  },

  // ── Hill's Pet Nutrition (Colgate-Palmolive) ─────────────────────────────
  {
    name: "Hill's Science Diet",
    owner: "Hill's (Colgate)",
    species: "both",
    aliases: ["science diet", "hills science diet", "hill s science diet"],
    lines: [
      "Adult",
      "Puppy",
      "Kitten",
      "Perfect Weight",
      "Perfect Digestion",
      "Sensitive Stomach & Skin",
      "Oral Care",
      "Youthful Vitality",
      "Healthy Cuisine",
      "Mobility",
      "Small & Mini",
      "Large Breed",
      "Adult 7+",
    ],
  },
  {
    name: "Hill's Prescription Diet",
    owner: "Hill's (Colgate)",
    species: "both",
    aliases: ["prescription diet", "hills prescription diet"],
    lines: ["c/d", "i/d", "k/d", "z/d", "w/d", "j/d", "Metabolic", "Derm Complete", "Gastrointestinal Biome"],
  },
  { name: "Hill's Bioactive Recipe", owner: "Hill's (Colgate)", species: "dog", aliases: ["bioactive recipe"] },

  // ── General Mills ────────────────────────────────────────────────────────
  {
    name: "Blue Buffalo",
    owner: "General Mills",
    species: "both",
    aliases: ["blue", "blue buffalo co", "bluebuffalo"],
    lines: [
      "Life Protection Formula",
      "Wilderness",
      "Basics",
      "Freedom",
      "True Solutions",
      "Carnivora",
      "Tastefuls",
      "Tastefuls Savory Singles",
      "Baby Blue",
      "Homestyle Recipe",
      "Divine Delights",
      "Natural Veterinary Diet",
      "Health Bars",
      "Blue Bits",
      "Sizzlers",
    ],
  },
  { name: "Nudges", owner: "General Mills", species: "dog" },
  { name: "True Chews", owner: "General Mills", species: "dog" },

  // ── Post Consumer Brands (ex-Smucker pet) ────────────────────────────────
  {
    name: "Rachael Ray Nutrish",
    owner: "Post",
    species: "both",
    aliases: ["nutrish", "rachael ray"],
    lines: ["Real Recipe", "Zero Grain", "Bright Kitty", "Peak", "Dish", "Big Life"],
  },
  {
    name: "Meow Mix",
    owner: "Post",
    species: "cat",
    lines: [
      "Original Choice",
      "Tender Centers",
      "Simple Servings",
      "Bistro Recipes",
      "Gravy Bursts",
      "Indoor Health",
      "Irresistibles",
      "Seafood Medley",
    ],
  },
  {
    name: "9Lives",
    owner: "Post",
    species: "cat",
    aliases: ["nine lives"],
    lines: ["Daily Essentials", "Meaty Pate", "Tender Morsels", "Protein Plus"],
  },
  {
    name: "Kibbles 'n Bits",
    owner: "Post",
    species: "dog",
    aliases: ["kibbles n bits", "kibbles and bits"],
    lines: ["Original", "Bistro Meals", "Homestyle"],
  },
  {
    name: "Nature's Recipe",
    owner: "Post",
    species: "both",
    aliases: ["natures recipe"],
    lines: ["Grain Free", "Healthy Skin", "Prime Blends", "Original"],
  },
  {
    name: "Milk-Bone",
    owner: "Post",
    species: "dog",
    aliases: ["milk bone", "milkbone"],
    lines: ["Original", "MaroSnacks", "Soft & Chewy", "Farmer's Medley", "Brushing Chews"],
  },
  { name: "Pup-Peroni", owner: "Post", species: "dog", aliases: ["pup peroni"] },
  { name: "Gravy Train", owner: "Post", species: "dog" },
  { name: "Canine Carry Outs", owner: "Post", species: "dog" },

  // ── Diamond Pet Foods (Schell & Kampeter) ────────────────────────────────
  {
    name: "Taste of the Wild",
    owner: "Diamond",
    species: "both",
    aliases: ["totw"],
    lines: [
      "High Prairie",
      "Pacific Stream",
      "Sierra Mountain",
      "Wetlands",
      "Southwest Canyon",
      "Ancient Grains",
      "Ancient Stream",
      "Ancient Prairie",
      "Ancient Wetlands",
      "Pine Forest",
      "PREY",
      "Canyon River",
      "Rocky Mountain",
    ],
  },
  {
    name: "Diamond Naturals",
    owner: "Diamond",
    species: "both",
    aliases: ["diamond"],
    lines: ["Skin & Coat", "Large Breed", "All Life Stages", "Extreme Athlete", "Diamond CARE"],
  },
  { name: "Nutra-Nuggets", owner: "Diamond", species: "both", aliases: ["nutra nuggets"] },
  { name: "Premium Edge", owner: "Diamond", species: "both" },
  { name: "Professional", owner: "Diamond", species: "both" },

  // ── WellPet ──────────────────────────────────────────────────────────────
  {
    name: "Wellness",
    owner: "WellPet",
    species: "both",
    aliases: ["wellness natural pet food"],
    lines: [
      "Complete Health",
      "CORE",
      "Simple",
      "CORE Tiny Tasters",
      "CORE Digestive Health",
      "Mini Meals",
      "Bowl Boosters",
      "Healthy Indulgence",
      "Divine Duos",
      "Petite Entrees",
      "Soft Puppy Bites",
    ],
  },
  { name: "Old Mother Hubbard", owner: "WellPet", species: "dog" },
  { name: "Eagle Pack", owner: "WellPet", species: "dog" },
  { name: "Holistic Select", owner: "WellPet", species: "both" },
  { name: "Whimzees", owner: "WellPet", species: "dog" },

  // ── Pet-specialty / premium, independent ─────────────────────────────────
  {
    name: "Instinct",
    owner: "Nature's Variety",
    species: "both",
    aliases: ["natures variety instinct", "nature s variety"],
    lines: [
      "Raw Boost",
      "Original",
      "Limited Ingredient Diet",
      "Be Natural",
      "Ultimate Protein",
      "Raw Longevity",
      "Raw Meals",
    ],
  },
  {
    name: "Stella & Chewy's",
    owner: "Independent",
    species: "both",
    aliases: ["stella and chewys", "stella chewys"],
    lines: [
      "Freeze-Dried Raw Dinner Patties",
      "Meal Mixers",
      "Raw Coated Kibble",
      "Carnivore Cravings",
      "Wild Weenies",
      "Marie's Magical Dinner Dust",
      "Raw Blend",
    ],
  },
  {
    name: "Primal",
    owner: "Independent",
    species: "both",
    aliases: ["primal pet foods"],
    lines: ["Freeze-Dried Nuggets", "Raw Frozen Formula", "Pronto", "Butcher's Blend", "Raw Toppers"],
  },
  {
    name: "Open Farm",
    owner: "Independent",
    species: "both",
    lines: [
      "Homestead",
      "Rustic Blend",
      "RawMix",
      "Freeze Dried Raw",
      "Kind Earth",
      "Ancient Grains",
    ],
  },
  {
    name: "The Honest Kitchen",
    owner: "Independent",
    species: "both",
    aliases: ["honest kitchen"],
    lines: ["Whole Grain", "Grain Free", "Butcher Block Pâté", "Bone Broth", "Dehydrated", "One Pot Stew"],
  },
  {
    name: "Fromm",
    owner: "Independent",
    species: "both",
    aliases: ["fromm family foods"],
    lines: ["Four-Star Nutritionals", "Gold", "Classic", "Heartland Gold"],
  },
  {
    name: "Canidae",
    owner: "Independent",
    species: "both",
    lines: ["PURE", "All Life Stages", "Goodness", "Sustain", "Under the Sun"],
  },
  {
    name: "Victor",
    owner: "Mid America",
    species: "dog",
    aliases: ["victor super premium", "victor pet food"],
    lines: ["Classic", "Select", "Purpose", "Hi-Pro Plus", "Yukon River"],
  },
  {
    name: "Solid Gold",
    owner: "Independent",
    species: "both",
    lines: ["Hund-N-Flocken", "Barking at the Moon", "Leaping Waters", "Winged Tiger", "Indigo Moon"],
  },
  {
    name: "Earthborn Holistic",
    owner: "Midwestern",
    species: "both",
    aliases: ["earthborn"],
    lines: ["Primitive Natural", "Coastal Catch", "Great Plains Feast", "Venture", "Unrefined"],
  },
  { name: "Sportmix", owner: "Midwestern", species: "both" },
  { name: "Pro Pac", owner: "Midwestern", species: "both", aliases: ["propac"] },
  { name: "Halo", owner: "Independent", species: "both", lines: ["Holistic", "Elite", "Garden of Vegan"] },
  {
    name: "Zignature",
    owner: "Pets Global",
    species: "dog",
    lines: ["Limited Ingredient", "Ziggy's", "Select Cuts"],
  },
  { name: "Essence", owner: "Pets Global", species: "both", lines: ["Ranch & Meadow", "Ocean & Freshwater"] },
  {
    name: "Fussie Cat",
    owner: "Pets Global",
    species: "cat",
    lines: ["Premium", "Market Fresh", "Gold"],
  },
  {
    name: "Tiki Cat",
    owner: "Whitebridge",
    species: "cat",
    lines: [
      "After Dark",
      "Grill",
      "Luau",
      "Velvet Mousse",
      "Pâté",
      "Silver",
      "Solutions",
      "Born Carnivore",
      "Baby",
      "Stix",
    ],
  },
  { name: "Tiki Dog", owner: "Whitebridge", species: "dog", lines: ["Aloha Petites", "Born Carnivore"] },
  { name: "Cloud Star", owner: "Whitebridge", species: "dog", lines: ["Wag More Bark Less", "Tricky Trainers"] },
  { name: "Dogswell", owner: "Whitebridge", species: "dog" },
  {
    name: "Weruva",
    owner: "Independent",
    species: "both",
    lines: [
      "Classic",
      "Cats in the Kitchen",
      "TruLuxe",
      "Wx",
      "Dogs in the Kitchen",
      "Paw Lickin'",
    ],
  },
  { name: "B.F.F.", owner: "Weruva", species: "cat", aliases: ["bff", "best feline friend"], lines: ["OMG", "Play"] },
  {
    name: "Ziwi Peak",
    owner: "Independent",
    species: "both",
    aliases: ["ziwi", "ziwipeak"],
    lines: ["Air-Dried", "Provenance", "Steam & Dried", "Wet Canned"],
  },
  {
    name: "Farmina",
    owner: "Independent",
    species: "both",
    aliases: ["farmina n d", "n&d"],
    lines: ["N&D Prime", "N&D Ancestral Grain", "N&D Quinoa", "N&D Pumpkin", "Vet Life"],
  },
  {
    name: "Nulo",
    owner: "Independent",
    species: "both",
    lines: ["FreeStyle", "MedalSeries", "Frontrunner", "Challenger", "Freeze-Dried Raw"],
  },
  {
    name: "Natural Balance",
    owner: "Independent",
    species: "both",
    lines: [
      "L.I.D. Limited Ingredient Diets",
      "Original Ultra",
      "Platefulls",
      "Delectable Delights",
      "Targeted Nutrition",
    ],
  },
  { name: "Rawz", owner: "Independent", species: "both", lines: ["Meal Free", "Shredded", "Dehydrated"] },
  { name: "Koha", owner: "Independent", species: "both", lines: ["Limited Ingredient", "Poke Bowl", "Slider"] },
  { name: "Bixbi", owner: "Independent", species: "dog", lines: ["Rawbble", "Liberty", "Pocket Trainers"] },
  {
    name: "NutriSource",
    owner: "Tuffy's",
    species: "both",
    aliases: ["nutri source"],
    lines: ["Grain Free", "Element Series", "Pure Vita", "Choice"],
  },
  { name: "PureVita", owner: "Tuffy's", species: "both", aliases: ["pure vita"] },
  { name: "Inception", owner: "Pets Global", species: "both" },
  {
    name: "Chicken Soup for the Soul",
    owner: "Independent",
    species: "both",
    lines: ["Classic", "Grain Free"],
  },
  { name: "Nature's Logic", owner: "Independent", species: "both", aliases: ["natures logic"] },
  { name: "Redbarn", owner: "Independent", species: "dog", lines: ["Naturals", "Air Dried", "Filled Bones"] },
  { name: "Evanger's", owner: "Independent", species: "both", aliases: ["evangers"] },
  { name: "Against the Grain", owner: "Independent", species: "both" },
  { name: "Lotus", owner: "Independent", species: "both", aliases: ["lotus pet food"] },
  { name: "Party Animal", owner: "Independent", species: "both" },
  { name: "Wysong", owner: "Independent", species: "both" },
  { name: "Dave's Pet Food", owner: "Independent", species: "both", aliases: ["daves pet food"], lines: ["Naturally Healthy", "Restricted Diet"] },
  { name: "Health Extension", owner: "Independent", species: "both" },
  { name: "Annamaet", owner: "Independent", species: "dog" },
  { name: "Dr. Tim's", owner: "Independent", species: "dog", aliases: ["dr tims"] },
  { name: "Blue Ridge Beef", owner: "Independent", species: "both" },
  { name: "Raised Right", owner: "Independent", species: "both" },
  { name: "Grandma Lucy's", owner: "Independent", species: "both", aliases: ["grandma lucys"] },
  { name: "Sojos", owner: "Independent", species: "dog" },
  { name: "Vital Essentials", owner: "Independent", species: "both" },
  { name: "Northwest Naturals", owner: "Independent", species: "both" },
  { name: "Steve's Real Food", owner: "Independent", species: "both", aliases: ["steves real food"] },
  { name: "Small Batch", owner: "Independent", species: "both", aliases: ["smallbatch"] },
  { name: "OC Raw", owner: "Independent", species: "both" },
  { name: "Answers", owner: "Independent", species: "both", aliases: ["answers pet food"] },
  { name: "I and Love and You", owner: "Independent", species: "both" },
  { name: "Only Natural Pet", owner: "PetSmart", species: "both" },
  { name: "Wild Earth", owner: "Independent", species: "dog" },
  { name: "Tender & True", owner: "Independent", species: "both", aliases: ["tender and true"] },
  { name: "Newman's Own", owner: "Independent", species: "both", aliases: ["newmans own"] },
  { name: "K9 Natural", owner: "Independent", species: "dog" },
  { name: "Feline Natural", owner: "Independent", species: "cat" },
  { name: "Applaws", owner: "Independent", species: "both" },
  { name: "Almo Nature", owner: "Independent", species: "both" },
  { name: "Catit", owner: "Hagen", species: "cat" },
  { name: "Reveal", owner: "Independent", species: "both" },
  { name: "Made by Nacho", owner: "Independent", species: "cat", aliases: ["nacho"] },
  { name: "Portland Pet Food", owner: "Independent", species: "dog" },
  { name: "Life's Abundance", owner: "Independent", species: "both", aliases: ["lifes abundance"] },
  { name: "Hartz", owner: "Hartz", species: "both", lines: ["Delectables", "Crunch 'n Clean", "Squeeze Up"] },
  { name: "Nylabone", owner: "Central Garden & Pet", species: "dog" },
  { name: "Cadet", owner: "Central Garden & Pet", species: "dog" },

  // ── Retailer own-brands ──────────────────────────────────────────────────
  //
  // Largely absent from Open Food Facts, which is exactly why they are worth
  // scanning: nobody else has them.
  {
    name: "Kirkland Signature",
    owner: "Costco",
    species: "both",
    aliases: ["kirkland"],
    lines: ["Nature's Domain", "Super Premium", "Healthy Weight"],
  },
  {
    name: "American Journey",
    owner: "Chewy",
    species: "both",
    lines: ["Grain Free", "Landmark", "Active Life", "Protein First"],
  },
  { name: "Tiny Tiger", owner: "Chewy", species: "cat", lines: ["Pate", "Chunks in Gravy", "Nano"] },
  { name: "Soulistic", owner: "Chewy", species: "cat", lines: ["Moist & Tender", "Good Karma", "Pure Bliss"] },
  { name: "Frisco", owner: "Chewy", species: "both" },
  {
    name: "WholeHearted",
    owner: "Petco",
    species: "both",
    aliases: ["whole hearted"],
    lines: [
      "Grain Free",
      "All Life Stages",
      "Fresh Recipes",
      "By Land and Sea",
      "Easy Digestion",
    ],
  },
  { name: "Reddy", owner: "Petco", species: "dog" },
  { name: "Good Lovin'", owner: "Petco", species: "both", aliases: ["good lovin"] },
  { name: "Well & Good", owner: "Petco", species: "both", aliases: ["well and good"] },
  {
    name: "Simply Nourish",
    owner: "PetSmart",
    species: "both",
    lines: ["Source", "Essentials", "Origins", "Fresh Market", "Freeze Dried Raw"],
  },
  { name: "Authority", owner: "PetSmart", species: "both" },
  { name: "Great Choice", owner: "PetSmart", species: "both" },
  { name: "Ol' Roy", owner: "Walmart", species: "dog", aliases: ["ol roy", "old roy"] },
  { name: "Special Kitty", owner: "Walmart", species: "cat" },
  { name: "Pure Balance", owner: "Walmart", species: "both", lines: ["Pro+", "Wild & Free", "Original"] },
  { name: "Vibrant Life", owner: "Walmart", species: "both" },
  { name: "Kindfull", owner: "Target", species: "both" },
  { name: "Boots & Barkley", owner: "Target", species: "both", aliases: ["boots and barkley"] },
  { name: "Wag", owner: "Amazon", species: "dog", aliases: ["amazon wag"] },
  { name: "Member's Mark", owner: "Sam's Club", species: "both", aliases: ["members mark"] },

  // ── Fresh and direct-to-consumer ─────────────────────────────────────────
  //
  // Mostly not on a shelf, so mostly not scannable — kept here so a brand seen
  // in a fridge aisle or sent by a user has somewhere to land.
  {
    name: "Freshpet",
    owner: "Independent",
    species: "both",
    lines: ["Vital", "Nature's Fresh", "Select", "Homestyle Creations", "Complete Nutrition"],
  },
  { name: "The Farmer's Dog", owner: "Independent", species: "dog", aliases: ["farmers dog"] },
  { name: "Ollie", owner: "Independent", species: "dog" },
  { name: "Nom Nom", owner: "Mars", species: "both", aliases: ["nomnom"] },
  { name: "Spot & Tango", owner: "Independent", species: "dog", aliases: ["spot and tango"] },
  { name: "JustFoodForDogs", owner: "Independent", species: "dog", aliases: ["just food for dogs"] },
  { name: "Smalls", owner: "Independent", species: "cat" },
  { name: "Cat Person", owner: "Independent", species: "cat" },
  { name: "Jinx", owner: "Independent", species: "dog" },
  { name: "Maev", owner: "Independent", species: "dog" },
  { name: "Sundays", owner: "Independent", species: "dog", aliases: ["sundays for dogs"] },
  { name: "A Pup Above", owner: "Independent", species: "dog" },

  // ── Canadian ─────────────────────────────────────────────────────────────
  {
    name: "GO! Solutions",
    owner: "Petcurean",
    species: "both",
    aliases: ["go solutions", "petcurean go"],
    lines: ["Carnivore", "Sensitivities", "Skin + Coat Care", "Weight Management"],
  },
  { name: "NOW FRESH", owner: "Petcurean", species: "both", aliases: ["now fresh"] },
  { name: "Gather", owner: "Petcurean", species: "both" },
  { name: "SUMMIT", owner: "Petcurean", species: "both" },
  {
    name: "Nutrience",
    owner: "Hagen",
    species: "both",
    lines: ["Infusion", "Care", "Original", "SubZero"],
  },
  { name: "Zoe", owner: "Hagen", species: "both" },
  { name: "First Mate", owner: "Independent", species: "both", aliases: ["firstmate"], lines: ["Endurance", "Australian Lamb", "Pacific Ocean Fish"] },
  { name: "Horizon", owner: "Independent", species: "both", aliases: ["horizon pet food"], lines: ["Legacy", "Amicus", "Complete"] },
  { name: "Carna4", owner: "Independent", species: "both" },
  { name: "Boréal", owner: "Independent", species: "both", aliases: ["boreal"] },
  { name: "Smack", owner: "Independent", species: "both", aliases: ["smack pet food"] },
  { name: "Big Country Raw", owner: "Independent", species: "both" },
  { name: "Naturawls", owner: "Independent", species: "both" },
  { name: "Corey Nutrition", owner: "Independent", species: "both" },
];
