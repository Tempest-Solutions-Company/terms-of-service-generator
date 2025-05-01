/**
 * Terms of Service Generator
 * Core logic for generating TOS documents based on business type and jurisdiction
 */

class TOSGenerator {
  constructor() {
    this.templates = {};
    this.jurisdictions = {};
    this.complianceModules = {};
    this.clauseLibrary = {};
    this.initialized = false;
  }

  async initialize() {
    try {
      // Load all required data
      const [templatesResponse, jurisdictionsResponse, complianceResponse, clauseResponse] = await Promise.all([
        fetch('./data/templates.json'),
        fetch('./data/jurisdictions.json'),
        fetch('./data/compliance_modules.json'),
        fetch('./data/clause_library.json')
      ]);

      this.templates = await templatesResponse.json();
      this.jurisdictions = await jurisdictionsResponse.json();
      this.complianceModules = await complianceResponse.json();
      this.clauseLibrary = await clauseResponse.json();
      this.initialized = true;
      
      console.log('TOS Generator initialized with compliance modules:', Object.keys(this.complianceModules));
      return true;
    } catch (error) {
      console.error('Failed to initialize TOS Generator:', error);
      return false;
    }
  }

  async generate(businessName, businessType, jurisdiction, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Generating terms with options:', options);

    // Get the base template for the business type
    const baseTemplate = this.templates[businessType] || this.templates.generic;
    
    // Get jurisdiction-specific clauses
    const jurisdictionClauses = this.jurisdictions[jurisdiction] || this.jurisdictions.generic;
    
    // Replace placeholders
    let tosDocument = baseTemplate.replace(/\{\{BUSINESS_NAME\}\}/g, businessName);
    tosDocument = tosDocument.replace(/\{\{LAST_UPDATED_DATE\}\}/g, new Date().toISOString().split('T')[0]);
    
    // Add jurisdiction-specific clauses
    Object.keys(jurisdictionClauses).forEach(clauseKey => {
      tosDocument = tosDocument.replace(
        new RegExp(`\\{\\{${clauseKey}\\}\\}`, 'g'),
        jurisdictionClauses[clauseKey]
      );
    });
    
    // Add compliance modules if selected
    if (options.complianceModules && options.complianceModules.length > 0) {
      console.log('Adding compliance modules:', options.complianceModules);
      
      let complianceContent = '\n\n## Regulatory Compliance\n';
      let modulesAdded = 0;
      
      for (const moduleCode of options.complianceModules) {
        const module = this.complianceModules[moduleCode];
        if (!module) {
          console.warn(`Compliance module not found: ${moduleCode}`);
          continue;
        }
        
        console.log(`Processing compliance module: ${module.name}`);
        
        complianceContent += `\n### ${module.name} Compliance\n`;
        complianceContent += `The following provisions apply to users protected by ${module.region} regulations:\n\n`;
        
        // Add all required clauses from this compliance module
        for (const sectionCode of module.required_sections) {
          if (module.clauses && module.clauses[sectionCode]) {
            complianceContent += '\n' + module.clauses[sectionCode] + '\n';
          }
        }
        
        modulesAdded++;
      }
      
      if (modulesAdded > 0) {
        // Insert compliance content in a good location
        if (tosDocument.includes('## Governing Law')) {
          tosDocument = tosDocument.replace('## Governing Law', complianceContent + '\n\n## Governing Law');
        } else if (tosDocument.includes('## Contact Information')) {
          tosDocument = tosDocument.replace('## Contact Information', complianceContent + '\n\n## Contact Information');
        } else {
          // Append to the end if no suitable insertion point
          tosDocument += complianceContent;
        }
        
        console.log('Added compliance modules to document');
      }
    }
    
    // Add specialized clauses
    if (options.specialClauses && options.specialClauses.length > 0) {
      console.log('Adding specialized clauses:', options.specialClauses);
      
      let specialClausesContent = '\n\n## Additional Terms\n';
      
      for (const clauseCode of options.specialClauses) {
        const clause = this.clauseLibrary[clauseCode];
        if (clause) {
          specialClausesContent += '\n' + clause.clause + '\n';
        }
      }
      
      // Insert specialized clauses in a good location
      if (tosDocument.includes('## Governing Law')) {
        tosDocument = tosDocument.replace('## Governing Law', specialClausesContent + '\n\n## Governing Law');
      } else if (tosDocument.includes('## Contact Information')) {
        tosDocument = tosDocument.replace('## Contact Information', specialClausesContent + '\n\n## Contact Information');
      } else {
        // Append to the end if no suitable insertion point
        tosDocument += specialClausesContent;
      }
    }
    
    // Format the document
    return this.formatDocument(tosDocument);
  }
  
  formatDocument(doc) {
    // Remove any remaining placeholders
    doc = doc.replace(/\{\{[A-Z_]+\}\}/g, '');
    
    // Clean up extra whitespace and newlines
    doc = doc.replace(/\n{3,}/g, '\n\n');
    
    return doc;
  }
  
  generateHTML(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        h1, h2 { color: #333; }
        .last-updated { color: #777; font-style: italic; }
    </style>
</head>
<body>
    <h1>Terms of Service</h1>
    <p class="last-updated">Last Updated: ${new Date().toLocaleDateString()}</p>
    ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('\n')}
</body>
</html>`;
  }
  
  generateMarkdown(content) {
    return `# Terms of Service

*Last Updated: ${new Date().toLocaleDateString()}*

${content}`;
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TOSGenerator;
} else {
  window.TOSGenerator = TOSGenerator;
}
