# FastWrite UI - TODO & Improvements

### Medium Priority
- [x] **Project Description Not Validated**
  - ~~The prompt includes `projectDescription || "No project description provided."` even when it's required for better documentation~~
  - **Fixed:** Added warning toast when project description is empty in `Index.tsx`

- [ ] **No Loading State Persistence**
  - If user refreshes during loading, the generation is lost
  - Consider using a more robust state management approach

---

## ✨ Feature Improvements

### UI/UX Enhancements

- [x] **Improve Mobile Experience**
  - ~~Mobile layout exists but could be optimized~~
  - **Fixed:** Added collapsible sections for Documentation Preferences and Prompt Preview on mobile in `CardSection.tsx`

### Functionality Additions

- [x] **Implement Diagram Regeneration UI**
  - ~~Mermaid auto-repair exists but is hidden~~
  - **Fixed:** Added visible "Regenerate" button in `Mermaid.tsx` that appears on hover or when error occurs

### Performance & Technical

- [ ] **Implement Request Queuing**
  - Queue multiple generation requests
  - Show queue status to user

## 🔧 Code Quality & Maintenance

- [x] **Improve TypeScript Types**
  - ~~Add stricter typing for API payloads and responses~~
  - **Fixed:** Added `AIProvider`, `AIModel` types and `AI_PROVIDERS` config in `lib/constants.ts`

- [ ] **Add Health Check Endpoint**
  - For monitoring and load balancing
