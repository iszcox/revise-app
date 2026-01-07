# Revise - Medical Notes PWA

A modern, offline-first application for young doctors to revise their personal notes.

## Features
- **Import**: Easily import `.txt` and `.md` notes.
- **Revise**: Randomly surface topics to test your recall.
- **Library**: Search and browse your entire collection.
- **Offline**: Works without internet (PWA + IndexedDB).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Tech Stack
- Vue 3 + TypeScript + Vite
- Tailwind CSS v4
- Pinia (State Management)
- IndexedDB (Persistence)
- PWA (Offline support)