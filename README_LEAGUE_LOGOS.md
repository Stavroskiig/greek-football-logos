# League Logos Setup

## Directory Structure

Create the following directory structure for league logos:

```
src/assets/
├── league-logos/    (NEW - Create this directory)
│   ├── SUPERLEAGUE.png
│   ├── SUPERLEAGUE 2.png
│   ├── Γ ΕΘΝΙΚΗ.png
│   ├── ΕΠΣ ΑΘΗΝΩΝ.png
│   ├── ΕΠΣ ΠΕΙΡΑΙΑ.png
│   ├── ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ.png
│   ├── ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ.png
│   ├── ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ.png
│   ├── ΕΠΣ ΑΡΓΟΛΙΔΑΣ.png
│   ├── ΕΠΣ ΑΡΚΑΔΙΑΣ.png
│   ├── ΕΠΣ ΑΡΤΑΣ.png
│   ├── ΕΠΣ ΑΧΑΪΑΣ.png
│   ├── ΕΠΣ ΒΟΙΩΤΙΑΣ.png
│   ├── ΕΠΣ ΔΡΑΜΑΣ.png
│   ├── ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ.png
│   ├── ΕΠΣ ΕΒΡΟΥ.png
│   ├── ΕΠΣ ΕΥΒΟΙΑΣ.png
│   ├── ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ.png
│   ├── ΕΠΣ ΕΥΡΩΠΑ.png
│   ├── ΕΠΣ ΗΛΕΙΑΣ.png
│   ├── ΕΠΣ ΗΜΑΘΙΑΣ.png
│   ├── ΕΠΣ ΗΠΕΙΡΟΥ.png
│   ├── ΕΠΣ ΗΡΑΚΛΕΙΟΥ.png
│   ├── ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ.png
│   ├── ΕΠΣ ΘΕΣΣΑΛΙΑΣ.png
│   ├── ΕΠΣ ΘΡΑΚΗΣ.png
│   ├── ΕΠΣ ΚΑΒΑΛΑΣ.png
│   ├── ΕΠΣ ΚΑΡΔΙΤΣΑΣ.png
│   ├── ΕΠΣ ΚΑΣΤΟΡΙΑΣ.png
│   ├── ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ.png
│   ├── ΕΠΣ ΚΙΛΚΙΣ.png
│   ├── ΕΠΣ ΚΟΖΑΝΗΣ.png
│   ├── ΕΠΣ ΚΟΡΙΝΘΙΑΣ.png
│   ├── ΕΠΣ ΚΥΚΛΑΔΩΝ.png
│   ├── ΕΠΣ ΛΑΚΩΝΙΑΣ.png
│   ├── ΕΠΣ ΛΑΡΙΣΑΣ.png
│   ├── ΕΠΣ ΛΑΣΙΘΙΟΥ.png
│   ├── ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ.png
│   ├── ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ.png
│   ├── ΕΠΣ ΜΕΣΣΗΝΙΑΣ.png
│   ├── ΕΠΣ ΞΑΝΘΗΣ.png
│   ├── ΕΠΣ ΠΕΛΛΑΣ.png
│   ├── ΕΠΣ ΠΙΕΡΙΑΣ.png
│   ├── ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ.png
│   ├── ΕΠΣ ΡΕΘΥΜΝΟΥ.png
│   ├── ΕΠΣ ΣΑΜΟΥ.png
│   ├── ΕΠΣ ΣΕΡΡΩΝ.png
│   ├── ΕΠΣ ΤΡΙΚΑΛΩΝ.png
│   ├── ΕΠΣ ΦΘΙΩΤΙΔΑΣ.png
│   ├── ΕΠΣ ΦΛΩΡΙΝΑΣ.png
│   ├── ΕΠΣ ΦΩΚΙΔΑΣ.png
│   ├── ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ.png
│   ├── ΕΠΣ ΧΑΝΙΩΝ.png
│   ├── ΕΠΣ ΧΙΟΥ.png
│   ├── ΕΠΣ ΖΑΚΥΝΘΟΥ.png
│   ├── ΕΠΣ ΚΕΡΚΥΡΑΣ.png
│   ├── ΕΠΣ ΓΡΕΒΕΝΩΝ.png
│   └── default-league.png    (fallback logo)
```

## Logo Requirements

- **Format**: PNG (recommended) or SVG
- **Size**: 16x16px minimum, 32x32px recommended
- **Background**: Transparent or white background
- **Style**: Consistent style across all logos

## Implementation Details

The league logos will be displayed in:
1. The league selector dropdown
2. Next to the selected league name in the dropdown button

## Features Added

1. **Custom League Selector Component**: Replaces the standard HTML select with a custom dropdown that supports images
2. **League Logo Service Method**: `getLeagueLogoPath()` method in LogoService to map league names to logo files
3. **Error Handling**: If a logo file is missing, it will be hidden gracefully
4. **Responsive Design**: The dropdown works well on both desktop and mobile

## How to Add Your League Logos

1. Create the `src/assets/league-logos/` directory
2. Add your league logo files with the exact names listed above
3. Make sure the file names match exactly (including Greek characters)
4. Test the application to ensure all logos display correctly

## Fallback

If a league logo is missing, the system will:
1. Try to load the specific logo file
2. Hide the image element if the file doesn't exist
3. Display only the league name without the logo

This ensures the application continues to work even if some logos are missing. 