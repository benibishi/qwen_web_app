https://benibishi.github.io/qwen_web_app/
# Construction Quality Control Application

A web-based application for managing construction quality control inspections, specifically for framing inspections.

## Features

- **Multi-Tab Navigation**: Organized by construction category (Framing, Electrical, Plumbing, HVAC)
- **Inspection Forms**: Detailed checklists for quality control inspections
- **Pass/Fail Tracking**: Mark each item as pass or fail
- **Deficiency Management**: Document and track failed items with detailed descriptions
- **Report Generation**: Generate PDF reports of deficiencies to share with contractors
- **Data Persistence**: All inspection data is saved locally in the browser

## How to Use

### Starting a New Inspection
1. Navigate to the "Framing" section
2. Click "New Framing Inspection"
3. Fill out the inspection information (Job Address, Superintendent, Framing Contractor)
4. Begin inspecting each item on the checklist

### Conducting an Inspection
1. For each item, click "PASS" if it meets quality standards
2. Click "FAIL" if the item has issues
3. When you click "FAIL", an expandable section appears where you can add detailed deficiency descriptions
4. Click "OK" to save the description
5. Continue through all items on the checklist

### Managing Deficiencies
- View all failed items on the "Deficiencies" page
- Each deficiency shows the original item description and any additional notes you added
- Generate PDF reports to share with contractors

### Generating Reports
- Click "Generate PDF Report" on the deficiencies page
- The PDF will include:
  - Inspection details (job address, superintendent, contractor)
  - All failed items
  - Detailed deficiency descriptions you added
  - Signature lines for inspectors

## Technical Details

### File Structure
```
qc-app/
├── index.html              # Main entry point
├── pages/
│   ├── framing-reports.html    # Framing reports hub
│   ├── framing-inspection.html # Inspection form
│   └── deficiencies.html       # Deficiencies list
├── css/
│   └── style.css          # Stylesheet
└── js/
    └── script.js          # JavaScript functionality
```

### Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- jsPDF Library (for PDF generation)
- LocalStorage (for data persistence)

## Browser Compatibility

The application works on all modern browsers including Chrome, Firefox, Safari, and Edge. It's designed to be responsive and work on mobile devices, tablets, and desktop computers.

## Data Storage

All inspection data is stored locally in your browser's localStorage. This means:
- Data persists between sessions
- Data is only accessible on the same device and browser
- No server or internet connection required for basic functionality
- Data can be cleared by clearing browser data

## Customization

The application can be extended to include additional construction categories beyond framing by adding new tabs and corresponding pages.

## Limitations

- Data is stored only in browser localStorage
- No user authentication or multi-user support in this version
- PDF generation relies on client-side processing

## Future Enhancements

Potential areas for expansion include:
- User authentication and roles
- Cloud data storage
- Additional construction categories
- Photo documentation
- Advanced reporting features
- Offline capability improvements
