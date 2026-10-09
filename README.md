# Dr. Aromal — Premium Five-Page Website

Static HTML/CSS/JavaScript. No build tools required.

Pages: `index.html`, `treatments.html`, `team.html`, `clinic-one.html`, `clinic-two.html`.

Preview by opening `index.html` or using VS Code Live Server. Upload the extracted files to your hosting public web root.

Before launch, replace Clinic One/Two, addresses, hours, phone numbers, map links, doctor names, credentials, specialties, treatment availability and media placeholders with verified clinic-approved information. Do not publish unverified claims or reviews.

Edit `js/config.js` to set verified clinic phone numbers and WhatsApp number. Booking asks visitors to choose a location first, then routes to call/WhatsApp; this is not live calendar booking. Hero and gallery areas are styled placeholders, ready for the doctor’s approved photos/videos.


## Homepage looped hero video
The homepage is wired for a muted, autoplaying, looping hero video. Add the clinic-approved MP4 as `assets/videos/hero-loop.mp4` (keep it reasonably compressed, ideally H.264 MP4, 1080p or smaller). The video uses `autoplay`, `muted`, `loop`, and `playsinline`; a designed fallback is shown if the file is missing or playback is blocked. Replace `assets/images/hero-poster.svg` with an approved still poster if desired. Respect patient privacy and obtain consent for any identifiable people shown.


## Motion and accessibility
The shared motion system uses lightweight CSS transitions and IntersectionObserver reveals. It includes responsive card feedback, a compact-on-scroll glass header, an accessible mobile menu, and reduced-motion/reduced-transparency fallbacks. No animation library or build step is required.

## Hero video placeholder
The homepage already contains a ready-to-replace hero video component. Add the approved MP4 to `assets/videos/hero-loop.mp4`; the poster placeholder at `assets/images/hero-poster.svg` remains visible until playback begins. For users who prefer reduced motion, the video is paused/hidden and the still placeholder remains.


## Interactive showcase features
- Homepage: auto-rotating 3D-style before/after case carousel with touch/pointer swipe and manual controls. Add only approved patient images and truthful case details.
- Homepage: animated review cards. To show live Google reviews, configure `reviewsEndpoint` in `js/config.js` to point to an HTTPS backend/proxy you control. The endpoint should return JSON like `{ "reviews": [{ "author_name": "Reviewer", "rating": 5, "text": "Review text" }] }`. Do not put private Google API keys in this static website. Google Places reviews are subject to API limits and may not represent every review or update instantly.
- Treatments: horizontally swipeable speciality cards that do not force the whole page sideways.
- Team and clinic pages: continuously moving doctor-card conveyor belts that pause on hover/focus/touch.
- Smooth cross-document transitions use the browser View Transitions API where supported, with normal navigation as fallback.
- Replace all placeholder review content with real, verified reviews and use patient images only with documented consent.
