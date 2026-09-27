# Wanderlog — Travel Memory Blog

A lightweight travel journal for keeping memories of places visited. The first version is a static front-end that can be hosted on GitHub Pages or any static web host.

## Current features

- Travel memory cards with title, date, location and story
- Search across saved memories
- Interactive geographical map using Leaflet + OpenStreetMap
- Automatic place lookup through OpenStreetMap Nominatim when a location is entered
- Clickable map markers that open the corresponding memory
- Per-memory comments
- Photo selection and preview
- Responsive desktop/mobile layout
- Browser-local persistence with `localStorage`

## MVP limitation

The current version stores memories, comments and selected photos in the browser's local storage. Data is therefore local to that browser/device and is not yet a shared online database. Photos are stored as browser data URLs, so this is intentionally a prototype rather than the final multi-user architecture.

## Planned next phase

1. Authentication / private accounts
2. Database-backed travel entries and comments
3. Object storage for photos
4. Image resizing and thumbnails
5. Edit/delete memories
6. Drag/drop photo upload and galleries
7. Precise map pin editing and reverse geocoding
8. Public/private memory controls
9. Tags such as food, hotel, nature, family and activities
10. Timeline and trip grouping
11. Backup/export of the complete travel archive

The UI is designed so these backend capabilities can be added without changing the core concept.
