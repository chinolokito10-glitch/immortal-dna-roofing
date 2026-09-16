# Architectural imagery

Created using the **imagegen skill and built-in image generation tool**, not the API/CLI fallback. These are architectural illustrations, not actual Northline jobs. No stock images of another contractor’s projects are used. Project examples and the footer disclose the generated imagery.

The final project assets are `assets/hero-{640,960,1440}.webp`, `assets/detail-{640,960}.webp`, and `assets/project-{640,960,1600}.webp`. Originals are preserved in the generation output directory. The locally hosted WebP derivatives are the website’s final assets. `scripts/optimize-images.js` produces responsive sizes at quality 83.

## Final hero prompt

Use case: photorealistic-natural. Asset type: premium roofing website architectural hero photograph. Create one high-resolution landscape architectural photograph, approximately 4:3. A beautiful credible Quebec South Shore residential house, pale limestone and warm off-white brick facade, steep gabled dark charcoal asphalt-shingle roof, precise ridge and flashing, a small front gable, dark framed windows. Camera slightly elevated at eave level, looking diagonally across the large roof so roof surface occupies upper two thirds and the warm facade is in lower third; maple trees and subdued green foliage behind with pale sky. Architectural magazine quality, realistic small imperfections, soft late afternoon light, naturally warm muted colors, sophisticated calm composition, crisp detailed shingles. No people, no branding, no text, no watermark, no extravagant mansion, no palm trees. This is illustrative imagery for a roofing website, not a real completed project. Save the image as a project asset if possible.

## Final detail prompt

Use case: photorealistic-natural. Asset type: roofing website supporting image. One landscape architectural detail photograph, 4:3. Beautiful dark charcoal asphalt shingles on a steep pitched residential roof in Quebec, a neat metal valley and a ridge intersect diagonally in a strong geometric composition. Small portion of pale limestone gable and white fascia at lower right. Trees soft in distance at very top. Roof closeup, no people, no tools, no text. Soft natural daylight, warm neutral muted palette, high resolution realistic granular shingle textures, premium architectural editorial photography. Image illustrative, no real project implied.

## Final project prompt

Use case: photorealistic-natural. Asset type: premium roofing website project example photograph. One wide landscape 16:9 photograph of a tasteful two-storey Quebec South Shore home from street level in late summer. Charcoal asphalt shingle steep roof with refined gables, warm pale brick and limestone walls, black framed windows, simple timber front door, attached garage on right. Large handsome roof visibly dominates upper half of facade. Neat understated green landscaping, mature maples, no people, no vehicles, no text or watermark, no logos. Architectural magazine photograph, realistic fine textures, soft late afternoon daylight, naturally warm and muted, professional composition using diagonal driveway leading to the house. Modest premium family home, not extravagant mansion. This is illustrative imagery, not a real completed company project.

## Font

Inter Tight variable font, locally hosted as `assets/inter-tight-latin.woff2`, obtained from Fontsource’s CDN. SIL Open Font License included as `assets/font-license.txt` from the Google Fonts Inter Tight directory. A system sans-serif stack is retained as a fallback.
