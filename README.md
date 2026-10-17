# Dr. Aromal Specialist Dental Care — Premium Static Website Demo

## Run locally
Open `index.html` in a browser, or serve this folder with any static HTTP server. No build step or package installation is required. The project is suitable for GitHub Pages and similar static hosting.

## Structure
- `index.html`, `treatments.html`, `team.html`, `clinic-one.html`, `clinic-two.html`: five static pages.
- `css/style.css`: existing styles plus the premium redesign layer appended at the end.
- `css/animations.css`: restrained entrance motion and reduced-motion support.
- `js/main.js`: navigation, appointment enquiry modal, team filters and manual case-carousel interactions.
- `js/config.js`: verified contact values must be entered here before launch.
- `assets/images/`: original locally authored illustrative SVG assets and legacy supplied poster images.
- `ASSET-MANIFEST.md`: asset purpose and provenance.

## Important media decision
The two legacy MP4 videos have been removed from the final package and are not referenced by any page. The homepage uses a lightweight original SVG illustration instead of video. The illustration is not an image of the actual clinic. This avoids low-quality footage, large downloads, and misleading presentation while the client media is pending.

## Replace illustrative visuals
Replace the original SVG files in `assets/images/` with approved clinic photography only after obtaining client approval and any required patient consent. Keep the filenames or update the corresponding HTML paths. Never present generated or illustrative graphics as authentic clinic photography or clinical outcomes.

## Configure contact information
Edit `js/config.js`. Set the verified WhatsApp number, each clinic's name, telephone number and maps URL only after the client confirms them. Empty values are intentionally left blank. The enquiry modal shows a clear alert if a contact number has not been configured. The website does not provide live calendar booking.

## Client details to confirm before launch
- Official clinic names, addresses, opening hours and map links for both locations.
- Verified phone and WhatsApp numbers.
- Dr. Aromal's approved portrait, name presentation, qualifications and profile copy.
- Actual clinician names, credentials and specialities.
- Final treatment list and availability at each clinic.
- Approved clinic photography and any patient-media permissions.
- Genuine reviews and public review URL, if they are to be shown.
- Any authentic before-and-after cases with consent and accurate descriptions.

## Asset status and dependencies
The new hero and treatment visuals are original local SVG illustrations and do not require an external image licence. They are demo artwork, not clinical evidence. The site uses plain HTML, CSS and JavaScript without a build system or new runtime dependency. Google Fonts are not required by the redesign layer; local system fallbacks are provided.


## Visual demo assets

This demo includes locally stored illustrative generated JPG crops in `assets/images/`. They demonstrate the intended visual direction and are not authentic clinic, staff, patient, or clinical-result photographs. Replace them with approved clinic assets before publishing. The previously rejected WhatsApp videos are not included. No new video was added because a commercially usable video file could not be independently verified in this run. See `ASSET-MANIFEST.md`.
