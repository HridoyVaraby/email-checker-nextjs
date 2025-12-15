# 📄 Product Requirements Document (PRD)  
**Project:** Email Verification Tool (Next.js)  
**Owner:** Hridoy (Varabit)  
**Date:** December 2025  

---

## 1. 🎯 Purpose  
Build a **Next.js-based email verification tool** with a modern, professional black-and-white UI. The tool allows users to upload email lists, verify them through a modular pipeline, and download categorized results without altering the original dataset.

---

## 2. 🧑‍💻 Target Users  
- **Marketers** running campaigns.  
- **Developers** integrating email verification workflows.  
- **Clients** needing clean, validated email lists.  

---

## 3. 📦 Scope  

### ✅ In-Scope  
- File upload (CSV, Excel, JSON).  
- Auto-detect email column.  
- Verification pipeline (syntax, domain, blacklist, role-based, catch-all, optional SMTP).  
- Append `verification_status` column with tags: Valid, Invalid, Risky, Unknown.  
- Results table with color-coded tags.  
- Stats summary (Valid, Invalid, Risky, Unknown).  
- Download options (full list, valid-only, risky-only).  
- Black-and-white professional UI theme.  
- Responsive design.  

### ❌ Out-of-Scope  
- Sending test emails.  
- Multi-user authentication.  
- Complex analytics dashboards.  

---

## 4. 🏗 Functional Requirements  

### 4.1 Input  
- File upload via drag-and-drop or file picker.  
- Preview first 10–20 rows with detected email column highlighted.  

### 4.2 Processing Pipeline (Backend in Next.js API Routes)  
1. **Syntax Check** → Regex validation.  
2. **Domain Check** → DNS/MX record lookup.  
3. **Blacklist Filter** → Disposable domains auto-flagged.  
4. **Role-based Filter** → Flag generic addresses.  
5. **Catch-all Detection** → Identify domains that accept all emails.  
6. **SMTP Verification (optional)** → Non-intrusive handshake.  

### 4.3 Output  
- Original dataset preserved.  
- New column `verification_status` appended.  
- Export options:  
  - Full list with flags.  
  - Valid-only list.  
  - Risky-only list.  

---

## 5. 🎨 UI/UX Design  

### Color Palette  
- Background: White `#FFFFFF`  
- Text: Black `#000000`  
- Secondary Text: Dark Gray `#333333`  
- Borders: Light Gray `#E0E0E0`  
- Hover States: Subtle Gray `#F5F5F5`  

### Components  
- **FileUploader.tsx** → Drag-and-drop + preview.  
- **VerificationControls.tsx** → Run Verification button + progress bar.  
- **StatsSummary.tsx** → Cards showing counts.  
- **ResultsTable.tsx** → Table with appended flags.  
- **DownloadButtons.tsx** → Export options.  

### UX Enhancements  
- Toast notifications (black background, white text).  
- Responsive grid layout.  
- Clean typography (Inter/Roboto).  

---

## 6. 📊 Example Output  

| name       | email                | verification_status |
|------------|----------------------|---------------------|
| Alice Wong | alice@gmail.com      | Valid               |
| Bob Smith  | bob@mailinator.com   | Risky               |
| Carol Lee  | carol@invaliddomain  | Invalid             |
| Dave Chen  | info@company.com     | Risky               |

---

## 7. 🏗 Suggested Next.js Project Structure  

```
/app
  /upload
    page.tsx          // Upload UI
  /results
    page.tsx          // Results table + download buttons
/components
  FileUploader.tsx
  VerificationControls.tsx
  StatsSummary.tsx
  ResultsTable.tsx
  DownloadButtons.tsx
/lib
  emailValidator.ts   // Syntax + domain + blacklist logic
  smtpVerifier.ts     // Optional SMTP check
  exporter.ts         // CSV/Excel export logic
/pages/api
  /verify.ts          // API route to process uploaded file
  /download.ts        // API route to serve filtered lists
```

---

## 8. 🔮 Future Enhancements  
- Dark mode toggle.  
- Custom blacklist management via settings modal.  
- API endpoint for real-time verification.  
- CRM integration.  

---

This PRD is now **fully aligned with Next.js** — frontend, backend, and UI/UX all in one project.  