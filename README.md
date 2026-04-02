<div align="center">
  <div style="background: #1e293b; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
    <h1 style="margin: 0; color: #f8fafc; font-family: monospace; letter-spacing: 2px;">LATTICE</h1>
  </div>
  <p><strong>A high-performance, self-hostable infinite canvas and node-based workspace built on Svelte 5.</strong></p>
</div>

---

## 🌌 Overview

Lattice is an incredibly fluid infinite canvas application designed to bring spatial organization to your thoughts, architectures, and data. Whether you want to map out software diagrams, write dynamic sticky notes, or build structured nesting boards, Lattice renders it all seamlessly. 

It is engineered from the ground up to be blazingly fast using Svelte 5 runes, fully responsive across touch and desktop platforms, and highly secure for true production self-hosting.

## ✨ Core Features

- **Infinite Spatial Canvas**: Native zooming, panning, and rendering without latency restrictions.
- **Node Mechanics**: Draggable, resizable components including Markdown Text Notes, YouTube Video embeds, and nested 'Decks' or 'Columns'.
- **Magnetic Connectivity**: Draw smooth, labeled bezier-curve connecting lines directly between Anchor points on any card to map out architectures.
- **Hierarchical Nesting**: Drag nodes directly inside other 'Column' Decks to automatically inherit hierarchy. 
- **Hybrid Storage Engine**:
  - **Local Mode:** Completely offline, snappy browser `localStorage` integration for total privacy.
  - **Cloud Mode:** Supabase integration for cross-device syncing, debounced Postgres saving, and real-time state tracking.
- **Production-Ready Security**: Out-of-the-box Markdown sanitation (via `DOMPurify`) to prevent XSS, and strictly typed authentication flows.
- **DevOps Perfected**: Pre-configured robust multi-stage Dockerfile utilizing SvelteKit's standalone Node adapter, optimizing it perfectly for self-hosting behind Cloudflare or NGINX.

## 🚀 Quick Start (Local Development)

Ensure you have Node 20+ installed.

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Your app will be live at `http://localhost:5173`.

## ☁️ Deployment & Self-Hosting

Lattice is fully configured to be securely self-hosted utilizing **Docker** and **Supabase**, allowing you to bypass vendor lock-in.

### 1. Environment Configuration
Create a `.env` file at the root of your project:
```env
# Storage routing: 'local' | 'cloud'
PUBLIC_STORAGE_MODE=cloud

# Supabase cloud variables (Required for cloud mode)
PUBLIC_SUPABASE_URL=https://<your-id>.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-anon-key>

# Performance & Security Limits
PUBLIC_DEBOUNCE_TIMEOUT_MS=5000
PUBLIC_MAX_CARDS_PER_BOARD=500
```

### 2. Docker Containerization
Lattice ships with an ultra-lightweight Multi-stage Alpine container configuration. You can boot the entire production-grade server in a single command:

```bash
docker compose up -d --build
```
> The container automatically installs native C++ bindings for Linux, strips development dependencies, and securely serves your application on port `5173`. 

### 3. Database Constraints (Supabase Setup)
If deploying onto the cloud, make sure you configure your Postgres Database limits by heading to your Supabase SQL editor and running the following constraint. This defends against payload bombing attacks on your API:
```sql
ALTER TABLE public.boards 
ADD CONSTRAINT max_payload_size 
CHECK (
    octet_length(nodes::text) + octet_length(connections::text) <= 5000000
);
```

## 🛠 Tech Stack
* **Frontend**: Svelte 5 (Runes Mode), SvelteKit, TailwindCSS 4
* **Backend Database**: Supabase (PostgreSQL), Supabase Auth (Google OAuth/PKCE)
* **DevOps**: Docker, Node.js Adapter
* **Security**: DOMPurify, Marked

## 🤝 Contributing
Currently managed and maintained by `sirreajohn`. Feel free to open issues or pull requests to advance the node types or magnetic snapping heuristics!
