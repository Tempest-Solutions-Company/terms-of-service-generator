/**
 * Terms of Service Generator
 * Core utility that integrates templates, compliance modules, and specialized clauses
 */

const fs = require('fs');
const path = require('path');

// Load data files
const templates = require('../../data/templates.json');
const complianceModules = require('../../data/compliance_modules.json');
const clauseLibrary = require('../../data/clause_library.json');
const jurisdictions = require('../../data/jurisdictions.json');

/**
 * Generate terms of service document
 * @param {Object} options - Configuration options
 * @param {string} options.businessType - Type of business (e.g., 'ecommerce', 'saas')
 * @param {string} options.businessName - Name of the business
 * @param {string} options.jurisdiction - Jurisdiction code (e.g., 'us', 'eu', 'uk')
 * @param {string[]} options.complianceModules - Array of compliance module codes to include
 * @param {string[]} options.specialClauses - Array of specialized clause codes to include
 * @param {Object} options.customVariables - Custom variables to replace in the templates
 * @returns {string} Generated terms of service document
 */
function generateTerms(options) {
  // Validate options
  if (!options.businessType || !templates[options.businessType]) {
    throw new Error(`Invalid business type: ${options.businessType}`);
  }
  
  if (!options.businessName) {
    throw new Error('Business name is required');
  }
  
  // Get base template for the specified business type
  let termsContent = templates[options.businessType];
  
  // Apply jurisdiction-specific clauses if specified
  if (options.jurisdiction && jurisdictions[options.jurisdiction]) {
    termsContent = applyJurisdictionClauses(termsContent, options.jurisdiction);
  }
  
  // Add compliance modules if specified
  if (options.complianceModules && Array.isArray(options.complianceModules)) {
    termsContent = applyComplianceModules(termsContent, options.complianceModules);
  }
  
  // Add specialized clauses if specified
  if (options.specialClauses && Array.isArray(options.specialClauses)) {
    termsContent = applySpecializedClauses(termsContent, options.specialClauses, options.businessType);
  }
  
  // Replace variables in the template
  termsContent = replaceVariables(termsContent, {
    BUSINESS_NAME: options.businessName,
    LAST_UPDATED_DATE: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    ...options.customVariables
  });
  
  return termsContent;
}

/**
 * Apply jurisdiction-specific clauses to the terms
 * @param {string} termsContent - Original terms content
 * @param {string} jurisdictionCode - Jurisdiction code
 * @returns {string} Terms with jurisdiction-specific clauses
 */
function applyJurisdictionClauses(termsContent, jurisdictionCode) {
  const jurisdiction = jurisdictions[jurisdictionCode];
  
  // Replace placeholder clauses with jurisdiction-specific ones
  if (jurisdiction.governing_law) {
    termsContent = termsContent.replace('{{GOVERNING_LAW}}', jurisdiction.governing_law);
  }
  
  if (jurisdiction.dispute_resolution) {
    termsContent = termsContent.replace('{{DISPUTE_RESOLUTION}}', jurisdiction.dispute_resolution);
  }
  
  if (jurisdiction.liability_clause) {
    termsContent = termsContent.replace('{{LIABILITY_CLAUSE}}', jurisdiction.liability_clause);
  }
  
  return termsContent;
}

/**
 * Apply compliance modules to the terms
 * @param {string} termsContent - Original terms content
 * @param {string[]} moduleCodes - Array of compliance module codes
 * @returns {string} Terms with compliance modules added
 */
function applyComplianceModules(termsContent, moduleCodes) {
  let complianceContent = '\n\n## Regulatory Compliance\n';
  let addedModules = 0;
  
  for (const moduleCode of moduleCodes) {
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
    
    addedModules++;
  }
  
  // Only add the section if we actually have compliance modules to add
  if (addedModules > 0) {
    // Find a good place to insert the compliance content - before Governing Law is usually good
    if (termsContent.includes('## Governing Law')) {
      return termsContent.replace('## Governing Law', complianceContent + '\n\n## Governing Law');
    } else {
      // If no Governing Law section, add at the end before the last updated date
      return termsContent.replace('Last Updated:', complianceContent + '\n\nLast Updated:');
    }
  }
  
  return termsContent;
}

/**
 * Apply specialized clauses to the terms
 * @param {string} termsContent - Original terms content
 * @param {string[]} clauseCodes - Array of specialized clause codes
 * @param {string} businessType - The business type to check compatibility
 * @returns {string} Terms with specialized clauses added
 */
function applySpecializedClauses(termsContent, clauseCodes, businessType) {
  let specialClausesContent = '\n\n## Additional Terms\n';
  let addedClauses = 0;
  
  for (const clauseCode of clauseCodes) {
    const clause = clauseLibrary[clauseCode];
    if (!clause) continue;
    
    // Check if this clause is applicable to the business type
    if (clause.applicable_to && !clause.applicable_to.includes(businessType)) {
      console.warn(`Clause "${clauseCode}" is not recommended for business type "${businessType}", but adding anyway.`);
    }
    
    specialClausesContent += '\n' + clause.clause + '\n';
    addedClauses++;
  }
  
  // Only add the section if we actually have specialized clauses to add
  if (addedClauses > 0) {
    // Find a good place to insert the specialized clauses - before Governing Law is usually good
    if (termsContent.includes('## Governing Law')) {
      return termsContent.replace('## Governing Law', specialClausesContent + '\n\n## Governing Law');
    } else {
      // If no Governing Law section, add at the end before the last updated date
      return termsContent.replace('Last Updated:', specialClausesContent + '\n\nLast Updated:');
    }
  }
  
  return termsContent;
}

/**
 * Replace variables in the template
 * @param {string} content - Content with variables
 * @param {Object} variables - Object with variable names and values
 * @returns {string} Content with variables replaced
 */
function replaceVariables(content, variables) {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

module.exports = { generateTerms };
