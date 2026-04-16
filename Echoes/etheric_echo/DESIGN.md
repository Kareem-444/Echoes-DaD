# Design System Document: The Ethereal Echo

## 1. Overview & Creative North Star
**The Creative North Star: "Digital Fluidity"**

To design for Gen Z is to design for a generation that rejects rigid structures and traditional hierarchies. This design system moves away from the "boxed-in" nature of traditional social media. We are building a "Digital Fluidity" experience—an anonymous space that feels like a continuous, breathing stream of consciousness rather than a database of entries.

By utilizing **Soft Minimalism**, we prioritize content through tonal shifts and geometric abstraction. We intentionally break the "template" look by using exaggerated typographic scales, asymmetrical layouts, and overlapping containers that suggest depth without the clutter of 1px lines. Every element should feel like it is floating in a curated, atmospheric void.

---

## 2. Colors & Surface Architecture

The palette is built on a foundation of "Warm Ink" and "Electric Deep-Sea." It balances the grounded nature of a paper-like surface with the digital vibrance of our primary gradients.

### The "No-Line" Rule
**Borders are strictly prohibited for sectioning.** To define boundaries, you must use background shifts. For example, a feed of "Echoes" should sit on `surface_container_low`, while the individual post cards use `surface_container_lowest`. The separation is felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent layers. 
- **Base Level:** `surface` (#fcf9f5) – The canvas.
- **Sectioning:** `surface_container_low` (#f6f3ef) – For sidebars or secondary feed areas.
- **Interactive Elements:** `surface_container_highest` (#e5e2de) – For elevated states or navigation headers.

### The "Glass & Gradient" Rule
Standard flat colors lack "soul." 
- **Primary CTAs:** Use the **Primary Gradient** (135deg #3b309e to #534ab7).
- **Secondary/Connect CTAs:** Use the **Transition Gradient** (135deg #534ab7 to #5dcaa5).
- **Floating Navigation:** Use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur to create a "frosted glass" anchor that allows content to flow beneath it.

---

## 3. Typography: Editorial Authority

We pair the geometric confidence of **Plus Jakarta Sans** with the modern, readable clarity of **Be Vietnam Pro**.

- **Display (Plus Jakarta Sans):** Used for "Hero" moments and anonymous confessions. The scale is intentionally large (`display-lg` at 3.5rem) to create an editorial, magazine-like feel.
- **Body (Be Vietnam Pro):** Used for the core of the social experience. It provides high legibility even at smaller sizes (`body-md` at 0.875rem) for long-form thoughts.
- **Tonal Contrast:** Use `on_surface_variant` (Text Muted) for metadata and timestamps to ensure the `on_surface` (Text Primary) content commands the user's attention.

---

## 4. Elevation & Depth

We eschew traditional "drop shadows" in favor of **Tonal Layering** and **Ambient Glows**.

### The Layering Principle
Hierarchy is achieved by "stacking."
1. **The Background:** `surface`
2. **The Container:** `surface_container_low`
3. **The Content Card:** `surface_container_lowest`

### Ambient Shadows
For floating cards or modals, use the system shadow: `0px 4px 24px rgba(83, 74, 183, 0.08)`. Notice the shadow is tinted with our primary purple; this creates a "glow" effect rather than a "dirty" grey shadow, maintaining the premium feel.

### The "Ghost Border" Fallback
If contrast testing fails for accessibility, use a **Ghost Border**: `outline_variant` (#c8c4d5) at **15% opacity**. It should be barely perceptible—a hint of a boundary, not a wall.

---

## 5. Components

### Buttons
- **Shape:** All buttons must use `rounded-full` (xl) for a friendly, modern feel.
- **Primary:** 135deg gradient (#3b309e to #534ab7) | Text: `on_primary`.
- **Connect:** 135deg gradient (#534ab7 to #5dcaa5) | Text: `on_primary`.
- **States:** On hover, apply a `2px` inner glow or scale to 102%—never change the border.

### Content Cards
- **Construction:** Use `surface_container_lowest`.
- **Corner Radius:** `1.5rem` (md) for standard cards; `2rem` (lg) for hero cards.
- **Rule:** No dividers. Use `24px` of vertical white space to separate the header from the body text.

### Geometric Imagery
Since photography is forbidden, use geometric primitives (circles, squares, and arcs) using the `secondary_fixed_dim` and `primary_fixed` tones. Overlap these shapes at 50% opacity to create unique "identity patterns" for anonymous users.

### Input Fields
- **Background:** `surface_container_high`.
- **Border:** None.
- **Focus State:** A subtle `2px` glow using `primary_container` at 40% opacity.

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place a "Post" button slightly off-center or use varying card heights to create a dynamic "Masonry" feed.
- **Embrace White Space:** If you think there is enough margin, add 8px more. White space is the luxury of this system.
- **Use Tonal Shifts:** Transition from `surface` to `surface_low` to indicate a shift from "Public" to "Private" spaces.

### Don't:
- **Never use a 1px solid border.** This immediately cheapens the UI and makes it look like a generic template.
- **Don't use pure black (#000000).** Use `Text Primary` (#1c1b1f) for depth.
- **Don't use photography.** If a placeholder is needed, use an abstract geometric composition based on the user's "Echo" signature.
- **Don't use sharp corners.** The minimum radius is `0.5rem` (sm), but the preference is always for `1.5rem` (md) or higher.