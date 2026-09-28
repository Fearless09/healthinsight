# HEALTHINSIGHT

> **Tagline:** *"Turn health programme data into actionable insight."*

HealthInsight is a production-quality, full-stack AI-powered health programme and research intelligence platform designed for health NGOs, research organizations, and programme management teams.

---

## 1. Product Overview
HealthInsight helps healthcare operations teams turn unstructured reports, evaluation studies, and structured programme datasets into actionable intelligence. The application combines Retrieval-Augmented Generation (RAG) over vector-indexed documents, PII protection preprocessing, deterministic statistical calculations, side-by-side document comparison, exportable report generation, user profile management, and role-based workspace governance protected by server-side proxy middleware (`proxy.ts`).

> [!IMPORTANT]
> **Mandatory Health Notice:**
> *"HealthInsight is a research and programme analysis tool. It does not provide medical diagnosis, treatment recommendations, or clinical advice."*

---

## 2. Problem Statement
Health NGOs and research organizations collect vast amounts of unstructured evaluation reports (PDFs, DOCXs) and structured CSV datasets. Extracting grounded answers, verifying statistical completion rates, comparing regional interventions, and ensuring patient data privacy (PII) usually requires manual effort. Generic LLMs hallucinate numbers or expose sensitive PII. HealthInsight solves this by using deterministic TS math for numbers and pgvector RAG with strict prompt injection guardrails for text.

---

## 3. Core Features
1. **User Profile & Account Security:**
   - **Profile Photo Upload:** Upload avatar images (JPG, PNG, WEBP) stored in cloud/local storage.
   - **Editable Name:** Update account display name seamlessly across the workspace.
   - **Fixed Email Identity:** Fixed email address for account identity verification and security audit integrity.
   - **Password Management:** Change password with verification of current password and bcrypt hashing.
2. **Server-Side Route Protection (`proxy.ts`):** Next.js 16 `proxy.ts` middleware protects all `(dashboard)` routes (`/dashboard`, `/settings`, `/datasets`, `/documents`, `/reports`, `/assistant`, `/audit-logs`, `/compare`, `/team`), automatically redirecting unauthenticated users to `/login`.
3. **Authentication & Multi-Tenant Workspaces:** Stateless JWT session cookies (`jose`), workspace isolation, and RBAC roles (`ADMIN`, `PROGRAMME_MANAGER`, `RESEARCHER`, `VIEWER`).
4. **Document Management & PII Preprocessing:** Upload PDF, DOCX, TXT. Automated PII detection and redaction (`[PERSON]`, `[PHONE]`, `[EMAIL]`, `[ADDRESS]`, `[ID]`).
5. **Semantic Chunking & pgvector RAG Indexing:** Document pages split into ~500 token chunks and embedded into PostgreSQL via `pgvector`.
6. **Grounded AI Research Assistant:** Vector similarity retrieval, system prompt injection protection, exact page-level citations, grounding score, and explicit warnings when context is insufficient.
7. **Structured CSV Dataset Analysis:** Deterministic TypeScript calculation of total participants, average, completion rate %, referral rate %, outcome rate %, min/max, median, missing data %, and time-series trends. AI provides qualitative interpretation only.
8. **Side-by-Side Document Comparison:** Compare baseline vs. target documents across common findings, metric differences, and outcomes.
9. **Report Generator:** Synthesize document RAG findings, dataset analytics, and AI insights into structured, exportable PDF reports.
10. **Audit Trail Logging:** Immutable security log tracking all authentication, uploads, AI queries, profile changes, report generations, and role changes.

---

## 4. System Architecture

```mermaid
flowchart TD
    User([User / Browser]) <--> Proxy[proxy.ts Middleware]
    Proxy <-->|Session Guard| NextApp[Next.js 16 Web & API Gateway]
    
    subgraph Storage & DB
        Postgres[(PostgreSQL + pgvector)]
        BlobStorage[Vercel Blob / Local Storage]
    end
    
    subgraph Core Engines
        PiiScrubber[PII Redaction Engine]
        DocParser[Doc Parser & Chunking]
        StatsEngine[Deterministic TS Stats Engine]
        VectorStore[pgvector Cosine Search]
        HfProvider[Hugging Face AI Client]
    end
    
    NextApp --> PiiScrubber
    NextApp --> DocParser
    NextApp --> StatsEngine
    NextApp --> VectorStore
    VectorStore <--> Postgres
    NextApp <--> BlobStorage
    NextApp <--> HfProvider
```

---

## 5. Tech Stack
- **Framework:** Next.js 16.3.6 (App Router, TypeScript, React 19, `proxy.ts`)
- **Styling:** Tailwind CSS v4, Lucide Icons, Recharts
- **Database & Vector Search:** PostgreSQL with `pgvector` extension
- **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `postgres`)
- **Authentication & Security:** `jose` JWT cookies, `bcryptjs` password hashing, `proxy.ts` middleware
- **AI Models:** Hugging Face Inference API (`@huggingface/inference`)
  - Text Model: `mistralai/Mistral-7B-Instruct-v0.3`
  - Embedding Model: `sentence-transformers/all-MiniLM-L6-v2` (384 float dimensions)
- **Storage:** Vercel Blob (`@vercel/blob`) with local fallback (`/public/uploads`)
- **Testing:** Vitest

---

## 6. AI & RAG Architecture

```mermaid
sequenceDiagram
    participant User
    participant NextAPI as Next.js RAG API
    participant VectorDB as PostgreSQL / pgvector
    participant HF as Hugging Face LLM

    User->>NextAPI: Submit question: "What were the major barriers to care?"
    NextAPI->>HF: Generate 384d embedding for question
    HF-->>NextAPI: Vector Embedding Array
    NextAPI->>VectorDB: Cosine Similarity Search (<->) top 4 chunks
    VectorDB-->>NextAPI: Relevant document chunks & page numbers
    NextAPI->>NextAPI: Construct grounded context & check grounding score
    NextAPI->>HF: Pass [RETRIEVED CONTEXT] + Question + Guardrails Prompt
    HF-->>NextAPI: Grounded Answer
    NextAPI-->>User: Answer + Page Citations + Grounding Score Badge
```

---

## 7. API Routes Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates user credentials & issues JWT cookie |
| `POST` | `/api/auth/register` | Registers new user account with hashed password |
| `GET` / `POST` | `/api/auth/session` | Fetches active user session or logs out |
| `PUT` | `/api/auth/profile` | Updates user profile name, avatar picture, and password |
| `POST` | `/api/documents` | Uploads clinical document, scrubs PII, generates embeddings |
| `POST` | `/api/datasets` | Uploads CSV dataset and calculates summary statistics |
| `POST` | `/api/ai/chat` | Executes grounded RAG search & returns LLM response |

---

## 8. Local Setup & Environment Variables

### Environment Variables (`.env.example` -> `.env.local`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=healthinsight_super_secret_jwt_key_32bytes_long!
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/healthinsight

HF_API_KEY=your_hugging_face_api_token
HF_TEXT_MODEL=mistralai/Mistral-7B-Instruct-v0.3
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Installation Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Run unit tests
pnpm test

# 3. Seed synthetic demonstration data
pnpm dlx tsx src/db/seed-runner.ts

# 4. Start local development server
pnpm dev
```

---

## 9. Testing & Build Verification
- **Unit Tests:** `pnpm test` (Runs Vitest suite for PII scrubber, TS stats engine, chunker, and RBAC).
- **Production Build:** `pnpm build` (Validates Next.js App Router static and dynamic server routes).

---

## 10. Known Limitations
- Automated PII detection uses regex patterns for high precision; manual data review before public sharing is recommended.
- Hugging Face serverless endpoints are subject to provider rate limits. An internal fallback engine provides continuity during API throttling.
