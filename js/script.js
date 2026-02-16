// Sample inspection items
const sampleItems = [
    { id: 1, name: "Wall Plate Alignment", description: "Check that wall plates are properly aligned" },
    { id: 2, name: "Stud Spacing", description: "Verify studs are spaced correctly (16\" or 24\" OC)" },
    { id: 3, name: "Top Plate Overlap", description: "Ensure top plates overlap at corners and T-joints" },
    { id: 4, name: "Bracing Installation", description: "Check that bracing is properly installed" },
    { id: 5, name: "Rough Opening Dimensions", description: "Verify door/window openings are correct size" },
    { id: 6, name: "Header Installation", description: "Check headers are properly sized and installed" },
    { id: 7, name: "Sill Sealing", description: "Ensure sill plates are properly sealed" },
    { id: 8, name: "Lateral Restraint", description: "Verify lateral restraint is properly installed" }
];

// DOM elements
const itemsContainer = document.getElementById('items-container');
const deficienciesContainer = document.getElementById('deficiencies-container');
const viewDeficienciesBtn = document.getElementById('view-deficiencies-btn');
const backToInspectionBtn = document.getElementById('back-to-inspection-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the main inspection page
    if (itemsContainer) {
        loadInspectionPage();
    } 
    // Check if we're on the deficiencies page
    else if (deficienciesContainer) {
        loadDeficienciesPage();
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
});

// Load the inspection page
function loadInspectionPage() {
    // Clear the container
    itemsContainer.innerHTML = '';

    // Get saved results from localStorage
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();

    // Create and display items
    sampleItems.forEach(item => {
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
            </div>
        `;
        itemElement.setAttribute('data-id', item.id);

        itemsContainer.appendChild(itemElement);
        
        // If the item is marked as failed and has stored descriptions, show them
        if (savedStatus === 'fail' && storedDescriptions[item.id] && storedDescriptions[item.id].length > 0) {
            // Create the deficiency display section
            const deficiencyDisplay = document.createElement('div');
            deficiencyDisplay.id = `deficiency-display-${item.id}`;
            deficiencyDisplay.className = 'deficiency-display';
            
            // Add each stored description
            storedDescriptions[item.id].forEach(desc => {
                const descParagraph = document.createElement('p');
                descParagraph.textContent = desc;
                deficiencyDisplay.appendChild(descParagraph);
            });
            
            itemElement.appendChild(deficiencyDisplay);
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
    const failedItems = sampleItems.filter(item => savedResults[item.id] === 'fail');

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
            descriptionHTML += '<div class="additional-descriptions">';
            descriptions.forEach(desc => {
                descriptionHTML += `<div class="additional-description"><p>${desc}</p></div>`;
            });
            descriptionHTML += '</div>';
        }

        itemElement.innerHTML = `
            <div class="deficiency-header">
                <div class="deficiency-name">${item.name}</div>
                <span class="status-badge status-fail">FAILED</span>
            </div>
            ${descriptionHTML}
        `;

        deficienciesContainer.appendChild(itemElement);
    });
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
    
    deficiencySection.innerHTML = `
        <div class="deficiency-input-container">
            <label for="deficiency-desc-input-${itemId}">Deficiency Description:</label>
            <textarea id="deficiency-desc-input-${itemId}" placeholder="Describe the deficiency..."></textarea>
            <button class="btn-ok" data-id="${itemId}">OK</button>
        </div>
    `;
    
    itemElement.appendChild(deficiencySection);
    
    // Add event listener to the OK button
    const okButton = deficiencySection.querySelector('.btn-ok');
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
                displayDiv.id = `deficiency-display-${itemId}`;
                displayDiv.className = 'deficiency-display';
                itemEl.appendChild(displayDiv);
            }
            
            // Add the description to the display
            const descParagraph = document.createElement('p');
            descParagraph.textContent = description;
            displayDiv.appendChild(descParagraph);
            
            // Clear the input field
            descInput.value = '';
            
            // Hide the input section
            deficiencySection.style.display = 'none';
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
    
    // Get failed items
    const savedResults = getSavedResults();
    const storedDescriptions = getStoredDeficiencyDescriptions();
    const failedItems = sampleItems.filter(item => savedResults[item.id] === 'fail');
    
    // Add deficiencies list
    let yPos = 90;
    doc.setFontSize(12);
    doc.text('DEFICIENCIES FOUND:', 20, yPos);
    yPos += 10;
    
    if (failedItems.length > 0) {
        failedItems.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name}`, 20, yPos);
            yPos += 8;
            
            // Add description with wrapping if needed
            const descriptionText = doc.splitTextToSize(`Description: ${item.description}`, 170);
            doc.text(descriptionText, 25, yPos);
            
            // Calculate how many lines the description takes
            const lines = Array.isArray(descriptionText) ? descriptionText.length : 1;
            yPos += lines * 8 + 5;
            
            // Add status
            doc.text('Status: FAILED', 25, yPos);
            yPos += 8;
            
            // Add the stored deficiency descriptions if they exist
            if (storedDescriptions[item.id] && storedDescriptions[item.id].length > 0) {
                // Add a header for the deficiency descriptions
                doc.setFontSize(10); // Ensure readable font size
                doc.text('Additional Deficiency Notes:', 25, yPos);
                yPos += 8;
                
                storedDescriptions[item.id].forEach(desc => {
                    const deficiencyText = doc.splitTextToSize(desc, 165); // Slightly narrower for indentation
                    doc.text(deficiencyText, 30, yPos);
                    
                    const deficiencyLines = Array.isArray(deficiencyText) ? deficiencyText.length : 1;
                    yPos += deficiencyLines * 8 + 5;
                    
                    // Check if we're approaching the bottom of the page
                    if (yPos > 250) {
                        doc.addPage(); // Add a new page
                        yPos = 20; // Reset Y position
                        // Add a continuation note if needed
                        doc.text('(Continued from previous page)', 20, yPos);
                        yPos += 10;
                    }
                });
                
                // Increase font size back to default after adding notes
                doc.setFontSize(12);
            }
            
            // Add some space between items
            if (yPos > 250) { // Check if we're near the bottom of the page
                doc.addPage(); // Add a new page
                yPos = 20; // Reset Y position
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

// Update button states after selection
function updateButtonStates(itemId, status) {
    const passBtn = document.querySelector(`.btn-pass[data-id="${itemId}"]`);
    const failBtn = document.querySelector(`.btn-fail[data-id="${itemId}"]`);

    if (status === 'pass') {
        passBtn.classList.add('active');
        failBtn.classList.remove('active');
    } else {
        passBtn.classList.remove('active');
        failBtn.classList.add('active');
    }
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
});

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
    
    // Get failed items
    const savedResults = getSavedResults();
    const failedItems = sampleItems.filter(item => savedResults[item.id] === 'fail');
    
    // Add deficiencies list
    let yPos = 90;
    doc.setFontSize(12);
    doc.text('DEFICIENCIES FOUND:', 20, yPos);
    yPos += 10;
    
    if (failedItems.length > 0) {
        failedItems.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name}`, 20, yPos);
            yPos += 8;
            
            // Add description with wrapping if needed
            const descriptionText = doc.splitTextToSize(`Description: ${item.description}`, 170);
            doc.text(descriptionText, 25, yPos);
            
            // Calculate how many lines the description takes
            const lines = Array.isArray(descriptionText) ? descriptionText.length : 1;
            yPos += lines * 8 + 5;
            
            // Add status
            doc.text('Status: FAILED', 25, yPos);
            yPos += 10;
            
            // Add some space between items
            if (yPos > 250) { // Check if we're near the bottom of the page
                doc.addPage(); // Add a new page
                yPos = 20; // Reset Y position
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