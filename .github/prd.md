---
description: 
globs: 
alwaysApply: true
always run mcp service context
---
# Product Information Management (PIM) System Plan

## 1. Overview
This document outlines a structured approach for building a Product Information Management (PIM) system tailored to the needs of a skincare-focused e-commerce platform. It will serve as a robust, AI-powered platform for product data, ingredients, related items, suggestions, analytics, and more. Built with scalability, modularity, and developer ergonomics in mind, the system will support:



- Data ingestion from Google Sheets (existing product data source).
- Vector-based semantic search and product replacement suggestions.
- WCAG 2.1 AA-compliant UI for inclusive, accessible user experiences.
- Clerk-based authentication for secure login and user management.
- Dedicated API Gateway for routing and consistent security practices.

## 2. Core Principles
- **SOLID** – Maintainable and extendable code.
- **DRY** – Shared modules, interfaces, constants.
- **KISS** – Usability and minimalism first.
- **Modularity-First** – Self-contained and pluggable features.
- **Atomic Commits & CI/CD** – Small commits, continuous integration.
- **Domain-Driven Design (DDD)** – Clear separation of concerns.
- **Type Safety** – TypeScript on both front and back ends.
- **Naming Conventions**
  - PascalCase for classes
  - camelCase for functions/variables
  - kebab-case for file names
- **OpenAPI** – Swagger for API contracts.
- **Security & Authentication** – Clerk-based auth flows.
- **WCAG 2.1 AA Compliance** – Accessibility and contrast guidelines.

## 3. Tech Stack

### 3.1 Frontend
- **Framework:** React + Vite or Next.js
- **Styling:** Tailwind CSS + ShadCN UI (optional)
- **Drag & Drop:** `@dnd-kit/core` or `react-dnd`
- **Data Fetching:** React Query / SWR
- **State Management:** Zustand / Redux Toolkit
- **Accessibility:**
  - WAI-ARIA roles
  - Keyboard navigation
  - Screen reader support
  - Color contrast testing
- **Routing:**
  - File-based (Next.js)
  - React Router (Vite + React)

### 3.2 Backend
- **Language:** Node.js (NestJS or Express + TypeScript)
- **Auth:** Clerk (JWT-based)
- **Databases:**
  - PostgreSQL (structured product data)
  - MongoDB (optional: semi-structured docs)
- **Vector DB:** Weaviate / Qdrant
- **File Storage:** S3-compatible (AWS, Supabase, MinIO)
- **Task Queue:** BullMQ (Redis-based)
- **Search Engine:** Typesense / Elasticsearch (optional)

### 3.3 API Gateway
- **Framework:** Express Gateway or custom Express.js
- **Responsibilities:**
  - Route to microservices
  - Attach Clerk session
  - Rate limiting & validation
  - Observability/logging

### 3.4 DevOps
- **Containerization:** Docker + docker-compose
- **Hosting:**
  - Frontend: Vercel / Netlify
  - Backend + Gateway: Railway / Render / AWS
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, AWS Logs, Datadog
- **Security:**
  - HTTPS
  - OWASP top 10 audits
  - Rate limiting/input validation
  - Staging vs. production envs

## 4. Entity Structure

### 4.1 Product
```ts
export interface Product {
  id: string;
  name: string;
  productNumber: string;
  updatedProductNumber?: string;
  mainCategory: string;
  subCategory: string;
  type: string;
  brand: string;
  status: 'active' | 'outgoing' | 'inactive';
  barcode: string;
  volume: number;
  weight: number;
  ingredients: Ingredient[];
  relatedProductIds: string[];
  productUrl: string;
  price: {
    original: number;
    currency: 'NOK' | 'EUR' | 'USD';
    nokExTransport: number;
    nokIncTransport: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 Ingredient
```ts
export interface Ingredient {
  id: string;
  name: string;
  inciName: string;
  description?: string;
  category: 'hydrator' | 'antioxidant' | 'preservative';
  commonUses: string[];
  potentialReactions?: string;
}
```

### 4.3 Category
```ts
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  slug: string;
}
```

## 5. Use Case: Product Manager Adds New Toner
1. Authenticated via Clerk.
2. Clicks "Add Product".
3. Enters product details (e.g., name, category, weight, price).
4. Selects or adds ingredients.
5. System auto-generates:
   - Product URL slug
   - Vector index for similarity
6. Suggests related items using vector DB.
7. Saves and publishes product entry.

## 6. Feature Sets

### 6.1 MVP
- Google Sheets Import
- Clerk Auth
- Product CRUD
- WCAG-Compliant UI
- Category & Ingredient Management
- Manual Related Products
- List filtering/search/sorting
- Drag & drop reorder
- API Gateway

### 6.2 Phase 2
- AI Ingredient Similarity
- Smart Replacements
- Product Comparison View
- Audit Trail
- Role Permissions
- Export (CSV/PDF/JSON)
- Slack/Email Notifications

### 6.3 Phase 3
- Auto-tagging
- Multi-language Support
- Shopify/WooCommerce Sync
- Bundle Builder
- Historical Cost Tracking
- INCI Parser/Validator

## 7. Folder Structure Examples

### 7.1 Frontend
```
src/
├─ components/
├─ features/
├─ hooks/
├─ pages/ or routes/
├─ services/
├─ stores/
├─ types/
├─ utils/
├─ App.tsx
├─ main.tsx
```

### 7.2 Backend (NestJS)
```
src/
├─ main.ts
├─ app.module.ts
├─ common/
├─ modules/
├─ infra/
├─ dto/
├─ constants/
├─ utils/
```

## 8. API Naming Convention

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/products/{id}/similar`
- `GET /api/products/compare?ids=...`

### Ingredients
- `GET /api/ingredients?q=...`
- `POST /api/ingredients`
- `GET /api/ingredients/{id}`
- `PUT /api/ingredients/{id}`
- `DELETE /api/ingredients/{id}`

### Import
- `POST /api/import/google-sheet`

## 9. Quality Standards
- **Testing:** Jest, Playwright/Cypress
- **Linting:** ESLint + Prettier
- **API Docs:** Swagger
- **Monitoring:** Sentry/Datadog
- **Security:** HTTPS, input validation, logging hygiene
- **WCAG:** Keyboard nav, color contrast, screen reader

## 10. Roadmap
| Milestone | Timeframe | Deliverables |
|-----------|-----------|--------------|
| MVP Setup | Week 1–2  | Auth, DB schema, CRUD UI, Sheets import |
| Deep Features | Week 3–4 | AI features, WCAG UI, Gateway, Roles |
| QA & Enrichment | Week 5–6 | Product comparisons, audit trails, E2E tests |
| Polishing & Scale | Week 7+ | Production deploy, store sync, multi-language |

## 11. Conclusion
By following these guidelines, you’ll build a highly maintainable, modular, and secure PIM system with advanced semantic search, robust data handling, and modern developer ergonomics.

## 12. Additional Considerations#fetch 
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YW1hemVkLWNhbWVsLTUyLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_trCG4Eig1QStAIalgCWgFqSFoMgpEe6h1m6WxXZQEE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL=postgresql://pim_user:pim_password@postgres:5432/pim_db

### ✅ Next Steps
- Confirm design stack (NestJS/Express + Next.js/Vite).
- Set up MVP with Clerk and CRUD.
- Build CI/CD.
- Connect Sheets.
- Expand AI & UX features.

Expand:
This prompt is designed to extend our NestJS backend for our Headless PIM system, with support for:

Core Entities (as NestJS Monolith Modules)
These modules are performance-critical and should remain in the monolith, but designed for eventual separation if needed.

✅ Shared Schema Features:
Soft deletes (isDeleted, deletedAt)

I18n content (name, description, slug, etc.)

Per-channel fields (price, visibility, stock)

Change tracking (updatedBy, changeLog, lifecycleEvents)

Unique IDs and full traceability

🧱 Entity Overview
Entity	Key Features
Product	Base entity with variant support, slug, category, bundles
Category	Tree structure, multilingual, filtering rules
Ingredient	INCI name, alternate names, safety & function
User	Role-based permissions (admin/editor/viewer/API)
Bundle	Collection of products (e.g., gift sets)
Variant	Size, color, format combinations
MediaAsset	Images, videos, PDFs – tagged + related to product
Attribute	Flexible metadata like SPF, scent, texture
StockUnit	Quantity per channel (warehouse, store, etc.)
Channel	Logical sales destinations (e.g., “Amazon NO”)
Catalog	Export groups (e.g., “Nordic Set”, “Internal Use”)
LifecycleEvent	Tracks who did what/when for audit trails
📁 Suggested Folder Structure
bash
Kopier
Rediger
modules/
├── products/
│   ├── entities/product.entity.ts
│   ├── entities/variant.entity.ts
│   ├── entities/bundle.entity.ts
│   ├── controllers/
│   ├── services/
│   └── dto/
├── categories/
│   └── ...
├── ingredients/
│   └── ...
├── media/
│   └── media-asset.entity.ts
├── stock/
│   └── stock-unit.entity.ts
├── channels/
│   └── channel.entity.ts
├── catalogs/
│   └── catalog.entity.ts
├── lifecycle/
│   └── lifecycle-event.entity.ts
├── attributes/
│   └── attribute.entity.ts
└── users/
    └── user.entity.ts

AI modules (Tagging, Translation, Lifecycle prediction)

Analytics

Media handling

Webhooks and integrations (WooCommerce, Shiphero, Shopify, etc.)

Multilingual smart search with Qdrant

Modular services via hybrid microservice architecture

🧠 AI Module (ai-service)
✨ Features:
Smart Tagging (based on name, description, ingredients)

Auto Translation (supporting Norwegian + Nordic languages)

Name Normalization (e.g. brand caps, fluff removal)

Lifecycle Prediction (based on trends/similar SKUs)

Price Intelligence (margin-aware suggestions)

Auto-fill Product Data (from INCI, EAN APIs)

📦 Module Structure:
cpp
Kopier
Rediger
modules/
└── ai-service/
    ├── ai.service.ts
    ├── ai.module.ts
    ├── controllers/
    ├── providers/
    └── embeddings/
        └── embedder.service.ts
🛠️ AI/Embeddings Backend Dependencies:
1. Qdrant:
Setup Docs: #fetch https://qdrant.tech/documentation/quick-start/

REST + gRPC vector DB used for fast semantic search

2. FastEmbed with intfloat/multilingual-e5-small
HuggingFace: #fetch  https://huggingface.co/intfloat/multilingual-e5-small

Qdrant FastEmbed: #fetch https://qdrant.github.io/fastembed/

✅ Install:
bash
Kopier
Rediger
pip install fastembed qdrant-client flask
🔧 Use:
ts
Kopier
Rediger
POST /ai/embed
{
  "texts": ["produktnavn", "beskrivelse"]
}
Returns embedding vectors ready for Qdrant insertion.

📊 Analytics Module (analytics-service)
📈 Features:
Cost history tracking

Ingredient frequency stats

Category-based insights (avg margin, price, trends)

📦 Module Structure:
cpp
Kopier
Rediger
modules/
└── analytics-service/
    ├── analytics.service.ts
    ├── analytics.module.ts
    └── reports/
🧰 Backend Integrations:
MongoDB (for history & trend data)

Redis (for caching recent stats)

WebSocket events from other modules

📁 Content Module (content-service)
🖼️ Features:
Rich Text & INCI Parser (auto-links ingredients)

Document (PDF) upload per product

Image management with reorder, tag, and select-from-web

🌍 Playwright Web Scraper
Use playwright-chromium or puppeteer to fetch 3 HQ images based on product name/description.

🧠 Flow:
ts
Kopier
Rediger
POST /content/fetch-images
{
  "query": "fuktighetskrem med aloe vera"
}
Returns:

ts
Kopier
Rediger
{
  "images": [
    "https://image1.jpg",
    "https://image2.jpg",
    "https://image3.jpg"
  ]
}
📚 Docs:
Playwright

[Image licensing APIs](https://unsplash.com/developers or use Google Images carefully)

🔁 Shiphero Integration (as a service)
🎯 Features:
Sync inventory levels per SKU/channel

Push fulfillment data to Shiphero

Pull order and shipping status updates

Support for webhooks and scheduled polling

📦 New Module: integration-shiphero
cpp
Kopier
Rediger
modules/
└── integration-shiphero/
    ├── shiphero.service.ts
    ├── shiphero.module.ts
    ├── shiphero.controller.ts
    ├── dto/
    │   ├── shiphero-inventory.dto.ts
    │   └── shiphero-shipment.dto.ts
    └── utils/
        └── webhook-validator.ts
📚 Docs to Follow:
#fetch https://developer.shiphero.com/

🔗 #fetch https://graphql.org/learn/

Use Shiphero’s GraphQL API for:

inventory.sync

order.fulfill

product.get (to verify SKU mapping)



🔔 Notification Module (notification-service)
🔔 Features:
Slack / Email alerts

Stock Warnings

Approval Requests

📦 Tech:
Nodemailer or Resend (emails)

Slack Webhooks

Redis PubSub for internal message passing

🔄 Integration Module (integration-service)
🛒 Features:
WooCommerce, Shopify, Shiphero Export APIs

Google Sheets sync

PDF Catalog Generator

💡 WooCommerce Docs:
#fetch https://woocommerce.github.io/woocommerce-rest-api-docs/

📃 Google Sheets API:
#fetch https://developers.google.com/sheets/api/quickstart/nodejs

🖨️ PDF Generator:
Use Puppeteer or PDFKit to render product catalogs.

🌐 API Gateway (api-gateway)
💬 Functionality:
REST & WebSocket Gateway

Middleware, SSE, logging

Role-based guards for AI and analytics routes

✅ Structure:
markdown
Kopier
Rediger
modules/
└── api-gateway/
    ├── api-gateway.controller.ts
    ├── api-gateway.service.ts
    ├── middleware/
    └── ws/
        └── ws.gateway.ts
📘 Docs:
#fetch https://docs.nestjs.com/websockets/gateways

📦 Folder Architecture (Updated)
lua
Kopier
Rediger
src/
├── app.module.ts
├── main.ts
├── common/
├── config/
├── infrastructure/
│   ├── cache/
│   ├── database/
│   ├── google-sheets/
│   ├── vector-db/        <-- Qdrant config lives here
├── modules/
│   ├── api-gateway/
│   ├── products/
│   ├── categories/
│   ├── ingredients/
│   ├── ai-service/       <-- New
│   ├── analytics-service/ <-- New
│   ├── content-service/  <-- New
│   ├── notification-service/ <-- New
│   └── integration-service/  <-- New
🧩 Deployment
🐳 Each service should be containerized (Docker)

🧪 Use nx or lerna for hybrid monorepo scaling

💡 Use Coolify or Railway for fast microservice deployments

🧠 Embedding service (FastEmbed + Flask) can run as standalone AI container
 Extras to Add in Backend:
✅ Multi-channel logic (visibility, price, stock)

✅ Change logs on all editable entities

✅ Approval flow (via lifecycle-events)

✅ PDF generation (via content-service)

✅ Webhook handling for Shiphero (via webhook.service.ts)

✅ Soft deletes (isDeleted) and i18n JSON fields on all major content types

✅ Summary
Feature	Service / Module	Docs
Shiphero sync	integration-shiphero	GraphQL Docs
Core PIM Logic	products, categories, variants, etc.	NestJS Docs
Stock Management	stock-unit module	Custom logic + Shiphero
Channel Export	catalog, channel modules	Webshop Export
Audit Trail	lifecycle-event module	Internal history tracking

✅ Summary: Core Steps
Feature	Module	Tools/Docs
AI & NLP	ai-service	FastEmbed, Qdrant
Smart Image Picker	content-service	Playwright, Unsplash
Stats/Trends	analytics-service	Redis, MongoDB
Docs/Media	content-service	Multer, Puppeteer
Alerts	notification-service	Slack API, Nodemailer
External Sync	integration-service	WooCommerce API, Google Sheets
Central Hub	api-gateway	REST + WebSocket (NestJS)

