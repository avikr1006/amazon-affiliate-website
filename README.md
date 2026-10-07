# KartGuru — The Ultimate Buying Guide

A lightweight static Amazon affiliate/review website built with HTML, CSS and JavaScript.

## Important design rule
This version preserves the existing KartGuru visual design, navigation, cards, review layout, spacing and responsive behavior. The product-system changes below are intended to improve maintainability and robustness without redesigning the site.

## Categories
- Mobiles: Smartphones, Budget Smartphones, Premium Smartphones, Mobile Accessories
- Laptops: Gaming Laptops, Business Laptops, Student Laptops, Ultrabooks
- Monitors: Gaming Monitors, 4K Monitors, Office Monitors, Ultrawide Monitors
- TVs: LED TVs, QLED TVs, OLED TVs, 4K TVs
- Home Appliances: Air Conditioners, Refrigerators, Washing Machines, Air Purifiers, Microwaves
- Books: Fiction, Non-Fiction, Education & Learning, Competitive Exams, Children's Books
- Fashion: Men's Fashion, Women's Fashion, Kids' Fashion, Footwear, Watches & Accessories
- Beauty: Skincare, Hair Care, Makeup, Fragrance, Beauty Tools

## Product data
Product data is maintained in `products.json`. Products are not hard-coded in `script.js`.

### Product ID architecture
Each category has a reserved numeric ID range:

| Category | ID range |
|---|---:|
| Mobiles | 101–199 |
| Laptops | 201–299 |
| Monitors | 301–399 |
| TVs | 401–499 |
| Home Appliances | 501–599 |
| Books | 601–699 |
| Fashion | 701–799 |
| Beauty | 801–899 |

The ID rules are enforced by `script.js`:
- `id` is mandatory.
- `id` must be an integer.
- Every product ID must be unique.
- The ID must belong to the reserved range for its category.
- Required product fields must be present.

Sequential numbering is **not** required. For example, if product `102` is removed, `103` can still be used normally.

### Adding a product
Add the new object under the appropriate category section in `products.json`, leaving a blank line between product objects for readability.

Example mobile:

```json
{
  "id": 103,
  "name": "Example Smartphone",
  "description": "Example description",
  "image": "images/example-smartphone.png",
  "amazonLink": "YOUR_COMPLIANT_AMAZON_AFFILIATE_LINK",
  "category": "Mobiles",
  "subcategory": "Smartphones",
  "specs": {},
  "pros": [],
  "cons": [],
  "verdict": "Editorial verdict."
}
```

Example laptop:

```json
{
  "id": 201,
  "name": "Example Laptop",
  "description": "Example description",
  "image": "images/example-laptop.png",
  "amazonLink": "YOUR_COMPLIANT_AMAZON_AFFILIATE_LINK",
  "category": "Laptops",
  "subcategory": "Ultrabooks",
  "specs": {},
  "pros": [],
  "cons": [],
  "verdict": "Editorial verdict."
}
```

### Why there are no `//` comments in products.json
Standard JSON does not support comments. Adding `// Mobiles`, `// Laptops`, etc. would make the file invalid and prevent the browser from parsing it. Category grouping is therefore represented by ordering and blank lines, while the category-to-ID architecture is documented above and enforced in JavaScript.

## Image fallback
Product images have a local fallback at:

`images/product-placeholder.svg`

The fallback is used in both places where product images are rendered:
- Product cards
- Individual product review pages

If a product image fails to load, KartGuru automatically shows the local placeholder instead of leaving a broken/empty image area.

## Current products
The two existing products are assigned to the Mobiles range:
- `101` — boAt Nirvana Ion ANC
- `102` — boAt Airdopes Prime 701 ANC

The Nirvana Ion ANC entry now points to `images/boat-nirvana-ion-anc.png`. Make sure the correctly named image file exists in the `images/` folder.

## Run locally
No npm is required.

Use VS Code Live Server, or:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## GitHub Pages
Push the files to the repository and enable GitHub Pages from the repository's Settings → Pages.

## Affiliate compliance
Keep the Amazon Associate disclosure visible and use only compliant Amazon Associates links/content. Verify current Amazon Associates policies before publishing or adding price/availability claims.
