# Design System Document: The Ethereal Canvas

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Sanctuary"**

This design system moves away from the aggressive, high-frequency layouts of traditional social media. It is built on the philosophy of **Soft Minimalism**—an intentional rejection of hard lines, urgent notifications, and sensory overload. We are creating an environment that feels like a safe, quiet room where thoughts can resonate without judgment.

To break the "standard app" feel, we employ **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid grids, we use geometric motifs (circles and hexagons) to break the verticality of the scroll. Elements should feel like they are floating in a fluid space, using overlapping layers and varying corner radii to create a custom, high-end editorial rhythm that prioritizes the "soul" of the message over the status of the messenger.

---

### 2. Colors: Tonal Atmosphere
Our palette is curated to lower the user's heart rate. It uses a range of cool purples and grounded teals to evoke a sense of twilight and calm.

#### Primary & Secondary Roles
- **Primary (`primary` #3b309e):** Reserved for the most critical actions and brand moments.
- **Primary Container (`primary_container` #534ab7):** Used for large interactive surfaces where a "glow" effect is desired.
- **Secondary (`secondary` #006c52):** Used for "growth" and "affirmation" actions—upvotes, supportive echoes, and positive tags.

#### The "No-Line" Rule
**Borders are strictly prohibited for sectioning.** To define the end of one content block and the start of another, use background color shifts. A `surface_container_low` card should sit directly on a `surface` background. If you feel the need for a line, increase the padding instead.

#### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine, handmade paper. 
- **Base Layer:** `surface` (#fcf9f5)
- **Secondary Layer:** `surface_container_low` (#f6f3f0) for grouping related thoughts.
- **Accent Layer:** `surface_container_highest` (#e5e2df) for persistent navigation or high-priority modals.

#### The "Glass & Gradient" Rule
To add professional polish, use **Glassmorphism** for floating headers or navigation bars. Use a background blur of `20px` combined with a 60% opacity version of `surface_container_lowest`. 
*Signature Gradient:* For Hero CTAs, use a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle.

---

### 3. Typography: The Warm Voice
We use two distinct typefaces to balance modern aesthetics with approachable warmth.

| Level | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display (L/M/S)** | Plus Jakarta Sans | 3.5rem - 2.25rem | Editorial impact; used for anonymous "Big Thoughts." |
| **Headline (L/M/S)** | Plus Jakarta Sans | 2.0rem - 1.5rem | Section headers and large quote callouts. |
| **Title (L/M/S)** | Be Vietnam Pro | 1.375rem - 1.0rem | Content titles and prominent labels. |
| **Body (L/M/S)** | Be Vietnam Pro | 1.0rem - 0.75rem | The "Echo" text. Max readability, generous line height. |
| **Label (M/S)** | Be Vietnam Pro | 0.75rem - 0.68rem | Metadata (e.g., "3m ago", "In the Void"). |

**Editorial Note:** Always use `title-lg` for anonymous handles (e.g., "Curious Hexagon") to give them a sense of presence despite their anonymity.

---

### 4. Elevation & Depth
In this system, elevation is conveyed through color and light, not heavy drop shadows.

- **The Layering Principle:** Depth is achieved by stacking. A `surface_container_lowest` (#ffffff) card placed on a `surface_container` (#f0edea) creates an immediate, soft lift.
- **Ambient Shadows:** When a "floating" action button or modal is required, use a shadow with a blur radius of `40px`, a `12px` Y-offset, and an opacity of 6% using the `on_surface` color. It should feel like a soft glow, not a shadow.
- **The "Ghost Border" Fallback:** For accessibility in input fields, use the `outline_variant` token at 15% opacity. Never use a 100% opaque border.
- **Soft Geometry:** Apply the `xl` (3rem) radius to large containers and `md` (1.5rem) to smaller cards. Geometric motifs (circles, triangles) should be used as background watermarks in `primary_fixed` at 5% opacity to break the monotony of empty space.

---

### 5. Components

#### Buttons
- **Primary:** Rounded `full`. Background: Signature Gradient (`primary` to `primary_container`). Text: `on_primary`.
- **Secondary:** Rounded `full`. Background: `secondary_container`. Text: `on_secondary_container`.
- **Tertiary:** No background. Text: `primary`. Subtle scale-up (1.05x) on interaction.

#### Input Fields
- **Style:** Use `surface_container_low` with a `lg` (2rem) corner radius. 
- **Focus State:** Transition the background to `surface_container_lowest` and add a "Ghost Border" of `primary` at 20% opacity. No hard outlines.

#### Cards & Lists
- **Rule:** Forbid divider lines.
- **Implementation:** Use `1.5rem` to `2rem` of vertical white space to separate list items. Each item should be a card with a `md` radius and a background shift (e.g., alternating between `surface` and `surface_container_low`).

#### The "Echo" Bubble (Custom Component)
The core content container. Use an asymmetric radius (e.g., Top-Left: `xl`, Top-Right: `xl`, Bottom-Left: `sm`, Bottom-Right: `xl`) to mimic a speech bubble without the literal "tail." Use `surface_container_lowest` to make it pop against the background.

---

### 6. Do's and Don'ts

#### Do:
- **Embrace White Space:** If a screen feels "empty," don't add more content; adjust the typography to a larger scale.
- **Use Tonal Color for Hierarchy:** Use `on_surface_variant` (#474553) for secondary text to maintain a soft contrast ratio that is still accessible.
- **Animate Softly:** Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for transitions to give elements a "bouncy," organic feel.

#### Don't:
- **No Photography:** Use only geometric shapes and typography. The anonymity is the feature.
- **No Hard Corners:** Never use a radius smaller than `sm` (0.5rem). Everything must feel touchable and safe.
- **No High-Contrast Borders:** Never use `#000000` or heavy `outline` tokens. This breaks the "Sanctuary" illusion.
- **No "Alert" Red:** Use the `error` token (#ba1a1a) sparingly and always within an `error_container` to soften the blow of a mistake or error message.