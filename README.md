# Legal Document Generator

A comprehensive, free tool for generating professionally structured legal documents tailored to your business type and jurisdiction. No account required, no fees, runs entirely in the browser.

---

## Document Types

### Terms of Service
Generate business specific Terms of Service with industry-relevant clauses, jurisdiction aware provisions, and built in compliance modules. Supports 17 business types across 8 jurisdictions.

### Non-Disclosure Agreement (NDA)
Generate mutual or one way NDAs with clearly defined confidentiality obligations, purpose scope, duration, exception clauses, and signature blocks.

### Freelance Contract
Generate project based service agreements covering scope of work, payment schedule, IP ownership, revision rounds, confidentiality, and termination, tailored to the chosen jurisdiction.

### Employment Contract
Generate comprehensive employment agreements covering job title, employment type, compensation, working hours, annual leave, probationary periods, confidentiality, IP assignment, non-compete clauses, and termination notice.

### Consulting Agreement
Generate consulting agreements covering scope of services, deliverables, fee structure, payment terms, IP ownership, confidentiality, exclusivity, limitation of liability, and termination.

---

## Key Features

### Jurisdiction Support
All document types can be tailored to:
- United States
- European Union
- United Kingdom
- Canada
- Australia
- Brazil
- South Africa
- Generic International

### Terms of Service - Business Templates
Specialised templates for 17+ business types including:
- E-commerce, SaaS, Content Creators, Marketplaces, Membership Sites
- Educational Platforms, Mobile Applications, Consulting Services
- Non-Profits, Healthcare, FinTech, Affiliate Marketing, Dropshipping
- Community Forums, Blogs, Food Service, Discord Bots

### Regulatory Compliance Modules (Terms of Service)
- **GDPR** - General Data Protection Regulation (EU)
- **CCPA** - California Consumer Privacy Act (US)
- **LGPD** - Lei Geral de Proteção de Dados (Brazil)
- **PIPEDA** - Personal Information Protection and Electronic Documents Act (Canada)
- **POPIA** - Protection of Personal Information Act (South Africa)
- **APPs** - Australian Privacy Principles
- **COPPA** - Children's Online Privacy Protection Act (US)
- **CASL** - Canada's Anti Spam Legislation

### Specialised Clause Library (Terms of Service)
Optional clauses for: Age Verification, International Shipping, Virtual Events, API Usage, User Generated Content, Data Processing Agreement, Subscription Management, Accessibility Compliance, Dispute Resolution, Intellectual Property, and more.

---

## Multiple Ways to Use

### Web Interface
Open `index.html` in any modern browser, no server or build step required. Or visit the hosted version at https://tempest-solutions-company.github.io/terms-of-service-generator.

### Command Line Interface

```bash
npm install -g terms-of-service-generator
tos-generator
```

### JavaScript Library

```javascript
const tosGenerator = require('terms-of-service-generator');

const document = tosGenerator.generate({
  businessType:      'saas',
  businessName:      'Acme Inc.',
  jurisdiction:      'us',
  complianceModules: ['ccpa', 'gdpr'],
  specialClauses:    ['api_usage', 'subscription_management']
});
```

---

## Project Structure

```
├── index.html                  # Main UI
├── css/
│   └── style.css               # All styles including new tab UI
├── js/
│   ├── generator.js            # TOSGenerator class (Terms of Service)
│   ├── doc-generator.js        # DocumentGenerator class (NDA, Freelance, Employment, Consulting)
│   └── app.js                  # UI logic, tab switching, form handling
├── data/
│   ├── templates.json          # Business type TOS templates
│   ├── jurisdictions.json      # Jurisdiction specific clauses
│   ├── compliance_modules.json # Regulatory compliance modules
│   ├── clause_library.json     # Specialised TOS clauses
│   └── documents.json          # Templates + field definitions for new doc types
└── cli/
    └── index.js                # CLI entry point
```

---

## Local Development

```bash
git clone https://github.com/tempest-solutions-company/terms-of-service-generator.git
cd terms-of-service-generator
npm install

# Open index.html directly in a browser, or serve with any static server:
npx serve .
```

---

## Customising Templates

All document templates live in the `data/` directory:

| File | Purpose |
|------|---------|
| `templates.json` | TOS templates by business type |
| `jurisdictions.json` | Jurisdiction specific clause text |
| `compliance_modules.json` | Regulatory compliance sections |
| `clause_library.json` | Optional specialised TOS clauses |
| `documents.json` | NDA, Freelance, Employment & Consulting templates and field definitions |

---

## Contributing

Contributions are welcome! Ideas include:
- Additional document types (e.g., Privacy Policy, SLA, Partnership Agreement)
- More jurisdictions
- Improved clause language
- UI/UX improvements

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Disclaimer

This tool is for informational purposes only and is not a substitute for legal advice. Generated documents should be reviewed by a qualified legal professional before use. We make no warranties about the completeness, reliability, or accuracy of the generated documents.

## License

MIT
