document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('tos-form');
  const result = document.getElementById('result');
  const preview = document.getElementById('preview');
  const downloadHtmlBtn = document.getElementById('download-html');
  const downloadMdBtn = document.getElementById('download-md');
  const copyBtn = document.getElementById('copy');
  
  // Initialize the generator
  const generator = new TOSGenerator();
  await generator.initialize();
  
  let currentContent = '';
  
  // Load all necessary data
  let complianceModules = {};
  let clauseLibrary = {};
  
  try {
    const [complianceResponse, clauseResponse] = await Promise.all([
      fetch('./data/compliance_modules.json'),
      fetch('./data/clause_library.json')
    ]);
    
    complianceModules = await complianceResponse.json();
    clauseLibrary = await clauseResponse.json();
    
    // Initialize UI with loaded data
    populateComplianceModules(complianceModules);
    
  } catch(error) {
    console.error('Error loading data:', error);
  }
  
  // Populate compliance modules in the UI
  function populateComplianceModules(modules) {
    const container = document.getElementById('compliance-modules');
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing content
    
    Object.keys(modules).forEach(code => {
      const module = modules[code];
      
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `compliance-${code}`;
      input.value = code;
      input.name = 'compliance';
      
      const label = document.createElement('label');
      label.htmlFor = `compliance-${code}`;
      label.textContent = `${module.name} (${module.region})`;
      
      // Add tooltip with description
      div.setAttribute('title', module.description);
      
      div.appendChild(input);
      div.appendChild(label);
      container.appendChild(div);
    });
    
    console.log('Populated compliance modules:', Object.keys(modules).length);
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const businessName = document.getElementById('business-name').value;
    const businessType = document.getElementById('business-type').value;
    const jurisdiction = document.getElementById('jurisdiction').value;
    
    // Get all selected specialized clauses
    const selectedClauses = Array.from(
      document.querySelectorAll('#specialized-clauses input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);
    
    // Get all selected compliance modules
    const selectedModules = Array.from(
      document.querySelectorAll('#compliance-modules input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);
    
    console.log('Selected compliance modules:', selectedModules);
    
    try {
      // Show loading indicator
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) loadingIndicator.classList.remove('d-none');
      
      // Generate the TOS content with selected clauses and modules
      currentContent = await generator.generate(
        businessName, 
        businessType, 
        jurisdiction,
        {
          specialClauses: selectedClauses,
          complianceModules: selectedModules
        }
      );
      
      // Display the generated content
      preview.innerHTML = currentContent.split('\n').map(p => 
        p.trim() ? `<p>${p}</p>` : ''
      ).join('');
      
      // Show the result section
      result.classList.remove('hidden');
      
      // Scroll to result
      result.scrollIntoView({ behavior: 'smooth' });
      
      // Hide loading indicator
      if (loadingIndicator) loadingIndicator.classList.add('d-none');
    } catch (error) {
      console.error('Error generating TOS:', error);
      alert('Failed to generate Terms of Service. Please try again.');
      // Hide loading indicator on error too
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) loadingIndicator.classList.add('d-none');
    }
  });
  
  // Download as HTML
  downloadHtmlBtn.addEventListener('click', () => {
    const htmlContent = generator.generateHTML(currentContent);
    downloadFile('terms-of-service.html', htmlContent, 'text/html');
  });
  
  // Download as Markdown
  downloadMdBtn.addEventListener('click', () => {
    const mdContent = generator.generateMarkdown(currentContent);
    downloadFile('terms-of-service.md', mdContent, 'text/markdown');
  });
  
  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentContent)
      .then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  });
  
  // Helper function to download files
  function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Update the specialized clauses based on the selected business type
   */
  function updateApplicableClauses() {
    const businessType = document.getElementById('business-type').value;
    const clausesContainer = document.getElementById('specialized-clauses');
    
    // Clear existing clauses
    clausesContainer.innerHTML = '';
    
    if (!businessType) {
      // If no business type is selected yet, show a message
      clausesContainer.innerHTML = '<p>Please select a business type to see recommended clauses</p>';
      return;
    }
    
    // Add clauses with recommendation indicators
    Object.keys(clauseLibrary).forEach(code => {
      const clause = clauseLibrary[code];
      const isApplicable = clause.applicable_to && clause.applicable_to.includes(businessType);
      
      const div = document.createElement('div');
      div.className = isApplicable ? 'checkbox-item recommended' : 'checkbox-item';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `clause-${code}`;
      input.value = code;
      input.name = 'clause';
      
      // If applicable, check the checkbox by default
      if (isApplicable) {
        input.checked = true;
      }
      
      const label = document.createElement('label');
      label.htmlFor = `clause-${code}`;
      label.textContent = clause.name;
      
      // Add tooltip with description
      div.setAttribute('title', clause.description);
      
      div.appendChild(input);
      div.appendChild(label);
      clausesContainer.appendChild(div);
    });
  }

  // Call this function when the business type changes
  document.getElementById('business-type').addEventListener('change', updateApplicableClauses);

  // Initialize clauses when the page loads
  updateApplicableClauses();
});
