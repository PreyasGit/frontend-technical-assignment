# 🛠️ Project Rules: Frontend Technical Assignment

## 📚 Tech Stack & Architecture

- [cite_start]**Framework:** Next.js (App Router) using TypeScript[cite: 3, 14].
- [cite_start]**Styling:** Tailwind CSS[cite: 14]. [cite_start]Default application font must be **DM Sans**[cite: 18].
- [cite_start]**Folder Structure:** Module-wise hierarchy (e.g., separate modules for Products, Users, Recipes)[cite: 20, 25, 37, 45].
- [cite_start]**UI Library:** Use **shadcn/ui** for reusable components (Button, Input, Table, Modal, Drawer, Loader, Confirmation Dialog)[cite: 59, 65].
- [cite_start]**Responsiveness:** Fully fluid layouts working across mobile, tablet, laptop, and desktop[cite: 60].

## 🎨 Branding Constraints

[cite_start]Strictly apply the following brand colors globally throughout the application[cite: 14, 19]:

- [cite_start]**Primary:** Royal Blue (`#2563EB`) [cite: 15]
- [cite_start]**Secondary:** Slate Gray (`#64748B`) [cite: 15]
- [cite_start]**Accent:** Emerald Green (`#10B981`) [cite: 15]

## 🔌 Data Fetching & State Management

- [cite_start]**HTTP Client:** Strictly use **Axios**[cite: 24, 56].
- [cite_start]**Server State:** Use **React Query (TanStack Query)** for all client-side API requests[cite: 24, 57].
- [cite_start]**State Handling:** Every single feature must gracefully handle `loading`, `success`, and `error` states with proper UI indicators[cite: 61].
- [cite_start]**Forms:** Use **React Hook Form** paired with **Yup** for client-side validation[cite: 58].

## 🛑 AI Operational Guardrails (Token & Code Efficiency)

- **No Incomplete Code:** Never emit placeholders like `// TODO: implement later` or `...rest of the component`. Write full, syntactically correct snippets.
- **Chunked Development:** Only focus on the specific files or modules requested in the prompt. Do not try to generate multiple pages or modules simultaneously.
- [cite_start]**State Integrity:** When building the Product module, ensure search, sort, and pagination states are preserved in the URL/state when navigating away, and accurately restored upon return[cite: 36].
- **Security:** Separate all sensitive data, environment variables, or private API base routes into appropriate configurations. Do not hardcode secrets or mock tokens.
