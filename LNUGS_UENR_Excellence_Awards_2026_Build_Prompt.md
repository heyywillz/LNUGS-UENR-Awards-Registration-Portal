# LNUGS–UENR Excellence Awards 2026 — Full-Stack Registration Portal Build Prompt

---

## Project Overview

Build a production-ready, single-page awards nomination and registration portal for the **LNUGS–UENR Excellence Awards 2026**, inspired by the attached UI screenshots. The portal collects nominee submissions, stores them in PostgreSQL, and exposes a protected admin dashboard with data export and visual analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Tailwind CSS (via CDN or PostCSS build), Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (via `pg` npm package) |
| Font | Satoshi (Fontshare CDN) |
| Excel Export | `exceljs` npm package |
| Charts | Chart.js (via CDN) |
| Authentication | Session-based admin login via `express-session` + `bcrypt` |
| File Uploads | `multer` |
| Environment | `dotenv` |

**Satoshi font import URL:**
```
https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap
```

---

## Visual Design System

### Theme

Deep crimson red and clean white, with near-black for text and soft light grey for page background.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#C0111F` | Brand red, buttons, accents |
| `--color-primary-dark` | `#8B0000` | Hover and active states |
| `--color-white` | `#FFFFFF` | Surfaces, text on red |
| `--color-bg` | `#F5F5F5` | Page background |
| `--color-surface` | `#FFFFFF` | Cards and panels |
| `--color-text` | `#0D0D0D` | Primary body text |
| `--color-muted` | `#6B7280` | Subtitles, helper text |
| `--color-border` | `#E5E7EB` | Input borders, dividers |
| `--color-badge-open` | `#16A34A` | "Applications Open" status badge |

### Typography (Satoshi)

| Role | Weight | Style |
|---|---|---|
| Page title / hero | 900 | Uppercase, tight tracking |
| Section headings | 700 | Title case |
| Field labels | 600 | Uppercase, letter-spacing: 0.08em, small size |
| Body / inputs | 400 | Normal |

### Global Rules

- Border radius: `0.5rem` for cards, `0.375rem` for inputs and buttons
- Input focus ring: `outline-color: #C0111F`
- Button hover: `transition-colors duration-200`
- No emojis anywhere in the UI

---

## Project File Structure

```
/project-root
  /public
    index.html              Public registration portal
    admin.html              Admin dashboard (protected)
    /css
      styles.css            Compiled Tailwind or custom CSS
    /js
      portal.js             Registration form logic
      admin.js              Dashboard charts and table logic
    /uploads                Nominee photo storage
  /server
    index.js                Express entry point
    db.js                   PostgreSQL connection pool
    /routes
      nominations.js        POST /api/nominations
      admin.js              Admin routes (login, data, export)
  .env
  package.json
  tailwind.config.js
```

---

## Public Registration Portal — `index.html`

Replicate the layout from the UI screenshots, adapted to the LNUGS–UENR brand with a red and white theme.

### Layout Structure

The portal uses a two-column layout on desktop (left panel: event info; right panel: form) and stacks to a single column on mobile.

---

### 1. Top Navigation Bar

- Logo: "LNUGS" wordmark, left-aligned, white text on dark/red bar
- Right side: "SIGN IN" text link and "GET STARTED" outlined button
- Below nav: small breadcrumb — "REGISTRATION PORTAL" left-aligned, green dot and "REGISTRATION LIVE" right-aligned

---

### 2. Hero / Event Banner (Left Panel)

Full-bleed dark banner area with event branding overlaid:

- Eyebrow tag: "REGISTRATION FORM"
- Logo badges: LNUGS and UENR icons
- Main title: **"LNUGS–UENR EXCELLENCE AWARDS, 2026"** — bold, white, display weight
- Right edge of banner: vertical text reading "NOMINATIONS CATEGORIES" in red or gold accent

Below the banner image, a white info card:

- `EVENT TYPE:` `AWARDS & RECOGNITION`
- `STATUS:` `APPLICATIONS OPEN` (green text)
- `THEME:` paragraph — *"This event represents a journey towards excellence. Complete your nomination to become part of this prestigious recognition."*

---

### 3. Registration Form (Right Panel)

Three visually separated card sections.

---

#### Section A — YOUR PHOTO

- Section icon: camera icon in red circle
- Heading: **YOUR PHOTO**
- Subtext: "This photo will appear on the voting page"
- Upload area: dashed grey border box, centered placeholder icon, label "CLICK TO SELECT PHOTO"
- Live image preview on file selection
- Requirements list (red checkmark icons):
  - Clear face visible at the top
  - Maximum size 2MB
  - JPG, PNG, or WEBP

---

#### Section B — YOUR DETAILS

- Section icon: document icon
- Heading: **YOUR DETAILS**
- Subtext: "Tell us more about yourself"

Fields (all with small uppercase labels):

| Field | Type | Notes |
|---|---|---|
| ASSIGNED CATEGORY | `<select>` | Grouped `<optgroup>` — full list below |
| FULL NAME | `<input type="text">` | Placeholder: "Your full name" |
| PROGRAMME OF STUDY | `<input type="text">` | Placeholder: "e.g. BSc Computer Science" |
| LEVEL | `<select>` | Options: Level 100, Level 200, Level 300, Level 400, Level 500, Postgraduate |
| BRIEF PROFILE / BIO | `<textarea rows="5">` | Placeholder: "Tell the board about your achievements..." |

---

#### Section C — CONTACT INFO

- Section icon: envelope icon
- Heading: **CONTACT INFO**
- Subtext: "How we can reach you"
- Two-column row on desktop, stacked on mobile:
  - MOBILE NUMBER — `<input type="tel">` — placeholder: "05XXXXXXXX"
  - OFFICIAL EMAIL — `<input type="email">` — placeholder: "official@example.com"

---

#### Submit Button and Footer Note

- Full-width button, red background, white text: "SUBMIT FOR REVIEW" with a right-arrow icon
- Below button: small muted text — "BY SUBMITTING, YOU AGREE TO OUR TERMS OF CONDUCT AND SELECTION CRITERIA."

---

#### Success State

On successful submission, replace the form with a clean success card containing:

- Heading: "Nomination Submitted"
- Nominee full name and category
- Note: "You will be contacted via your provided email and mobile number."

---

### 4. Page Footer

Dark background (`#0D0D0D`):

- Left: LNUGS logo + tagline: "The premier standard for student recognition at UENR."
- Four link columns: Company (Home, Vote, Tickets, Blog, Contact), Support (How to Vote, Nominations, Help Center), Contact (email, phone, WhatsApp Online)
- Bottom bar: copyright notice and TERMS / PRIVACY / COOKIES links

---

## Full Category Dropdown

Populate using all categories from the document, grouped with `<optgroup>`:

### Academic and Intellectual Excellence

- Best Male Student of the Year
- Best Female Student of the Year
- Best Course Representative of the Year
- Best Lecturer of the Year
- Most Disciplined Student of the Year
- Best Debater of the Year
- Best Writer of the Year
- Most Outstanding and Versatile Teaching Assistant of the Year

### Leadership and Governance

- Best Student Leader of the Year
- Best Student Politician of the Year
- Best SRC Executive of the Year
- Best NUGS Executive of the Year
- Best Student Parliamentarian of the Year
- Most Outstanding JCRC Executive of the Year
- Most Outstanding Departmental President of the Year

### General Students Awards

- Most Popular Student of the Year
- Most Influential Student of the Year
- Most Talented Student of the Year
- Perfect Lady of the Year
- Perfect Gentleman of the Year
- Most Photogenic Male/Female of the Year
- Best Pals of the Year
- Best Couple on Campus of the Year

### Entrepreneurship and Innovation

- Student Entrepreneur of the Year
- Most Innovative Student Business of the Year
- Most Impactful Student Business of the Year
- Most Promising Startup of the Year

### Entertainment and Creative Awards

- Best Student Actor/Actress of the Year
- Best Dancer of the Year
- Best Dance Group of the Year
- Most Outstanding Student Artist of the Year
- Best Campus Instrumentalist of the Year

### Media, Digital and Personality Awards

- Best Student MC of the Year
- Best Student Radio Personality of the Year
- Best TikToker of the Year
- Student Blogger of the Year
- Best Campus DJ of the Year

### Fashion and Beauty Awards

- Most Fashionable Student of the Year
- Best Student Model of the Year
- Best Fashion Designer of the Year
- Best Makeup Artist of the Year

### Creative Professionals Awards

- Best Graphic Designer
- Best Photographer of the Year
- Student Barber of the Year

### Sports Awards

- Best Male Sports Personality of the Year
- Best Female Sports Personality of the Year

### Campus Groups and Associations Awards

- Most Vibrant Association of the Year
- Most Vibrant Political Association of the Year
- Best Hall of the Year
- Best Morale Group of the Year

---

## Backend API

### Environment Variables (`.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/lnugs_awards
SESSION_SECRET=your_session_secret_here
PORT=3000
```

---

### PostgreSQL Schema

```sql
CREATE TABLE nominations (
  id               SERIAL PRIMARY KEY,
  full_name        VARCHAR(255)  NOT NULL,
  programme        VARCHAR(255)  NOT NULL,
  level            VARCHAR(50)   NOT NULL,
  category         VARCHAR(255)  NOT NULL,
  category_group   VARCHAR(255)  NOT NULL,
  bio              TEXT,
  mobile           VARCHAR(20)   NOT NULL,
  email            VARCHAR(255)  NOT NULL,
  photo_filename   VARCHAR(255),
  submitted_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE admins (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(100) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL
);
```

---

### API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/nominations` | Accept `multipart/form-data`, save photo via `multer` to `/public/uploads/` with UUID filename, insert record into PostgreSQL, return `{ success: true, id }` |
| `GET` | `/api/admin/nominations` | Protected. Return all nominations as JSON, sorted by `submitted_at DESC` |
| `GET` | `/api/admin/stats` | Protected. Return totals, breakdown by category group (bar chart), breakdown by level (doughnut chart), daily submissions over last 30 days (line chart), top 10 categories by count |
| `GET` | `/api/admin/export` | Protected. Use `exceljs` to generate and stream `.xlsx` file of all nominations |
| `POST` | `/api/admin/login` | Accept `{ username, password }`, validate against `admins` table, set session |
| `POST` | `/api/admin/logout` | Destroy session and redirect to login |

All protected routes must return `401` with a JSON error if no valid session exists.

---

### Seed Script

Running `npm run seed:admin` must:

1. Hash the default password using `bcrypt` with salt rounds of 12
2. Insert or upsert a row into the `admins` table with `username: "admin"` and `password: "lnugs2026"`

---

## Admin Dashboard — `admin.html`

All admin routes require a valid session. If no session is present, redirect to `/admin-login.html`.

---

### Admin Login Page

- Full-page dark crimson background (`#8B0000`)
- Centered white card, max-width 400px
- LNUGS logo at the top of the card
- Heading: "Admin Access"
- Username input
- Password input
- "Sign In" button (red, full width)
- Inline error message on invalid credentials

---

### Admin Dashboard Layout

#### Top Bar

- LNUGS logo left-aligned
- Heading: "Admin Dashboard"
- Logout button right-aligned (outlined, red)

---

#### Stat Cards Row (4 cards)

| Card | Value |
|---|---|
| Total Nominations | Count of all rows in `nominations` |
| Categories Covered | Count of distinct categories with at least 1 nomination |
| Today's Submissions | Count of nominations submitted today |
| Most Nominated Category | Category name with the highest count |

Cards use white background, red top-border accent, black number, and muted label text.

---

#### Charts Section (2 columns on desktop, stacked on mobile)

All charts use Chart.js. Use red-toned palette throughout.

1. **Bar Chart** — Nominations by Category Group
   - X-axis: category group names (shortened if needed)
   - Y-axis: nomination count
   - Bar color: `#C0111F`
   - Background: white card with grey grid lines

2. **Doughnut Chart** — Nominations by Student Level
   - Segments: Level 100, Level 200, Level 300, Level 400, Level 500, Postgraduate
   - Color palette: shades from `#C0111F` to `#FECACA`
   - Legend below the chart

3. **Line Chart** (full width) — Daily Submissions Over the Last 30 Days
   - X-axis: date labels
   - Y-axis: submission count
   - Line color: `#C0111F`, fill with low-opacity red
   - Subtle grey grid lines

---

#### Top Categories Table

Columns: Rank, Category, Group, Count, Percentage of Total

Styling:
- Red header row, white text
- Alternating row shading (`#FEF2F2` on even rows)
- Percentage shown as a formatted string (e.g., "12.4%")

---

#### All Nominations Table

Columns: `#`, Photo (thumbnail 40x40px, rounded), Full Name, Programme, Level, Category, Mobile, Email, Submitted At

Controls:
- Search bar (filter by name, email, or category — client-side)
- Pagination: 25 rows per page, previous/next buttons
- Red "Download Excel" button top-right — triggers `GET /api/admin/export`

Table styling:
- Red header row
- Hover highlight on rows
- Muted text for date column

---

## Client-Side Validation Rules

All validation runs on the `portal.js` side before any network request is made.

| Field | Rule |
|---|---|
| Photo | Required; must be JPG, PNG, or WEBP; max 2MB |
| Assigned Category | Must not be the default placeholder option |
| Full Name | Required, minimum 3 characters |
| Programme of Study | Required |
| Level | Must be a valid selection |
| Bio | Required, minimum 20 characters |
| Mobile Number | Required; must start with 0; must be exactly 10 digits |
| Official Email | Required; must match standard email regex |

On failed validation:

- Show inline red error message directly below the invalid field
- Scroll smoothly to the first invalid field
- Re-validate each field on input change after a first failed submission attempt

---

## Responsiveness Requirements

| Breakpoint | Layout |
|---|---|
| Mobile (`< 768px`) | Single column; banner above; form sections below |
| Tablet (`768px – 1023px`) | Single column with wider card padding |
| Desktop (`>= 1024px`) | Two-column: left panel (banner + event info) fixed or sticky; right panel (form) scrollable |

---

## Additional Requirements

- Use `multer` disk storage for photo uploads; generate a UUID filename on each upload to prevent collisions
- Serve `/public/uploads/` as a static directory so photo thumbnails are accessible in the admin table
- Use `dotenv` for all environment variables; never hardcode secrets
- All form labels in uppercase with `letter-spacing: 0.08em`
- Inputs show a red focus ring (`outline: 2px solid #C0111F; outline-offset: 2px`)
- The photo upload box shows a live preview of the selected image before submission using `FileReader`
- Admin Excel export must include all columns with proper column widths and a styled header row (red fill, white bold text)
- No emojis anywhere in the UI or API responses
- All dates in the admin dashboard displayed in `DD MMM YYYY, HH:MM` format (e.g., 24 Jun 2026, 14:35)
