/**
 * Terms of Service Generator - Web Interface
 */

// Fetch all the necessary data
let templates = {};
let complianceModules = {};
let clauseLibrary = {};
let jurisdictions = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Fetch data files
  Promise.all([
    fetch('../data/templates.json').then(response => response.json()),
    fetch('../data/compliance_modules.json').then(response => response.json()),
    fetch('../data/clause_library.json').then(response => response.json()),
    fetch('../data/jurisdictions.json').then(response => response.json())
  ]).then(([templatesData, complianceData, clauseData, jurisdictionsData]) => {
    templates = templatesData;
    complianceModules = complianceData;
    clauseLibrary = clauseData;
    jurisdictions = jurisdictionsData;
    
    // Initialize the UI
    initializeUI();
  }).catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('error-message').textContent = 'Failed to load necessary data. Please refresh the page.';
  });
  
  // Set up event handlers
  document.getElementById('generate-button').addEventListener('click', generateTerms);
});

/**
 * Initialize the UI with dynamic content
 */
function initializeUI() {
  // Populate business type dropdown
  const businessTypeSelect = document.getElementById('business-type');
  Object.keys(templates).forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    businessTypeSelect.appendChild(option);
  });
  
  // Populate jurisdiction dropdown
  const jurisdictionSelect = document.getElementById('jurisdiction');
  Object.keys(jurisdictions).forEach(code => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = jurisdictions[code].name;
    jurisdictionSelect.appendChild(option);
  });
  
  // Populate compliance modules checkboxes
  const complianceContainer = document.getElementById('compliance-modules');
  Object.keys(complianceModules).forEach(code => {
    const module = complianceModules[code];
    
    const div = document.createElement('div');
    div.className = 'form-check';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.id = `compliance-${code}`;
    input.value = code;
    input.name = 'compliance';
    
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `compliance-${code}`;
    label.textContent = `${module.name} (${module.region})`;
    
    div.appendChild(input);
    div.appendChild(label);
    complianceContainer.appendChild(div);
  });
  
  // Set up business type change event to update applicable clauses
  businessTypeSelect.addEventListener('change', updateApplicableClauses);
  
  // Initialize applicable clauses for default business type
  updateApplicableClauses();
}

/**
 * Update the specialized clauses based on the selected business type
 */
function updateApplicableClauses() {
  const businessType = document.getElementById('business-type').value;
  const clausesContainer = document.getElementById('specialized-clauses');
  
  // Clear existing clauses
  clausesContainer.innerHTML = '';
  
  // Add clauses with recommendation indicators
  Object.keys(clauseLibrary).forEach(code => {
    const clause = clauseLibrary[code];
    const isApplicable = clause.applicable_to && clause.applicable_to.includes(businessType);
    
    const div = document.createElement('div');
    div.className = 'form-check';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.id = `clause-${code}`;
    input.value = code;
    input.name = 'clause';
    
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `clause-${code}`;
    
    // Add recommendation indicator
    if (isApplicable) {
      label.innerHTML = `<span class="badge bg-success">Recommended</span> ${clause.name}`;
    } else {
      label.innerHTML = `${clause.name}`;
    }
    
    // Add tooltip with description
    input.setAttribute('data-bs-toggle', 'tooltip');
    input.setAttribute('data-bs-placement', 'top');
    input.setAttribute('title', clause.description);
    
    div.appendChild(input);
    div.appendChild(label);
    clausesContainer.appendChild(div);
  });
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Generate the terms of service document
 */
function generateTerms(event) {
  event.preventDefault();
  
  // Get form values
  const businessType = document.getElementById('business-type').value;
  const businessName = document.getElementById('business-name').value;
  const jurisdiction = document.getElementById('jurisdiction').value;
  
  // Get selected compliance modules
  const selectedModules = Array.from(document.querySelectorAll('input[name="compliance"]:checked'))
    .map(input => input.value);
  
  // Get selected specialized clauses
  const selectedClauses = Array.from(document.querySelectorAll('input[name="clause"]:checked'))
    .map(input => input.value);
  
  // Validate inputs
  if (!businessName.trim()) {
    alert('Please enter your business name');
    return;
  }
  
  // Show loading indicator
  document.getElementById('loading-indicator').classList.remove('d-none');
  document.getElementById('generate-button').disabled = true;
  
  // Simulate API call - in a real app, this would call your backend service
  setTimeout(() => {
    try {
      // Get base template
      let termsContent = templates[businessType];
      
      // Apply jurisdiction clauses
      if (jurisdictions[jurisdiction]) {
        if (jurisdictions[jurisdiction].governing_law) {
          termsContent = termsContent.replace('{{GOVERNING_LAW}}', jurisdictions[jurisdiction].governing_law);
        }
        
        if (jurisdictions[jurisdiction].dispute_resolution) {
          termsContent = termsContent.replace('{{DISPUTE_RESOLUTION}}', jurisdictions[jurisdiction].dispute_resolution);
        }
        
        if (jurisdictions[jurisdiction].liability_clause) {
          termsContent = termsContent.replace('{{LIABILITY_CLAUSE}}', jurisdictions[jurisdiction].liability_clause);
        }
      }
      
      // Add compliance modules if selected
      if (selectedModules.length > 0) {
        let complianceContent = '\n\n## Regulatory Compliance\n';
        
        for (const moduleCode of selectedModules) {
          const module = complianceModules[moduleCode];
          if (!module) continue;
          
          complianceContent += `\n### ${module.name} Compliance\n`;
          complianceContent += `The following provisions apply to users protected by ${module.region} regulations:\n\n`;
          
          // Add all required clauses from this compliance module
          for (const sectionCode of module.required_sections) {
            if (module.clauses[sectionCode]) {
              complianceContent += '\n' + module.clauses[sectionCode] + '\n';
            }
          }
        }
        
        // Insert compliance content before Governing Law
        if (termsContent.includes('## Governing Law')) {
          termsContent = termsContent.replace('## Governing Law', complianceContent + '\n\n## Governing Law');
        } else {
          // If no Governing Law section, add at the end before the last updated date
          termsContent = termsContent.replace('Last Updated:', complianceContent + '\n\nLast Updated:');
        }
      }
      
      // Add specialized clauses if selected
      if (selectedClauses.length > 0) {
        let specialClausesContent = '\n\n## Additional Terms\n';
        
        for (const clauseCode of selectedClauses) {
          const clause = clauseLibrary[clauseCode];
          if (!clause) continue;
          
          specialClausesContent += '\n' + clause.clause + '\n';
        }
        
        // Insert specialized clauses before Governing Law or after compliance modules
        if (termsContent.includes('## Governing Law')) {
          termsContent = termsContent.replace('## Governing Law', specialClausesContent + '\n\n## Governing Law');
        } else {
          // If no Governing Law section, add at the end before the last updated date
          termsContent = termsContent.replace('Last Updated:', specialClausesContent + '\n\nLast Updated:');
        }
      }
      
      // Replace variables
      termsContent = termsContent.replace(/{{BUSINESS_NAME}}/g, businessName);
      termsContent = termsContent.replace(/{{LAST_UPDATED_DATE}}/g, new Date().toISOString().split('T')[0]);
      
      // Display the result
      document.getElementById('result-container').classList.remove('d-none');
      document.getElementById('terms-preview').textContent = termsContent;
      
      // Enable download button
      const downloadBtn = document.getElementById('download-button');
      downloadBtn.onclick = () => {
        const blob = new Blob([termsContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_terms_of_service.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      
      // Scroll to results
      document.getElementById('result-container').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error generating terms:', error);
      alert('An error occurred while generating the terms of service. Please try again.');
    } finally {
      // Hide loading indicator
      document.getElementById('loading-indicator').classList.add('d-none');
      document.getElementById('generate-button').disabled = false;
    }
  }, 1000); // Simulate processing time
}
