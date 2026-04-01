# Changelog

## 2026-04-01
- Show only primary operating airline logo in best finds (longest segment, not booking program)
- Keep date/cabin section always in DOM to prevent focus loss while typing in "to" field
- Remove `autoFocus` from date input so it doesn't interrupt typing
- Show date section after 3 characters typed in "to" field (without interrupting typing)
- Filter destination tiles strictly to user's detected origin airport (no fallback to other cities)
- Filter best finds and destination tiles to tomorrow onwards (`date >= tomorrow`)
- Bust localStorage cache to force re-fetch with updated filter
- Show flights from tomorrow onwards instead of tomorrow only

## 2026-03-31
- Deploy flyai_logo.png as nav logo (user-supplied PNG)
- Increase nav height to `h-28`, logo to `h-24`
- Add `flyai.net` domain to Vercel project
- Filter best finds and destination tiles to tomorrow's date only
- Daily localStorage cache for best finds and destination tiles (resets at 00:00 UTC)
- Skeleton loading rows for best finds (no spinner flash on first visit)
- Instant hydration from localStorage on warm cache
- Expand-then-book pattern: click row/tile to expand details, then Book button
- Fix destination tiles not showing (relax `availability_exists` filter)
- Fix date section appearing too early (was triggering after 2 chars via `fromReady`/`toReady`)
- Widen destination tiles (`w-56` → `w-72`)
- Fix timeline bug: now shows arrival for every segment, not just the last
- Only expand the clicked tile (not all three); wobble paused when expanded
- `tileToBooking()` mapping so clicking a tile/row goes to booking page
- Inline `FlyaiLogo` SVG component using Caveat font (replaced external `logo.svg` img)
- Custom `favicon.svg` plane icon
- Replace nav logo text with SVG image

## Earlier
- Location detection with nearest airport (Haversine formula)
- Step-by-step search reveal (From → To → Date → Search button)
- Destination tiles with wobble animation
- Search by city name with autocomplete
- Full redesign: FlyAI branding, boarding pass cards, new nav, Caveat font, warm palette
- Route Appa pings through Railway proxy
- Remove price breakdown lines from booking page
