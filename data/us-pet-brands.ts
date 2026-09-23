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
  /**
   * The shelf-family this brand belongs to, where several of our brands share
   * one house name.
   *
   * Hill's is the case that made this exist: Science Diet and Prescription
   * Diet are deliberately separate brands — a shopper reads them as separate
   * brands, and merging their identities would churn every stored composition
   * key — but on the coverage page three cards all beginning "Hill's" read as
   * clutter, and a row whose brand was captured as just "Hill's" has nowhere
   * honest to go. The family gives the page one card to gather them under
   * WITHOUT touching any product's identity.
   *
   * Set only where the shared name is real. Purina's brands stay separate:
   * nobody reads "Friskies" and "Fancy Feast" as one shelf.
   */
  family?: string;
  /** Ranges within the brand. Flavours are NOT listed — see the note above. */
  lines?: string[];
  /**
   * This brand's name is an ordinary English word, so it may only be folded
   * from a longer string when it LEADS that string.
   *
   * Wellness is why this exists. `lib/brand-key.ts` folds by whole-word
   * containment, which is right for "Purina Friskies Cat Food" and wrong here:
   * "Digestive Wellness" contains the word and is not this brand. That is not
   * hypothetical — three other makers print it. Dr. Bill's Pet Nutrition uses
   * "Digestive Wellness" as a product family, Now Fresh uses it as a category,
   * and Purina ONE +Plus Digestive Health carries it as benefit copy. A model
   * reading a front of pack can lift any of them into the brand field, and the
   * report would then be attributed to a brand that did not make the food.
   *
   * With this set, "WELLNESS CORE" and "Wellness Complete Health" still fold —
   * the word leads — and "Digestive Wellness" or "Dental Wellness Chews" no
   * longer do. They become their own unseeded brand instead, which is the
   * honest answer: the coverage page shows a brand nobody seeded, and nobody's
   * product is filed under somebody else's name.
   *
   * Set it only where a name really is an ordinary word AND the false fold has
   * been seen in the wild. A false fold misattributes a real product; a missed
   * fold only creates a visible extra row, so the cost is not symmetric — but
   * it is not zero either, and a guess is not evidence.
   */
  leadingWordOnly?: boolean;
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
      // Batch 030. "Minced" is its own range on the tin, beside Sliced and
      // Flaked — the same word is also a `texture` value, and they are not the
      // same thing: a Medleys tin can be minced without being a Minced.
      "Minced",
      "Gems",
      "Purely",
      "Petites",
      "Kitten",
      "Senior 7+",
      "Savory Cravings",
      "Broths",
      "Appetizers",
      "Creamy Delights",
      "Delights With Cheddar",
      "Savory Centers",
      "Gourmet Naturals",
      "Royale",
      // Batch 017, the first dry food in the seed. Purina's own pages call the
      // dry Fancy Feast range "Gourmet"; the decks are titled "Gourmet Cat
      // Food" and "Gourmet Kitten Food".
      "Gourmet Dry",
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
      "Indoor",
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
      // Batch 017. The deck and the shop page both name it "Tender & Crunchy
      // Combo"; the shorter entry above was written from memory and is kept
      // because nothing has been filed under it either way.
      "Tender & Crunchy Combo",
      "Land & Sea Adventures",
      // A complete dry FOOD, not the Party Mix treats — Purina sells both and
      // the names are one word apart. Filing a dinner under the treat range
      // would make the report excuse it as a snack.
      "Party Pack'd",
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
    // "Healthy Aging" came off current packs during the batch-038 campaign and
    // was missing from the five written from shelf memory. Two senior products
    // had nowhere to go but "Other" without it.
    //
    // "Hairball" is kept although that campaign found none, and the reason is
    // worth knowing before somebody deletes it: current Cat Chow presents
    // hairball control as a PROPERTY of the Indoor recipe rather than as a
    // separate product, so this may be a benefit claim that was written down
    // as a range. That is the Iams "Minichunks" question mirrored, and one
    // campaign's reading is not enough to settle it — a pack is. An unused
    // range costs a row showing zero products; a deleted real one costs a
    // whole shelf off the coverage page.
    lines: ["Complete", "Indoor", "Naturals", "Gentle", "Healthy Aging", "Hairball"],
  },
  {
    name: "Beneful",
    owner: "Nestlé Purina",
    species: "dog",
    aliases: ["purina beneful"],
    // The first seven were shelf memory. The batch-040 campaign read current
    // packs and added seven more, every one of them carried by at least two
    // records with a manufacturer deck behind them.
    //
    // Two of the additions are RENAMES caught mid-shelf, and both halves are
    // listed because both are in shops now under different barcodes — the same
    // treatment Weruva's "Wx" / "Wx Phos Focused" pair gets above. "Prepared
    // Meals" is becoming "Freshly Prepared Meals"; "Chopped Blends" is
    // becoming "Freshly Prepared Blends". Merging either pair would file two
    // real barcodes as one product.
    //
    // "Baked Delights" is a TREAT range, and adding it here is only half the
    // job: lib/nutrition-role.ts has to recognise it too, or the consumer
    // report judges a bag of biscuits for not being a balanced diet. It does
    // now.
    //
    // Three more current-looking names — Playful Life, Healthy Fiesta,
    // Protein Rich — were left OUT deliberately. Each rested on a single
    // record with no deck and no promotion, and one of the three has no
    // resolved printed size. A range added on that evidence is shelf memory
    // wearing a campaign's clothes.
    lines: [
      "Originals",
      "Healthy Weight",
      "IncrediBites",
      "Grain Free",
      "Simple Goodness",
      "Superfood Blend",
      "Healthy Puppy",
      "Prepared Meals",
      "Freshly Prepared Meals",
      "Chopped Blends",
      "Freshly Prepared Blends",
      "Freshly Prepared Classics",
      "Freshly Prepared Stews",
      "Kitchen Creations",
      "Baked Delights",
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
    // The first five were written from shelf memory. The rest were added in
    // batch 041, each carried by at least two ledger records under the name on
    // its own pack.
    lines: [
      "Chop House",
      "Prime Cuts",
      "Come & Get It",
      "Variety Snaps",
      "T-Bonz",
      "Prime Slices",
      "Gravy Cravers",
      "Prime Classics",
      "Hidden Goodness",
      "Dental Chews",
    ],
  },
  {
    name: "Merrick",
    owner: "Nestlé Purina",
    species: "both",
    // Written from the packs the research found, which is finer than the
    // shelf-memory list this started as: Merrick splits Limited Ingredient
    // Diet into a grain-free and a healthy-grains family, and sells Chunky,
    // Slow-Cooked BBQ and Kitchen Comforts as ranges of their own. The
    // shorter names stay — products under them exist — and the longer ones
    // join rather than replace, because a coverage page files by exact match
    // and an unlisted range lands in "Other".
    lines: [
      "Classic",
      "Grain Free",
      "Chunky Grain Free",
      "Backcountry",
      "Backcountry Grain Free",
      "Limited Ingredient Diet",
      "Limited Ingredient Diet Grain Free",
      "Limited Ingredient Diet Healthy Grains",
      "Slow-Cooked BBQ",
      "Kitchen Comforts",
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
    // Small Dog, Large Breed and TENDER BITES came off current packs during the
    // Pedigree research and were missing from the six written from shelf
    // memory; thirteen of that campaign's twenty barcodes sit under them.
    // "Small Dog" is the spelling its own packs use — retailers also print
    // "Small Breed", and the handoff says to settle that from a pack rather
    // than from a listing. TENDER BITES is capitalised the way the bag is.
    lines: [
      "Complete Nutrition",
      "Choice Cuts",
      "Chopped Ground Dinner",
      "High Protein",
      "Small Dog",
      "Large Breed",
      "TENDER BITES",
      "Puppy",
      "DentaStix",
    ],
  },
  {
    name: "Cesar",
    owner: "Mars",
    species: "dog",
    // The last four were added in batch 042 from Mars' own page taxonomy
    // ("Sub brand" on every cesar.com product page), which is a stronger
    // witness than any retailer's name for them.
    lines: [
      "Classic Loaf in Sauce",
      "Loaf & Topper in Sauce",
      "Filets in Gravy",
      "Home Delights",
      "Wholesome Bowls",
      "Simply Crafted",
      "Warm Bowls",
      "Wholesome Meals",
      "Mini-Pouch",
      "Softies",
    ],
  },
  {
    name: "Sheba",
    owner: "Mars",
    species: "cat",
    aliases: ["sheba us", "mars petcare us"],
    // Batch 032 replaced three of the four shelf-memory names with what the
    // current US packs print, which is what this list is for.
    //
    // "Filets" on its own turned out to be too broad: the printed family is
    // "Selections Filets in Broth", and it is a MEAL COMPLEMENT rather than a
    // dinner — see lib/nutrition-role.ts, which is why the full string matters
    // here rather than a tidy short name. "Bistro" survives unseeded because
    // the current all-products page still offers it as a filter; an empty
    // range costs nothing and a wrong one files real products under "Other".
    lines: [
      "Perfect Portions",
      "Selections Filets in Broth",
      "Gravy Indulgence",
      "Kitten",
      "Meaty Tender Sticks",
      "Bistro",
    ],
  },
  {
    name: "Iams",
    owner: "Mars",
    species: "both",
    // Six of these were shelf memory. The research campaign read 121 current
    // US packs and corrected two of them.
    //
    // "Minichunks" is gone: it is a KIBBLE SIZE inside ProActive Health, not a
    // range — the bag reads "IAMS ProActive Health Adult MiniChunks", and the
    // maker's own page presents it beneath ProActive Health. It lived here for
    // the same reason a range usually does, because somebody saw it printed
    // large. Left in, it would have taken the products that belong to
    // ProActive Health and filed them under a heading no shelf has.
    //
    // "Healthy Enjoyment" is new, and is the opposite error: a real current
    // range on the manufacturer's site that this list had never heard of. Its
    // products had nowhere to go but "Other".
    //
    // "Healthy Naturals" and "Grain Free Naturals" are kept although the
    // campaign met neither. Absence from one campaign's 121 packs is not
    // evidence a range is gone, and an unused range costs a row that shows
    // zero products; a missing one costs a whole shelf off the coverage page.
    lines: [
      "ProActive Health",
      "Advanced Health",
      "Perfect Portions",
      "Healthy Enjoyment",
      "Healthy Naturals",
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
      "Feline Breed Nutrition",
      "Canine Care Nutrition",
      "Canine Health Nutrition",
      // The two vet channels. The cat one is "Veterinary Diet" on the bag;
      // the dog one is "Veterinary Health Nutrition" — lib/vet-diet.ts knows
      // both phrases, and a test there holds it to that.
      "Veterinary Diet",
      "Veterinary Health Nutrition",
    ],
  },
  {
    name: "Temptations",
    owner: "Mars",
    species: "cat",
    // The last seven were added in batch 043 from Mars' own "Sub brand"
    // taxonomy on temptationstreats.com. Paté in Gravy, Bites in Gravy and the
    // unranged dry bags are complete foods, not treats — lib/nutrition-role.ts
    // says so under this brand.
    lines: [
      "Classic",
      "MixUps",
      "Creamy Puree",
      "Jumbo Stuff",
      "Snacky Mouse",
      "Lickable Puree",
      "Lickable Spoons",
      "Kitten",
      "Indoor Care",
      "Paté in Gravy",
      "Bites in Gravy",
    ],
  },
  { name: "Crave", owner: "Mars", species: "both", lines: ["Grain Free", "High Protein"] },
  { name: "Greenies", owner: "Mars", species: "both", lines: ["Dental Treats", "Pill Pockets", "Feline Dental"] },
  { name: "Whiskas", owner: "Mars", species: "cat" },
  {
    name: "Orijen",
    owner: "Mars (Champion)",
    species: "both",
    // Seven of these came off actual current packs during the Orijen research
    // and were missing from the six written from shelf memory: Puppy, Puppy
    // Large, Senior, Fit & Trim, Guardian Senior, Kitten and WILD RESERVE.
    // Eighteen of the campaign's first forty barcodes sit under them, so
    // without these rows those products had nowhere honest to go.
    //
    // WILD RESERVE is capitalised the way the pack prints it.
    lines: [
      "Original",
      "Six Fish",
      "Regional Red",
      "Tundra",
      "Amazing Grains",
      "Guardian 8",
      "Guardian Senior",
      "Puppy",
      "Puppy Large",
      "Senior",
      "Fit & Trim",
      "Kitten",
      "Small Breed",
      "WILD RESERVE",
      // The cat wet family, and a range rather than a texture: six recipes
      // exist only inside it — Beef & Tuna, Duck & Liver, Salmon & Chicken,
      // Chicken & Tuna Kitten — and none of them is sold as a pâté. Acana's
      // "Premium Pâté" above is the same case: a maker may market a format as
      // a range, and then it is one.
      "Chunks & Shreds",
    ],
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
    family: "Hill's",
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
      // Seeded in batch 015. Named the way Hill's prints them on the can,
      // which keeps "Adult" in front — these are adult ranges with a purpose,
      // not purposes sold across life stages.
      "Adult Hairball Control",
      "Adult Indoor",
      // Batch 016. "Adult Urinary Hairball Control" is a THIRD range beside
      // "Adult Hairball Control" and plain "Adult" — Hill's sells both the
      // hairball formula and the urinary-plus-hairball one, and collapsing
      // them would file a urinary deck under a range that is not it.
      "Adult Urinary Hairball Control",
      "Adult 7+ Senior Vitality",
      "Adult Healthy Cuisine",
      // Batch 018. Hill's crosses purpose with life stage on the front of the
      // pack — Perfect Digestion is sold for adults, for 7+ and for kittens as
      // three different decks — so each combination is its own range rather
      // than a purpose filed under one stage. The bare "Perfect Weight",
      // "Perfect Digestion", "Sensitive Stomach & Skin" and "Healthy Cuisine"
      // above were written from memory before any of this was seeded; nothing
      // is filed under them and they are kept only because removing an unused
      // name proves nothing.
      "Adult Sensitive Stomach & Skin",
      "Adult Perfect Digestion",
      "Adult Perfect Weight",
      "Adult 7+ Perfect Digestion",
      "Adult 7+ Healthy Cuisine",
      "Adult 11+ Healthy Cuisine",
      "Kitten Sensitive Stomach & Skin",
      "Kitten Healthy Cuisine",
    ],
  },
  {
    name: "Hill's Prescription Diet",
    family: "Hill's",
    owner: "Hill's (Colgate)",
    species: "both",
    aliases: ["prescription diet", "hills prescription diet"],
    lines: [
      "c/d",
      // Hill's prints "c/d Multicare" on the can and sells plain "c/d" as a
      // separate thing. Both are kept: collapsing them would file a Multicare
      // deck under a range whose formula it is not.
      "c/d Multicare",
      "i/d",
      "k/d",
      "z/d",
      "w/d",
      "j/d",
      // Seeded in batch 015.
      "r/d",
      "y/d",
      // Batch 016. Each is the name printed on its own can. "k/d + z/d" is one
      // product Hill's sells for two conditions at once, not a pair — there is
      // a single deck with a single barcode, so it is a range of its own and
      // not an entry under either letter.
      "c/d Multicare Stress",
      "k/d + z/d",
      "m/d GlucoSupport",
      "w/d Multi-Benefit",
      "Metabolic",
      "Derm Complete",
      "Gastrointestinal Biome",
    ],
  },
  {
    name: "Hill's Bioactive Recipe",
    owner: "Hill's (Colgate)",
    species: "dog",
    aliases: ["bioactive recipe"],
    family: "Hill's",
  },

  // ── General Mills ────────────────────────────────────────────────────────
  {
    name: "Blue Buffalo",
    owner: "General Mills",
    species: "both",
    aliases: ["blue", "blue buffalo co", "bluebuffalo"],
    // The first eight and the last five were shelf memory; the ones marked
    // below came off packs in the research ledger, and one correction matters
    // more than any addition: this said "Baby Blue", and the pack says "Baby
    // BLUE". A coverage page files by exact match, so one lower-case letter
    // was enough to send every kitten product to "Other" — the failure mode
    // this list exists to prevent, hiding inside a range that looked present.
    lines: [
      "Life Protection Formula",
      "Wilderness",
      "Basics",
      "Freedom",
      "True Solutions",
      "Carnivora",
      "Tastefuls",
      "Tastefuls Savory Singles",
      "Baby BLUE",
      "Homestyle Recipe",
      "Divine Delights",
      "Natural Veterinary Diet",
      "Health Bars",
      "Blue Bits",
      "Sizzlers",
      // From the ledger. Blue Buffalo capitalises BLUE inside a range name
      // and does not do it consistently, so these are spelled as the packs
      // spell them rather than tidied.
      "BLUE Bursts",
      "True Chews",
      "Wild Cuts Tasty Toppers",
      // A range named after the brand, which is what some variety packs
      // carry: no sub-range on the box at all. Odd to read and true.
      "Blue Buffalo",
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
    // Named as 9Lives names them NOW, which on this brand is a moving target:
    // the maker prints "Paté" where retailers still index "Meaty Paté", and
    // "Bites" and "Shreds" have replaced "Hearty Cuts" and "Tender Morsels" on
    // the shelf. "Indoor Essentials" came off a shopper's scan and is the
    // current name of the bag Walmart still lists as "Indoor Complete" — same
    // bag, same UPC.
    //
    // The three shelf-memory names at the end were written before any 9Lives
    // product was seeded and are believed superseded. They stay anyway: a
    // superseded range shows zero products forever, which costs nothing, while
    // removing one that is still on a shelf somewhere files its products under
    // "Other".
    lines: [
      "Daily Essentials",
      "Indoor Essentials",
      "Kitten Essentials",
      "Morris’ Catch",
      "PLUS High Protein",
      "PLUS Urinary Tract Health",
      "Paté",
      "Kitten Paté",
      "Bites",
      "Shreds",
      "Senior Shreds",
      // The variety packs, which are ranges of their own on this brand.
      "Paté Favorites",
      "Poultry & Beef Favorites",
      "Seafood & Poultry Favorites",
      "Surf & Turf Favorites",
      "Meaty Pate",
      "Tender Morsels",
      "Protein Plus",
    ],
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
    // An ordinary English word — see `leadingWordOnly` above for the three
    // makers who print "Digestive Wellness" on something that is not this.
    leadingWordOnly: true,
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
    // Named as the packs name them. "Classic" was shelf memory; the cans say
    // "Classic Cat". And Weruva is renaming as we watch — "Cats in the
    // Kitchen" is becoming "Weruva Cat", and "Wx" is becoming "Wx Phos
    // Focused" — so both halves of each pair are listed, because both are in
    // shops right now under different barcodes.
    lines: [
      "Classic",
      "Classic Cat",
      "Cats in the Kitchen",
      "Cats in the Kitchen Kitten",
      "Cats in the Kitchen Paté",
      "Weruva Cat Paté",
      "Weruva Kitten",
      "Cat Stew",
      "TruLuxe",
      "Senior",
      "Freeze Dried",
      "Wx",
      "Wx Phos Focused",
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
    // Named as Ziwi names them on the bag. The first four here were written
    // from memory of the shelf before any Ziwi product was seeded, and three
    // of them were wrong in the way that matters: "Air-Dried" and
    // "Provenance" are not ranges but halves of range names, so every product
    // would have filed under "Other" on the coverage page.
    lines: [
      "Original Air-Dried",
      "Original Canned Wet",
      "Provenance Air-Dried",
      "Provenance Canned Wet",
      "Steam & Dried",
      "Air-Dried Chews",
      "Good Dog Rewards",
      "Raw Superboost",
    ],
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
  {
    name: "I and love and you",
    owner: "Independent",
    species: "both",
    // The brand's own spelling is lower case and spells out "and" three
    // times, which nothing else on a shelf does — so the aliases carry the
    // ampersand and the plus, which is how retailers, Open Food Facts and a
    // model reading a photograph render it.
    aliases: ["i and love and you", "i & love & you", "i+love+you", "iandloveandyou"],
    // Every range named here came off a pack in the research ledger rather
    // than out of shelf memory, which is why the list is unusually long and
    // unusually odd. This maker names ranges the way it names flavours — "Nice
    // Jerky!", "Good Golly Gullet Stix", "Whascally Wabbit" — and several
    // ranges hold one product. Listing them anyway is what keeps a hundred
    // products off "Other" on the coverage page.
    //
    // "In The Raw / Stir & Boom" is a rename caught mid-flight: two 5.5 lb
    // bags carry the old name and a barcode the maker now sells under the new
    // one. Both halves are listed because both are printed on packs that exist.
    lines: [
      "Original Recipe",
      "Naked Essentials",
      "Naked Essentials Ancient Grains",
      "Naked Essentials Puppy",
      "Nude Super Food",
      "Lovingly Simple",
      "Baked & Saucy",
      "Stir & Boom",
      "In The Raw / Stir & Boom",
      "Raw Raw",
      "XOXOs",
      "Feed Meow",
      "Irresist-A-Bowls",
      "Top That",
      "Treat Meow",
      "Fillin Good",
      "Nice Jerky!",
      "Meow & Zen Hearties",
      "Hip Hoppin' Hearties",
      "Ear Candy",
      "No Stink! Bully Sticks",
      "Free Ranger Bully Stick",
      "Free Ranger Braided Bully Stix",
      "Good Golly Gullet Stix",
    ],
  },
  {
    name: "TheraDiet",
    // Baystride owns the mark; every pack and every product page is published
    // as Rayne Nutrition, so both spellings have to fold to this row.
    owner: "Baystride (Rayne Nutrition)",
    species: "both",
    aliases: ["rayne", "rayne nutrition", "rayne clinical nutrition", "thera diet"],
    // Rayne names a range by protein and by clinical target, joined with a
    // hyphen — "MAINT" is maintenance, and it is part of the range name, not a
    // suffix to strip. Only the two below are seeded; the brand sells more, and
    // batch 028 held the rest for want of a proven barcode rather than a deck.
    lines: ["Rabbit-MAINT", "Low Fat Kangaroo-MAINT"],
  },
  { name: "Only Natural Pet", owner: "PetSmart", species: "both" },
  { name: "Wild Earth", owner: "Independent", species: "dog" },
  { name: "Tender & True", owner: "Independent", species: "both", aliases: ["tender and true"] },
  { name: "Newman's Own", owner: "Independent", species: "both", aliases: ["newmans own"] },
  { name: "K9 Natural", owner: "Independent", species: "dog" },
  { name: "Feline Natural", owner: "Independent", species: "cat" },
  { name: "Applaws", owner: "Independent", species: "both" },
  { name: "Almo Nature", owner: "Independent", species: "both" },
  { name: "Catit", owner: "Hagen", species: "cat" },
  {
    name: "Reveal",
    // MPM Products Limited makes it — the same maker as Applaws, two rows
    // above — and MPM was sold by 3i to Partners Group in September 2025.
    owner: "MPM Products (Partners Group)",
    species: "cat",
    aliases: ["reveal pet food", "mpm products"],
    // Batch 029. The split down this list is the whole point of it: Entrées
    // is a complete and balanced diet, and Limited Ingredient — the 2.47 oz
    // tins that are most of what the brand sells — is COMPLEMENTARY, printed
    // "for intermittent or supplemental feeding only" and filed by PetSmart
    // under toppers. lib/nutrition-role.ts is scoped to this brand for that
    // reason; Merrick sells complete dog food under almost the same words.
    lines: [
      "Entrées",
      "Limited Ingredient",
      "Bone Broth",
      "Lickable Treat",
      "Freeze Dried Treats",
      "Whole Loin",
    ],
  },
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
