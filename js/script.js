// DOM elements
const itemsContainer = document.getElementById('items-container');
const deficienciesContainer = document.getElementById('deficiencies-container');
const viewDeficienciesBtn = document.getElementById('view-deficiencies-btn');
const backToInspectionBtn = document.getElementById('back-to-inspection-btn');
const completeInspectionBtn = document.getElementById('complete-inspection-btn');
const postButton = document.getElementById('post-button');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and load appropriate content
    if (itemsContainer) {
        loadInspectionPage();
    }
    // Check if we're on the deficiencies page
    else if (deficienciesContainer) {
        loadDeficienciesPage();
    }
    // Check if we're on the reports page
    else if (document.getElementById('report-cards-container')) {
        loadReportsPage();
    }
    // Check if we're on the view report page
    else if (document.getElementById('report-items-container')) {
        loadViewReportPage();
    }
    // Check if we're on the templates page
    else if (document.getElementById('template-cards-container')) {
        loadTemplatesPage();
    }
    // Check if we're on the template editor page
    else if (document.getElementById('template-items-container')) {
        loadTemplateEditor();
    }

    // Add event listeners for navigation
    if (viewDeficienciesBtn) {
        viewDeficienciesBtn.addEventListener('click', function() {
            window.location.href = 'deficiencies.html';
        });
    }

    if (backToInspectionBtn) {
        backToInspectionBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Initialize toggle states for any existing collapsible sections
    initializeCollapsibleSections();
    
    // Add event listener for complete inspection button if on the inspection page
    if (completeInspectionBtn) {
        completeInspectionBtn.addEventListener('click', completeInspection);
    }
    
    // Add event listener for post button if on the inspection page
    if (postButton) {
        postButton.addEventListener('click', postFunction);
    }

    // Refresh reports page when it becomes visible (e.g., when returning from view report)
    if (document.getElementById('report-cards-container')) {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                loadReportsPage();
            }
        });
    }
});

// Initialize collapsible sections
function initializeCollapsibleSections() {
    // Set initial state for all toggle icons to expanded (▼)
    const toggleIcons = document.querySelectorAll('.toggle-icon');
    toggleIcons.forEach(icon => {
        if (!icon.dataset.initialized) {
            icon.textContent = '▼'; // Default to expanded
            icon.dataset.initialized = 'true';
        }
    });
}

// Post function
function postFunction() {
    // Placeholder functionality for the Post button
    alert('Post functionality would be implemented here.');
}

// Complete the inspection and save it
function completeInspection() {
    // Get current inspection data
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();

    // Get job information
    const jobAddress = localStorage.getItem('jobAddress') || 'Not provided';
    const superintendent = localStorage.getItem('superintendent') || 'Not provided';
    const framingContractor = localStorage.getItem('framingContractor') || 'Not provided';

    // Get the items that were used for this inspection
    const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
    const templateItems = templateData.items || [];
    const templateId = templateData.templateId || null;
    const itemsToUse = templateItems.length > 0 ? templateItems : [];

    // Create inspection report object
    const inspectionReport = {
        id: Date.now(), // Unique ID based on timestamp
        jobAddress: jobAddress,
        superintendent: superintendent,
        framingContractor: framingContractor,
        date: new Date().toLocaleDateString(),
        results: savedResults,
        descriptions: storedDescriptions,
        items: itemsToUse, // Save the items that were inspected
        templateId: templateId, // Save the template ID this report was created from
        completedDeficiencies: {}, // Initialize empty - no deficiencies marked complete yet
        completedAt: new Date().toISOString()
    };

    // Save to localStorage
    let allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    allReports.push(inspectionReport);
    localStorage.setItem('inspectionReports', JSON.stringify(allReports));

    // Show confirmation and redirect to reports page
    alert('Inspection completed and saved successfully!');
    window.location.href = 'pages/framing-reports.html';
}

// Load the reports page
function loadReportsPage() {
    const reportCardsContainer = document.getElementById('report-cards-container');
    if (!reportCardsContainer) return;

    // Get saved reports
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');

    // Clear the container
    reportCardsContainer.innerHTML = '';

    if (allReports.length === 0) {
        reportCardsContainer.innerHTML = '<p>No inspection reports found. Create an inspection to see it here.</p>';
        return;
    }

    // Split reports into drafts and completed
    const draftReports = allReports.filter(r => r.status === 'draft');
    const completedReports = allReports.filter(r => r.status === 'completed');

    // Sort drafts by date (newest first)
    draftReports.sort((a, b) => new Date(b.id) - new Date(a.id));
    // Sort completed by date (newest first)
    completedReports.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    // Create Draft Reports section
    if (draftReports.length > 0) {
        const draftSection = document.createElement('div');
        draftSection.className = 'reports-section';
        draftSection.innerHTML = '<h2>Draft Reports</h2><div class="report-cards" id="draft-cards-container"></div>';
        reportCardsContainer.appendChild(draftSection);

        const draftCardsContainer = draftSection.querySelector('#draft-cards-container');
        draftReports.forEach(report => {
            const reportCard = createReportCard(report, false);
            draftCardsContainer.appendChild(reportCard);
        });
    }

    // Create Completed Reports section
    if (completedReports.length > 0) {
        const completedSection = document.createElement('div');
        completedSection.className = 'reports-section';
        completedSection.innerHTML = '<h2>Completed Reports</h2><div class="report-cards" id="completed-cards-container"></div>';
        reportCardsContainer.appendChild(completedSection);

        const completedCardsContainer = completedSection.querySelector('#completed-cards-container');
        completedReports.forEach(report => {
            const reportCard = createReportCard(report, true);
            completedCardsContainer.appendChild(reportCard);
        });
    }

    // Add event listeners to the buttons
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = parseInt(this.getAttribute('data-report-id'));
            viewReport(reportId);
        });
    });

    document.querySelectorAll('.btn-export').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = parseInt(this.getAttribute('data-report-id'));
            exportReportAsPdf(reportId);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete-report-card').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportId = parseInt(this.getAttribute('data-report-id'));
            deleteReport(reportId);
        });
    });
}

// Create a report card element
function createReportCard(report, isCompleted) {
    const reportCard = document.createElement('div');
    reportCard.className = 'report-card';

    // Count failed items
    const failedCount = Object.values(report.results).filter(status => status === 'fail').length;
    const totalCount = Object.keys(report.results).length;
    const statusText = failedCount > 0 ? `${failedCount} failed of ${totalCount}` : 'All passed';

    // Count completed deficiencies
    const completedDeficiencies = report.completedDeficiencies || {};
    const completedCount = Object.values(completedDeficiencies).filter(v => v).length;
    let completionText = '';
    if (failedCount > 0 && isCompleted) {
        completionText = `<p><strong>Completed:</strong> ${completedCount} of ${failedCount} deficiencies</p>`;
    }

    const actionsHtml = isCompleted
        ? `<div class="report-actions">
            <button class="btn-view" data-report-id="${report.id}">View Report</button>
            <button class="btn-export" data-report-id="${report.id}">Export PDF</button>
           </div>`
        : `<div class="report-actions">
            <button class="btn-view" data-report-id="${report.id}">View Report</button>
           </div>`;

    reportCard.innerHTML = `
        <button class="btn-delete-report-card" data-report-id="${report.id}" title="Delete report"><i class="fas fa-trash"></i></button>
        <h3>${report.jobAddress}</h3>
        <p><strong>Superintendent:</strong> ${report.superintendent}</p>
        <p><strong>Contractor:</strong> ${report.framingContractor}</p>
        <p><strong>Date:</strong> ${report.date}</p>
        <p><strong>Status:</strong> ${statusText}</p>
        ${completionText}
        ${actionsHtml}
    `;

    return reportCard;
}

// View a specific report
function viewReport(reportId) {
    // Get the report to check its status
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const report = allReports.find(r => r.id === reportId);

    if (!report) {
        alert('Report not found.');
        return;
    }

    // If draft, redirect to edit mode; if completed, redirect to read-only view
    if (report.status === 'draft') {
        window.location.href = `framing-inspection.html?editId=${reportId}`;
    } else {
        window.location.href = `view-report.html?id=${reportId}`;
    }
}

// Export a specific report as PDF
function exportReportAsPdf(reportId) {
    // Get the report data
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const report = allReports.find(r => r.id === reportId);

    if (!report) {
        alert('Report not found.');
        return;
    }

    try {
        // Generate PDF for the specific report
        generateSpecificReportPdf(report);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Delete a report
function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        return;
    }

    // Get the reports
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const reportIndex = allReports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) {
        alert('Report not found.');
        return;
    }

    // Remove the report
    allReports.splice(reportIndex, 1);

    // Save back to localStorage
    localStorage.setItem('inspectionReports', JSON.stringify(allReports));

    // Reload the page to update the display
    location.reload();
}

// Generate PDF for a specific report
function generateSpecificReportPdf(report) {
    // Check if jsPDF is available
    if (!window.jsPDF) {
        alert('PDF generation library not loaded. Please try again.');
        return;
    }

    // Create a new PDF document
    const doc = new window.jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('FRAMING QUALITY CONTROL REPORT', 20, 20);

    // Add inspection details
    doc.setFontSize(12);
    doc.text(`Job Address: ${report.jobAddress}`, 20, 35);
    doc.text(`Superintendent: ${report.superintendent}`, 20, 45);
    doc.text(`Framing Contractor: ${report.framingContractor}`, 20, 55);
    doc.text(`Date: ${report.date}`, 20, 65);

    // Add subtitle
    doc.setFontSize(16);
    doc.text('Deficiencies Report', 20, 80);

    // Get failed items from report's saved items
    let reportItems = report.items || [];
    // Fallback to template items if report has no items
    if (reportItems.length === 0) {
        const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
        reportItems = templateData.items || [];
    }
    const failedItems = reportItems.filter(item => report.results[item.id] === 'fail');
    
    console.log('PDF Export Debug:', {
        reportItems: reportItems.length,
        reportResults: report.results,
        failedItems: failedItems.length,
        reportDescriptions: report.descriptions
    });

    // Get completed deficiencies
    const completedDeficiencies = report.completedDeficiencies || {};

    // Add deficiencies list
    let yPos = 100;
    doc.setFontSize(12);
    doc.text('DEFICIENCIES FOUND:', 20, yPos);
    yPos += 10;

    if (failedItems.length > 0) {
        failedItems.forEach((item, index) => {
            // Add item name and status
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${item.name}`, 20, yPos);
            doc.text('Status: FAILED', 150, yPos);
            yPos += 8;

            // Add original description
            doc.setFontSize(10);
            const descriptionText = doc.splitTextToSize(`Description: ${item.description}`, 170);
            doc.text(descriptionText, 25, yPos);
            const lines = Array.isArray(descriptionText) ? descriptionText.length : 1;
            yPos += lines * 6 + 5;

            // Add the stored deficiency descriptions if they exist
            const itemDescriptions = report.descriptions[item.id] || report.descriptions[String(item.id)];
            if (itemDescriptions && itemDescriptions.length > 0) {
                itemDescriptions.forEach((desc, descIndex) => {
                    const deficiencyKey = `${item.id}_${descIndex}`;
                    const isCompleted = completedDeficiencies[deficiencyKey] === true;

                    // Draw checkbox
                    const checkboxX = 30;
                    const checkboxY = yPos - 3;
                    const checkboxSize = 4;

                    if (isCompleted) {
                        // Draw checked checkbox with checkmark
                        doc.setDrawColor(0, 128, 0); // Green
                        doc.setFillColor(0, 128, 0);
                        doc.setLineWidth(0.5);
                        doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize);
                        // Draw checkmark using lines
                        doc.setLineWidth(1);
                        doc.line(checkboxX + 1, checkboxY + 2, checkboxX + 2, checkboxY + 3.5);
                        doc.line(checkboxX + 2, checkboxY + 3.5, checkboxX + 3.5, checkboxY + 1);
                    } else {
                        // Draw empty checkbox
                        doc.setDrawColor(128, 128, 128); // Gray
                        doc.setLineWidth(0.5);
                        doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize);
                    }

                    // Add the user-provided notes with strikethrough if completed
                    doc.setFontSize(10);
                    const textY = yPos;
                    const deficiencyText = doc.splitTextToSize(`- ${desc}`, 165);

                    if (isCompleted) {
                        // Draw text in gray
                        doc.setTextColor(128, 128, 128); // Gray
                        doc.text(deficiencyText, 38, textY);

                        // Draw strikethrough line through middle of text
                        const textWidth = doc.getTextWidth(desc);
                        doc.setDrawColor(128, 128, 128);
                        doc.setLineWidth(0.3);
                        doc.line(38, textY - 1.5, 38 + textWidth, textY - 1.5);
                    } else {
                        // Draw normal text
                        doc.setTextColor(0, 0, 0);
                        doc.text(deficiencyText, 38, textY);
                    }

                    const deficiencyLines = Array.isArray(deficiencyText) ? deficiencyText.length : 1;
                    yPos += deficiencyLines * 6 + 3;

                    if (yPos > 260) {
                        doc.addPage();
                        yPos = 20;
                        doc.text('(Continued from previous page)', 20, yPos);
                        yPos += 10;
                    }
                });
            }

            yPos += 10; // Add space between items

            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
        });
    } else {
        doc.text('No deficiencies found.', 20, yPos);
        yPos += 10;
    }

    // Add inspector signature section
    yPos += 10;
    doc.text('Inspector: _________________________', 20, yPos);
    yPos += 10;
    doc.text('Signature: ________________________', 20, yPos);
    yPos += 10;
    doc.text(`Date: ${report.date}`, 20, yPos);

    // Save the PDF
    const filename = `framing_report_${report.id}_${report.date.replace(/\//g, '-')}.pdf`;
    console.log('Saving PDF:', filename);
    doc.save(filename);
}

// Load the inspection page
function loadInspectionPage() {
    // Clear the container
    itemsContainer.innerHTML = '';

    // Check if we're editing an existing report
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editId');
    let editingReport = null;
    let savedResults = {};
    let storedDescriptions = {};
    let itemsToUse = [];

    if (editId) {
        // Load existing report for editing
        const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
        editingReport = allReports.find(r => r.id === parseInt(editId));

        if (editingReport) {
            savedResults = editingReport.results || {};
            storedDescriptions = editingReport.descriptions || {};
            itemsToUse = editingReport.items || [];

            // Set templateItemsForInspection for the deficiencies page
            localStorage.setItem('templateItemsForInspection', JSON.stringify({
                templateId: editingReport.templateId,
                items: itemsToUse
            }));

            // Display report info
            const jobAddressSpan = document.getElementById('display-job-address');
            const superintendentSpan = document.getElementById('display-superintendent');
            const framingContractorSpan = document.getElementById('display-framing-contractor');

            if (jobAddressSpan) jobAddressSpan.textContent = editingReport.jobAddress || 'Not provided';
            if (superintendentSpan) superintendentSpan.textContent = editingReport.superintendent || 'Not provided';
            if (framingContractorSpan) framingContractorSpan.textContent = editingReport.framingContractor || 'Not provided';
        }
    }

    if (!editingReport) {
        // New inspection - use template or empty
        const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
        const templateItems = templateData.items || [];
        itemsToUse = templateItems.length > 0 ? templateItems : [];
        savedResults = getSavedResults();
        storedDescriptions = getStoredDeficiencyDescriptions();
    }

    // Create and display items
    itemsToUse.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inspection-item';

        // Get saved status for this item, default to 'pending'
        const savedStatus = savedResults[item.id] || 'pending';

        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
            </div>
            <div class="button-group">
                <button class="btn-pass ${savedStatus === 'pass' ? 'active' : ''}" data-id="${item.id}">PASS</button>
                <button class="btn-fail ${savedStatus === 'fail' ? 'active' : ''}" data-id="${item.id}">FAIL</button>
                ${savedStatus !== 'pending' ? `<span class="status-label ${savedStatus === 'pass' ? 'status-pass' : 'status-fail'}">${savedStatus === 'pass' ? 'PASSED' : 'FAILED'}</span>` : ''}
            </div>
        `;
        itemElement.setAttribute('data-id', item.id);

        itemsContainer.appendChild(itemElement);
        
        // If the item is marked as failed and has stored descriptions, show them
        if (savedStatus === 'fail' && storedDescriptions[item.id] && storedDescriptions[item.id].length > 0) {
            // Create the deficiency display section with collapsible header
            const deficiencyDisplay = document.createElement('div');
            deficiencyDisplay.id = `deficiency-display-${item.id}`;
            deficiencyDisplay.className = 'deficiency-display';

            // Create header with toggle
            const displayHeader = document.createElement('div');
            displayHeader.className = 'deficiency-display-header';
            displayHeader.innerHTML = `
                <h4>Added Deficiencies</h4>
                <button type="button" class="toggle-button" data-target="deficiency-display-content-${item.id}">
                    <span class="toggle-icon">▼</span>
                </button>
            `;

            deficiencyDisplay.appendChild(displayHeader);

            // Create content section
            const displayContent = document.createElement('div');
            displayContent.id = `deficiency-display-content-${item.id}`;
            displayContent.className = 'deficiency-display-content';

            // Add each stored description
            storedDescriptions[item.id].forEach(desc => {
                const descParagraph = document.createElement('p');
                descParagraph.textContent = desc;
                displayContent.appendChild(descParagraph);
            });

            deficiencyDisplay.appendChild(displayContent);

            itemElement.appendChild(deficiencyDisplay);

            // Add toggle functionality to the display section
            const displayToggle = displayHeader.querySelector('.toggle-button');
            displayToggle.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement.style.display === 'none') {
                    targetElement.style.display = 'block';
                    this.querySelector('.toggle-icon').textContent = '▼';
                } else {
                    targetElement.style.display = 'none';
                    this.querySelector('.toggle-icon').textContent = '▶';
                }
            });
        }
    });

    // Add event listeners to the buttons
    document.querySelectorAll('.btn-pass').forEach(button => {
        button.addEventListener('click', handlePassClick);
    });

    document.querySelectorAll('.btn-fail').forEach(button => {
        button.addEventListener('click', handleFailClick);
    });
}

// Load the deficiencies page
function loadDeficienciesPage() {
    // Clear the container
    deficienciesContainer.innerHTML = '';

    // Get saved results and find failed items
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();
    
    // Get items from template or use empty array
    const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
    const templateItems = templateData.items || [];
    const failedItems = templateItems.filter(item => savedResults[item.id] === 'fail');

    if (failedItems.length === 0) {
        deficienciesContainer.innerHTML = '<p>No deficiencies found. All items have passed inspection.</p>';
        return;
    }

    // Create and display failed items
    failedItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'deficiency-item';

        // Get any stored descriptions for this item
        const descriptions = storedDescriptions[item.id] || [];
        let descriptionHTML = `<div class="deficiency-description">${item.description}</div>`;

        if (descriptions.length > 0) {
            // Create collapsible section for additional descriptions
            descriptionHTML += `
                <div class="additional-descriptions-container">
                    <div class="additional-descriptions-header">
                        <h4>Additional Details</h4>
                        <button type="button" class="toggle-button" data-target="additional-descriptions-content-${item.id}">
                            <span class="toggle-icon">▼</span>
                        </button>
                    </div>
                    <div id="additional-descriptions-content-${item.id}" class="additional-descriptions-content">
            `;
            
            descriptions.forEach(desc => {
                descriptionHTML += `<div class="additional-description"><p>${desc}</p></div>`;
            });
            
            descriptionHTML += `
                    </div>
                </div>
            `;
        } else {
            descriptionHTML += '<div class="additional-descriptions"></div>'; // Empty container if no descriptions
        }

        itemElement.innerHTML = `
            <div class="deficiency-header">
                <div class="deficiency-name">${item.name}</div>
                <span class="status-badge status-fail">FAILED</span>
            </div>
            <div class="deficiency-description">${item.description}</div>
            <div class="deficiency-content-wrapper">
                ${descriptionHTML.replace(`<div class="deficiency-description">${item.description}</div>`, '')}
            </div>
        `;

        deficienciesContainer.appendChild(itemElement);
        
        // Add toggle functionality for additional descriptions if they exist
        if (descriptions.length > 0) {
            const toggleButton = itemElement.querySelector(`.additional-descriptions-header .toggle-button`);
            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement.style.display === 'none') {
                        targetElement.style.display = 'block';
                        this.querySelector('.toggle-icon').textContent = '▼';
                    } else {
                        targetElement.style.display = 'none';
                        this.querySelector('.toggle-icon').textContent = '▶';
                    }
                });
            }
        }
    });
}

// Load the view report page
function loadViewReportPage() {
    const reportItemsContainer = document.getElementById('report-items-container');
    if (!reportItemsContainer) return;

    // Get report ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = parseInt(urlParams.get('id'));

    if (!reportId) {
        reportItemsContainer.innerHTML = '<p>Invalid report ID.</p>';
        return;
    }

    // Get the report data
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const report = allReports.find(r => r.id === reportId);

    if (!report) {
        reportItemsContainer.innerHTML = '<p>Report not found.</p>';
        return;
    }

    // Initialize completedDeficiencies if not exists
    if (!report.completedDeficiencies) {
        report.completedDeficiencies = {};
    }

    // Display inspection details
    const jobAddressSpan = document.getElementById('display-job-address');
    const superintendentSpan = document.getElementById('display-superintendent');
    const framingContractorSpan = document.getElementById('display-framing-contractor');
    const dateSpan = document.getElementById('display-date');

    if (jobAddressSpan) jobAddressSpan.textContent = report.jobAddress || 'Not provided';
    if (superintendentSpan) superintendentSpan.textContent = report.superintendent || 'Not provided';
    if (framingContractorSpan) framingContractorSpan.textContent = report.framingContractor || 'Not provided';
    if (dateSpan) dateSpan.textContent = report.date || 'Not provided';

    // Clear the container
    reportItemsContainer.innerHTML = '';

    // Get stored descriptions
    const storedDescriptions = report.descriptions || {};
    const completedDeficiencies = report.completedDeficiencies || {};

    // Use saved items from report, or fall back to template items, or empty array
    let reportItems = report.items || [];
    if (reportItems.length === 0) {
        // Try to load from templateItemsForInspection as fallback
        const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
        reportItems = templateData.items || [];
    }

    // Create and display all items with their status
    reportItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inspection-item';

        // Get status for this item
        const status = report.results[item.id] || 'pending';
        const statusClass = status === 'pass' ? 'status-pass' : (status === 'fail' ? 'status-fail' : '');
        const statusText = status === 'pass' ? 'PASSED' : (status === 'fail' ? 'FAILED' : 'PENDING');

        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
            </div>
            <div class="button-group">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
        `;

        // If the item failed and has descriptions, show them with checkboxes
        if (status === 'fail' && storedDescriptions[item.id] && storedDescriptions[item.id].length > 0) {
            const deficiencyDisplay = document.createElement('div');
            deficiencyDisplay.id = `deficiency-display-${item.id}`;
            deficiencyDisplay.className = 'deficiency-display';

            // Create header with toggle
            const displayHeader = document.createElement('div');
            displayHeader.className = 'deficiency-display-header';
            displayHeader.innerHTML = `
                <h4>Deficiency Details</h4>
                <button type="button" class="toggle-button" data-target="deficiency-display-content-${item.id}">
                    <span class="toggle-icon">▼</span>
                </button>
            `;

            deficiencyDisplay.appendChild(displayHeader);

            // Create content section
            const displayContent = document.createElement('div');
            displayContent.id = `deficiency-display-content-${item.id}`;
            displayContent.className = 'deficiency-display-content';

            // Add each stored description with checkbox
            storedDescriptions[item.id].forEach((desc, descIndex) => {
                const deficiencyKey = `${item.id}_${descIndex}`;
                const isCompleted = completedDeficiencies[deficiencyKey] === true;

                const deficiencyRow = document.createElement('div');
                deficiencyRow.className = 'deficiency-item-row';
                if (isCompleted) {
                    deficiencyRow.classList.add('deficiency-complete');
                }

                const descParagraph = document.createElement('p');
                descParagraph.className = 'deficiency-text';
                descParagraph.textContent = desc;
                if (isCompleted) {
                    descParagraph.classList.add('deficiency-complete');
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'deficiency-checkbox';
                checkbox.checked = isCompleted;
                checkbox.dataset.deficiencyKey = deficiencyKey;
                checkbox.title = 'Mark as complete';

                deficiencyRow.appendChild(checkbox);
                deficiencyRow.appendChild(descParagraph);
                displayContent.appendChild(deficiencyRow);

                // Add checkbox change event listener
                checkbox.addEventListener('change', function() {
                    toggleDeficiencyComplete(reportId, deficiencyKey, this.checked);
                    if (this.checked) {
                        deficiencyRow.classList.add('deficiency-complete');
                        descParagraph.classList.add('deficiency-complete');
                    } else {
                        deficiencyRow.classList.remove('deficiency-complete');
                        descParagraph.classList.remove('deficiency-complete');
                    }
                });
            });

            deficiencyDisplay.appendChild(displayContent);
            itemElement.appendChild(deficiencyDisplay);

            // Add toggle functionality
            const displayToggle = displayHeader.querySelector('.toggle-button');
            displayToggle.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);

                if (targetElement.style.display === 'none') {
                    targetElement.style.display = 'block';
                    this.querySelector('.toggle-icon').textContent = '▼';
                } else {
                    targetElement.style.display = 'none';
                    this.querySelector('.toggle-icon').textContent = '▶';
                }
            });
        }

        reportItemsContainer.appendChild(itemElement);
    });

    // Add event listener for PDF export button
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            exportReportAsPdf(reportId);
        });
    }

    // Refresh data when page becomes visible (e.g., when returning from editing)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && reportItemsContainer) {
            loadViewReportPage();
        }
    });
}

// Toggle deficiency completion status
function toggleDeficiencyComplete(reportId, deficiencyKey, isCompleted) {
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const reportIndex = allReports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) return;

    // Initialize completedDeficiencies if not exists
    if (!allReports[reportIndex].completedDeficiencies) {
        allReports[reportIndex].completedDeficiencies = {};
    }

    // Set completion status
    allReports[reportIndex].completedDeficiencies[deficiencyKey] = isCompleted;

    // Save back to localStorage
    localStorage.setItem('inspectionReports', JSON.stringify(allReports));
}


// Handle PASS button click
function handlePassClick(event) {
    const itemId = parseInt(event.target.getAttribute('data-id'));
    
    // Save the result
    saveResult(itemId, 'pass');
    
    // Update UI
    updateButtonStates(itemId, 'pass');
}

// Handle FAIL button click
function handleFailClick(event) {
    const itemId = parseInt(event.target.getAttribute('data-id'));
    
    // Save the result
    saveResult(itemId, 'fail');
    
    // Update UI
    updateButtonStates(itemId, 'fail');
    
    // Show the deficiency description section for this item
    showDeficiencyDescriptionSection(itemId);
}

// Show the deficiency description section for a specific item
function showDeficiencyDescriptionSection(itemId) {
    const itemElement = document.querySelector(`.inspection-item[data-id="${itemId}"]`);
    if (!itemElement) return;

    // Check if the section already exists
    const existingSection = document.getElementById(`deficiency-desc-${itemId}`);
    if (existingSection) {
        existingSection.style.display = 'block';
        return;
    }

    // Create the deficiency description section
    const deficiencySection = document.createElement('div');
    deficiencySection.id = `deficiency-desc-${itemId}`;
    deficiencySection.className = 'deficiency-description-section';

    // Create the header with toggle button
    const headerSection = document.createElement('div');
    headerSection.className = 'deficiency-header';
    headerSection.innerHTML = `
        <h4>Deficiency Details</h4>
        <button type="button" class="toggle-button" data-target="deficiency-desc-content-${itemId}">
            <span class="toggle-icon">▼</span>
        </button>
    `;

    // Create the content section
    const contentSection = document.createElement('div');
    contentSection.id = `deficiency-desc-content-${itemId}`;
    contentSection.className = 'deficiency-content';

    contentSection.innerHTML = `
        <div class="deficiency-input-container">
            <label for="deficiency-desc-input-${itemId}">Deficiency Description:</label>
            <textarea id="deficiency-desc-input-${itemId}" placeholder="Describe the deficiency..."></textarea>
            <button class="btn-ok" data-id="${itemId}">OK</button>
        </div>
    `;

    deficiencySection.appendChild(headerSection);
    deficiencySection.appendChild(contentSection);

    itemElement.appendChild(deficiencySection);

    // Add auto-resize functionality to textarea
    const textarea = document.getElementById(`deficiency-desc-input-${itemId}`);
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });

    // Add event listener to the toggle button
    const toggleButton = headerSection.querySelector('.toggle-button');
    toggleButton.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement.style.display === 'none') {
            targetElement.style.display = 'block';
            this.querySelector('.toggle-icon').textContent = '▼';
        } else {
            targetElement.style.display = 'none';
            this.querySelector('.toggle-icon').textContent = '▶';
        }
    });

    // Add event listener to the OK button
    const okButton = contentSection.querySelector('.btn-ok');
    okButton.addEventListener('click', function() {
        const descInput = document.getElementById(`deficiency-desc-input-${itemId}`);
        const description = descInput.value.trim();

        if (description) {
            // Store the description in localStorage
            storeDeficiencyDescription(itemId, description);

            // Find the item element again to append the display
            const itemEl = document.querySelector(`.inspection-item[data-id="${itemId}"]`);

            // Create a display div if it doesn't exist
            let displayDiv = document.getElementById(`deficiency-display-${itemId}`);
            if (!displayDiv) {
                displayDiv = document.createElement('div');

                // Create header with toggle for the display section too
                const displayHeader = document.createElement('div');
                displayHeader.className = 'deficiency-display-header';
                displayHeader.innerHTML = `
                    <h4>Added Deficiencies</h4>
                    <button type="button" class="toggle-button" data-target="deficiency-display-content-${itemId}">
                        <span class="toggle-icon">▼</span>
                    </button>
                `;

                displayDiv.appendChild(displayHeader);

                const displayContent = document.createElement('div');
                displayContent.id = `deficiency-display-content-${itemId}`;
                displayContent.className = 'deficiency-display-content';
                displayDiv.id = `deficiency-display-${itemId}`;
                displayDiv.className = 'deficiency-display';

                displayDiv.appendChild(displayContent);

                // Insert displayDiv BEFORE the deficiencySection (input section)
                itemEl.insertBefore(displayDiv, deficiencySection);

                // Add toggle functionality to the display section
                const displayToggle = displayHeader.querySelector('.toggle-button');
                displayToggle.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement.style.display === 'none') {
                        targetElement.style.display = 'block';
                        this.querySelector('.toggle-icon').textContent = '▼';
                    } else {
                        targetElement.style.display = 'none';
                        this.querySelector('.toggle-icon').textContent = '▶';
                    }
                });
            }

            // Add the description to the display content
            const descParagraph = document.createElement('p');
            descParagraph.textContent = description;
            const displayContent = displayDiv.querySelector('.deficiency-display-content');
            displayContent.appendChild(descParagraph);

            // Clear the input field
            descInput.value = '';
        }
    });
}

// Store deficiency description in localStorage
function storeDeficiencyDescription(itemId, description) {
    let storedDescriptions = JSON.parse(localStorage.getItem('storedDeficiencyDescriptions') || '{}');
    if (!storedDescriptions[itemId]) {
        storedDescriptions[itemId] = [];
    }
    storedDescriptions[itemId].push(description);
    localStorage.setItem('storedDeficiencyDescriptions', JSON.stringify(storedDescriptions));
}

// Get stored deficiency descriptions
function getStoredDeficiencyDescriptions() {
    return JSON.parse(localStorage.getItem('storedDeficiencyDescriptions') || '{}');
}


// Update the PDF generation function to include deficiency descriptions
function generatePdfReport() {
    // Get jsPDF instance
    const { jsPDF } = window.jspdf;
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('FRAMING QUALITY CONTROL REPORT', 20, 20);
    
    // Add inspection details
    const savedJobAddress = localStorage.getItem('jobAddress') || 'Not provided';
    const savedSuperintendent = localStorage.getItem('superintendent') || 'Not provided';
    const savedFramingContractor = localStorage.getItem('framingContractor') || 'Not provided';
    
    doc.setFontSize(12);
    doc.text(`Job Address: ${savedJobAddress}`, 20, 35);
    doc.text(`Superintendent: ${savedSuperintendent}`, 20, 45);
    doc.text(`Framing Contractor: ${savedFramingContractor}`, 20, 55);
    
    // Add subtitle
    doc.setFontSize(16);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Deficiencies Report - Generated on: ${currentDate}`, 20, 70);

    // Get saved results and find failed items
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();
    
    // Get items from template or use empty array
    const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
    const templateItems = templateData.items || [];
    const failedItems = templateItems.filter(item => savedResults[item.id] === 'fail');

    // Add deficiencies list
    let yPos = 90;
    doc.setFontSize(12);
    doc.text('DEFICIENCIES FOUND:', 20, yPos);
    yPos += 10;
    
    if (failedItems.length > 0) {
        failedItems.forEach((item, index) => {
            // Add item name and status
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${item.name}`, 20, yPos);
            doc.text('Status: FAILED', 150, yPos);
            yPos += 8;
            
            // Add original description
            doc.setFontSize(10);
            const descriptionText = doc.splitTextToSize(`Description: ${item.description}`, 170);
            doc.text(descriptionText, 25, yPos);
            const lines = Array.isArray(descriptionText) ? descriptionText.length : 1;
            yPos += lines * 6 + 5;

            // Add the stored deficiency descriptions if they exist
            const itemDescriptions = storedDescriptions[item.id] || storedDescriptions[String(item.id)];
            if (itemDescriptions && itemDescriptions.length > 0) {
                itemDescriptions.forEach(desc => {
                    // Indent the user-provided notes
                    const deficiencyText = doc.splitTextToSize(`- ${desc}`, 165);
                    doc.text(deficiencyText, 30, yPos);
                    const deficiencyLines = Array.isArray(deficiencyText) ? deficiencyText.length : 1;
                    yPos += deficiencyLines * 6 + 3;
                    
                    if (yPos > 260) {
                        doc.addPage();
                        yPos = 20;
                        doc.text('(Continued from previous page)', 20, yPos);
                        yPos += 10;
                    }
                });
            }
            
            yPos += 10; // Add space between items
            
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
        });
    } else {
        doc.text('No deficiencies found.', 20, yPos);
        yPos += 10;
    }
    
    // Add inspector signature section
    yPos += 10;
    doc.text('Inspector: _________________________', 20, yPos);
    yPos += 10;
    doc.text('Signature: ________________________', 20, yPos);
    yPos += 10;
    doc.text(`Date: ${currentDate}`, 20, yPos);
    
    // Save the PDF
    doc.save(`deficiencies_report_${currentDate.replace(/\//g, '-')}.pdf`);
}

// Save result to localStorage
function saveResult(itemId, status) {
    let results = getSavedResults();
    results[itemId] = status;
    localStorage.setItem('inspectionResults', JSON.stringify(results));
}

// Get saved results from localStorage
function getSavedResults() {
    const results = localStorage.getItem('inspectionResults');
    return results ? JSON.parse(results) : {};
}

// Clear all inspection data for a new inspection
function clearInspectionData() {
    localStorage.removeItem('inspectionResults');
    localStorage.removeItem('storedDeficiencyDescriptions');
    localStorage.removeItem('jobAddress');
    localStorage.removeItem('superintendent');
    localStorage.removeItem('framingContractor');
}

// Update button states after selection and show status label
function updateButtonStates(itemId, status) {
    const itemElement = document.querySelector(`.inspection-item[data-id="${itemId}"]`);
    const passBtn = document.querySelector(`.btn-pass[data-id="${itemId}"]`);
    const failBtn = document.querySelector(`.btn-fail[data-id="${itemId}"]`);

    // Remove existing status label if any
    const existingLabel = itemElement.querySelector('.status-label');
    if (existingLabel) {
        existingLabel.remove();
    }

    // Create status label
    const statusLabel = document.createElement('span');
    statusLabel.className = 'status-label';

    if (status === 'pass') {
        passBtn.classList.add('active');
        failBtn.classList.remove('active');
        statusLabel.textContent = 'PASSED';
        statusLabel.classList.add('status-pass');
    } else {
        passBtn.classList.remove('active');
        failBtn.classList.add('active');
        statusLabel.textContent = 'FAILED';
        statusLabel.classList.add('status-fail');
    }

    // Insert status label after the button group
    const buttonGroup = itemElement.querySelector('.button-group');
    buttonGroup.appendChild(statusLabel);
}

// Post the inspection
function submitInspection(status = 'completed') {
    // Check if we're editing an existing report
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editId');

    // Get current inspection data
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();

    // Get job information
    const jobAddress = localStorage.getItem('jobAddress') || 'Not provided';
    const superintendent = localStorage.getItem('superintendent') || 'Not provided';
    const framingContractor = localStorage.getItem('framingContractor') || 'Not provided';

    // Get the items that were used for this inspection
    const templateData = JSON.parse(localStorage.getItem('templateItemsForInspection') || '{}');
    const templateItems = templateData.items || [];
    const templateId = templateData.templateId || null;
    const itemsToUse = templateItems.length > 0 ? templateItems : [];

    // Get the report being edited (if any)
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    let editingReport = null;
    let reportIndex = -1;

    if (editId) {
        reportIndex = allReports.findIndex(r => r.id === parseInt(editId));
        if (reportIndex !== -1) {
            editingReport = allReports[reportIndex];
        }
    }

    // Create or update inspection report object
    let inspectionReport;

    if (editingReport) {
        // Update existing report
        inspectionReport = {
            ...editingReport, // Keep existing data
            results: savedResults,
            descriptions: storedDescriptions,
            items: itemsToUse,
            status: status,
            completedAt: status === 'completed' ? new Date().toISOString() : editingReport.completedAt
        };

        // Update the report in the array
        allReports[reportIndex] = inspectionReport;
    } else {
        // Create new report
        inspectionReport = {
            id: Date.now(), // Unique ID based on timestamp
            jobAddress: jobAddress,
            superintendent: superintendent,
            framingContractor: framingContractor,
            date: new Date().toLocaleDateString(),
            results: savedResults,
            descriptions: storedDescriptions,
            items: itemsToUse, // Save the items that were inspected
            templateId: templateId, // Save the template ID this report was created from
            status: status, // 'draft' or 'completed'
            completedDeficiencies: editingReport ? editingReport.completedDeficiencies : {},
            completedAt: status === 'completed' ? new Date().toISOString() : null
        };

        allReports.push(inspectionReport);
    }

    // Save to localStorage
    localStorage.setItem('inspectionReports', JSON.stringify(allReports));

    // Show confirmation
    if (status === 'draft') {
        alert('Inspection saved as draft. You can continue editing later.');
    } else {
        alert('Inspection completed and saved successfully!');
    }

    // Redirect to reports page
    window.location.href = 'framing-reports.html';
}

// Modal and form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Existing code...
    
    // Add event listener for PDF generation button if on deficiencies page
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generatePdfReport);
    }
    
    // Modal functionality for the framing reports page
    const startInspectionBtn = document.getElementById('start-inspection-btn');
    const modal = document.getElementById('inspection-modal');
    const closeBtn = document.querySelector('.close');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const inspectionForm = document.getElementById('inspection-form');
    
    // Check if we're on the reports page
    if (startInspectionBtn) {
        startInspectionBtn.addEventListener('click', function() {
            // Check if any templates exist
            const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
            
            if (allTemplates.length === 0) {
                alert('No templates available. Please create a template first.');
                return;
            }
            
            // Clear existing inspection data for a fresh start
            clearInspectionData();
            modal.style.display = 'block';
        });
    }
    
    // Close modal when clicking the X
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking Cancel
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Handle form submission
    if (inspectionForm) {
        inspectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const jobAddress = document.getElementById('job-address').value;
            const superintendent = document.getElementById('superintendent').value;
            const framingContractor = document.getElementById('framing-contractor').value;
            
            // Save to localStorage
            localStorage.setItem('jobAddress', jobAddress);
            localStorage.setItem('superintendent', superintendent);
            localStorage.setItem('framingContractor', framingContractor);
            
            // Close modal
            modal.style.display = 'none';

            // Redirect to inspection page
            window.location.href = 'framing-inspection.html';
        });
    }

    // On the inspection page and deficiencies page, load and display saved info
    const jobAddressSpan = document.getElementById('display-job-address');
    const superintendentSpan = document.getElementById('display-superintendent');
    const framingContractorSpan = document.getElementById('display-framing-contractor');

    if (jobAddressSpan && superintendentSpan && framingContractorSpan) {
        // Load saved values
        const savedJobAddress = localStorage.getItem('jobAddress');
        const savedSuperintendent = localStorage.getItem('superintendent');
        const savedFramingContractor = localStorage.getItem('framingContractor');

        // Display values
        jobAddressSpan.textContent = savedJobAddress || 'Not provided';
        superintendentSpan.textContent = savedSuperintendent || 'Not provided';
        framingContractorSpan.textContent = savedFramingContractor || 'Not provided';
    }

    // Template modal functionality
    const newTemplateBtn = document.getElementById('new-template-btn');
    const templateModal = document.getElementById('template-modal');
    const closeTemplateBtn = document.querySelector('#template-modal .close');
    const cancelTemplateBtn = document.getElementById('cancel-template-btn');
    const templateForm = document.getElementById('template-form');

    if (newTemplateBtn) {
        newTemplateBtn.addEventListener('click', function() {
            templateModal.style.display = 'block';
            document.getElementById('template-title').focus();
        });
    }

    if (closeTemplateBtn) {
        closeTemplateBtn.addEventListener('click', function() {
            templateModal.style.display = 'none';
            document.getElementById('template-title').value = '';
        });
    }

    if (cancelTemplateBtn) {
        cancelTemplateBtn.addEventListener('click', function() {
            templateModal.style.display = 'none';
            document.getElementById('template-title').value = '';
        });
    }

    if (templateForm) {
        templateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('template-title').value.trim();
            if (title) {
                createNewTemplate(title);
                templateModal.style.display = 'none';
                document.getElementById('template-title').value = '';
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (templateModal && e.target === templateModal) {
            templateModal.style.display = 'none';
            document.getElementById('template-title').value = '';
        }
    });

    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navTabs = document.querySelector('.nav-tabs');

    if (navToggle && navTabs) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navTabs.classList.toggle('active');
        });

        // Close menu when clicking a nav tab
        navTabs.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navTabs.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navTabs.contains(e.target)) {
                navToggle.classList.remove('active');
                navTabs.classList.remove('active');
            }
        });
    }
});

// ==================== TEMPLATE FUNCTIONS ====================

// Load the templates page
function loadTemplatesPage() {
    const templateCardsContainer = document.getElementById('template-cards-container');
    if (!templateCardsContainer) return;

    // Get saved templates
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');

    // Clear the container
    templateCardsContainer.innerHTML = '';

    if (allTemplates.length === 0) {
        templateCardsContainer.innerHTML = '<p>No templates found. Click "New Template" to create one.</p>';
        return;
    }

    // Sort templates by date (newest first)
    allTemplates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Create and display template cards
    allTemplates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';

        const itemCount = template.items ? template.items.length : 0;

        templateCard.innerHTML = `
            <button class="btn-delete-template-card" data-template-id="${template.id}" title="Delete template"><i class="fas fa-trash"></i></button>
            <h3>${template.title}</h3>
            <p><strong>Items:</strong> ${itemCount}</p>
            <p><strong>Created:</strong> ${template.createdAt}</p>
            <div class="template-actions">
                <button class="btn-primary btn-edit-template" data-template-id="${template.id}">Edit</button>
                <button class="btn-secondary btn-use-template" data-template-id="${template.id}">Use for Inspection</button>
            </div>
        `;

        templateCardsContainer.appendChild(templateCard);
    });

    // Add event listeners to the buttons
    document.querySelectorAll('.btn-edit-template').forEach(button => {
        button.addEventListener('click', function() {
            const templateId = parseInt(this.getAttribute('data-template-id'));
            window.location.href = `template-editor.html?id=${templateId}`;
        });
    });

    document.querySelectorAll('.btn-use-template').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateId = parseInt(this.getAttribute('data-template-id'));
            useTemplateForInspection(templateId);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete-template-card').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateId = parseInt(this.getAttribute('data-template-id'));
            deleteTemplate(templateId);
        });
    });

    // Make card clickable to edit
    templateCardsContainer.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-edit-template') && !e.target.classList.contains('btn-use-template')) {
                const editBtn = card.querySelector('.btn-edit-template');
                if (editBtn) {
                    const templateId = parseInt(editBtn.getAttribute('data-template-id'));
                    window.location.href = `template-editor.html?id=${templateId}`;
                }
            }
        });
    });
}

// Create a new template
function createNewTemplate(title) {
    const newTemplate = {
        id: Date.now(),
        title: title,
        items: [],
        createdAt: new Date().toLocaleDateString()
    };

    let allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    allTemplates.push(newTemplate);
    localStorage.setItem('deficiencyTemplates', JSON.stringify(allTemplates));

    // Redirect to template editor
    window.location.href = `template-editor.html?id=${newTemplate.id}`;
}

// Load the template editor page
function loadTemplateEditor() {
    const templateItemsContainer = document.getElementById('template-items-container');
    if (!templateItemsContainer) return;

    // Get template ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = parseInt(urlParams.get('id'));

    if (!templateId) {
        templateItemsContainer.innerHTML = '<p>Invalid template ID.</p>';
        return;
    }

    // Get the template data
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    const template = allTemplates.find(t => t.id === templateId);

    if (!template) {
        templateItemsContainer.innerHTML = '<p>Template not found.</p>';
        return;
    }

    // Display template name
    const templateNameSpan = document.getElementById('display-template-name');
    const templateTitleDisplay = document.getElementById('template-title-display');
    if (templateNameSpan) templateNameSpan.textContent = template.title;
    if (templateTitleDisplay) templateTitleDisplay.textContent = `Edit: ${template.title}`;

    // Initialize items array if not exists
    if (!template.items) {
        template.items = [];
    }

    // Load template items
    loadTemplateItems(template, templateItemsContainer);

    // Add event listener for add item button
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            addTemplateItem(templateId);
        });
    }

    // Add event listener for post button
    const postTemplateBtn = document.getElementById('post-template-btn');
    if (postTemplateBtn) {
        postTemplateBtn.addEventListener('click', function() {
            alert('Template saved successfully!');
            window.location.href = 'templates.html';
        });
    }
}

// Load and display template items
function loadTemplateItems(template, container) {
    container.innerHTML = '';

    if (!template.items || template.items.length === 0) {
        container.innerHTML = '<p>No items in this template yet. Add items above.</p>';
        return;
    }

    template.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'template-item';

        itemElement.innerHTML = `
            <div class="template-item-info">
                <div class="template-item-name">${item.name}</div>
            </div>
            <button class="btn-delete-template" data-item-index="${index}">Delete</button>
        `;

        container.appendChild(itemElement);
    });

    // Add event listeners to delete buttons
    container.querySelectorAll('.btn-delete-template').forEach(button => {
        button.addEventListener('click', function() {
            const itemIndex = parseInt(this.getAttribute('data-item-index'));
            deleteTemplateItem(template.id, itemIndex);
        });
    });
}

// Add an item to the template
function addTemplateItem(templateId) {
    const itemNameInput = document.getElementById('item-name');

    const itemName = itemNameInput.value.trim();

    if (!itemName) {
        alert('Please enter an item name.');
        return;
    }

    // Get the template
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    const templateIndex = allTemplates.findIndex(t => t.id === templateId);

    if (templateIndex === -1) {
        alert('Template not found.');
        return;
    }

    // Initialize items array if not exists
    if (!allTemplates[templateIndex].items) {
        allTemplates[templateIndex].items = [];
    }

    // Add the new item
    allTemplates[templateIndex].items.push({
        id: Date.now(),
        name: itemName,
        description: ''
    });

    // Save back to localStorage
    localStorage.setItem('deficiencyTemplates', JSON.stringify(allTemplates));

    // Clear input
    itemNameInput.value = '';

    // Reload the items list
    loadTemplateItems(allTemplates[templateIndex], document.getElementById('template-items-container'));
}

// Delete an item from the template
function deleteTemplateItem(templateId, itemIndex) {
    // Get the template
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    const templateIndex = allTemplates.findIndex(t => t.id === templateId);

    if (templateIndex === -1) {
        alert('Template not found.');
        return;
    }

    // Remove the item
    allTemplates[templateIndex].items.splice(itemIndex, 1);

    // Save back to localStorage
    localStorage.setItem('deficiencyTemplates', JSON.stringify(allTemplates));

    // Reload the items list
    loadTemplateItems(allTemplates[templateIndex], document.getElementById('template-items-container'));
}

// Use a template for a new inspection
function useTemplateForInspection(templateId) {
    // Get the template
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    const template = allTemplates.find(t => t.id === templateId);

    if (!template) {
        alert('Template not found.');
        return;
    }

    // Store template items and templateId in localStorage for the inspection to use
    localStorage.setItem('templateItemsForInspection', JSON.stringify({
        templateId: templateId,
        items: template.items || []
    }));

    // Redirect to framing inspection page
    window.location.href = 'framing-inspection.html';
}

// Delete a template
function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
        return;
    }

    // Get the templates
    const allTemplates = JSON.parse(localStorage.getItem('deficiencyTemplates') || '[]');
    const templateIndex = allTemplates.findIndex(t => t.id === templateId);

    if (templateIndex === -1) {
        alert('Template not found.');
        return;
    }

    // Remove the template
    allTemplates.splice(templateIndex, 1);

    // Save back to localStorage
    localStorage.setItem('deficiencyTemplates', JSON.stringify(allTemplates));

    // Also delete all reports created from this template
    const allReports = JSON.parse(localStorage.getItem('inspectionReports') || '[]');
    const filteredReports = allReports.filter(r => r.templateId !== templateId);

    // Only update if reports were actually deleted
    if (filteredReports.length !== allReports.length) {
        localStorage.setItem('inspectionReports', JSON.stringify(filteredReports));
    }

    // Reload the page to update the display
    location.reload();
}
