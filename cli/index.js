#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { generateTerms } = require('../src/utils/terms-generator');

// Load data files
const templates = require('../data/templates.json');
const complianceModules = require('../data/compliance_modules.json');
const clauseLibrary = require('../data/clause_library.json');
const jurisdictions = require('../data/jurisdictions.json');

// Create interface for CLI input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function
async function main() {
  console.log('========================================');
  console.log('  Terms of Service Generator');
  console.log('========================================');
  
  // Get business type
  const businessTypes = Object.keys(templates);
  console.log('\nAvailable business types:');
  businessTypes.forEach((type, index) => {
    console.log(`${index + 1}. ${type}`);
  });
  
  const businessTypeIndex = await askQuestion('Select business type (number): ');
  const businessType = businessTypes[parseInt(businessTypeIndex) - 1];
  
  // Get business name
  const businessName = await askQuestion('Enter your business name: ');
  
  // Get jurisdiction
  const jurisdictionCodes = Object.keys(jurisdictions);
  console.log('\nAvailable jurisdictions:');
  jurisdictionCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${code} - ${jurisdictions[code].name}`);
  });
  
  const jurisdictionIndex = await askQuestion('Select jurisdiction (number): ');
  const jurisdiction = jurisdictionCodes[parseInt(jurisdictionIndex) - 1];
  
  // Select compliance modules
  const moduleCodes = Object.keys(complianceModules);
  console.log('\nAvailable compliance modules:');
  moduleCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${complianceModules[code].name} (${complianceModules[code].region})`);
  });
  
  const moduleIndices = await askQuestion('Select compliance modules (comma-separated numbers, or 0 for none): ');
  let selectedModules = [];
  
  if (moduleIndices !== '0') {
    selectedModules = moduleIndices.split(',')
      .map(idx => parseInt(idx.trim()) - 1)
      .filter(idx => idx >= 0 && idx < moduleCodes.length)
      .map(idx => moduleCodes[idx]);
  }
  
  // Select specialized clauses
  const clauseCodes = Object.keys(clauseLibrary);
  console.log('\nAvailable specialized clauses:');
  clauseCodes.forEach((code, index) => {
    const isApplicable = clauseLibrary[code].applicable_to && 
                         clauseLibrary[code].applicable_to.includes(businessType);
    const applicabilityFlag = isApplicable ? '✓' : '!';
    console.log(`${index + 1}. ${applicabilityFlag} ${clauseLibrary[code].name} (${clauseLibrary[code].category})`);
  });
  console.log('✓ = Recommended for your business type | ! = Not specifically recommended for your business type');
  
  const clauseIndices = await askQuestion('Select specialized clauses (comma-separated numbers, or 0 for none): ');
  let selectedClauses = [];
  
  if (clauseIndices !== '0') {
    selectedClauses = clauseIndices.split(',')
      .map(idx => parseInt(idx.trim()) - 1)
      .filter(idx => idx >= 0 && idx < clauseCodes.length)
      .map(idx => clauseCodes[idx]);
  }
  
  // Generate terms
  console.log('\nGenerating Terms of Service...');
  
  try {
    const termsContent = generateTerms({
      businessType,
      businessName,
      jurisdiction,
      complianceModules: selectedModules,
      specialClauses: selectedClauses
    });
    
    // Output path
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const fileName = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_terms_of_service.md`;
    const outputPath = path.join(outputDir, fileName);
    
    fs.writeFileSync(outputPath, termsContent);
    
    console.log(`\nTerms of Service successfully generated!`);
    console.log(`Output file: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating Terms of Service: ${error.message}`);
  }
  
  rl.close();
}

// Helper function to ask questions
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Start the CLI application
main();
