/**
 * Legal Document Generator
 * Handles NDA, Freelance Contract, Employment Contract, Consulting Agreement,
 * SLA, EULA, Partnership Agreement, Influencer/Brand Deal, Sponsorship Agreement,
 * and Affiliate/Referral Agreement generation
 */

class DocumentGenerator {
  constructor() {
    this.documents = {};
    this.initialized = false;

    this.jurisdictionNames = {
      us:      'the State of [State], United States',
      eu:      'the European Union',
      uk:      'England and Wales, United Kingdom',
      ca:      'Ontario, Canada',
      au:      'New South Wales, Australia',
      br:      'the Federative Republic of Brazil',
      za:      'the Republic of South Africa',
      generic: 'the jurisdiction agreed upon by the parties'
    };
  }

  async initialize() {
    try {
      const response = await fetch('./data/documents.json');
      this.documents = await response.json();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to load document templates:', error);
      return false;
    }
  }

  /**
   * Main entry point — dispatches to the correct generator based on docType
   * @param {string} docType  - 'nda' | 'freelance' | 'employment' | 'consulting'
   * @param {Object} fields   - Key/value map of field IDs to user-entered values
   * @returns {string} Generated document text
   */
  generate(docType, fields) {
    if (!this.initialized) {
      throw new Error('DocumentGenerator not initialised. Call initialize() first.');
    }

    switch (docType) {
      case 'nda':         return this._generateNDA(fields);
      case 'freelance':   return this._generateFreelance(fields);
      case 'employment':  return this._generateEmployment(fields);
      case 'consulting':  return this._generateConsulting(fields);
      case 'sla':         return this._generateSLA(fields);
      case 'eula':        return this._generateEULA(fields);
      case 'partnership': return this._generatePartnership(fields);
      case 'influencer':  return this._generateInfluencer(fields);
      case 'sponsorship': return this._generateSponsorship(fields);
      case 'affiliate':   return this._generateAffiliate(fields);
      default:
        throw new Error(`Unknown document type: ${docType}`);
    }
  }

  // ─── NDA ─────────────────────────────────────────────────────────────────

  _generateNDA(fields) {
    const doc = this.documents.nda;
    const ndaType = fields.nda_type || 'mutual';
    let template = doc.templates[ndaType] || doc.templates.mutual;

    template = this._replace(template, {
      PARTY_A_NAME:   fields.party_a_name  || '[Party A]',
      PARTY_B_NAME:   fields.party_b_name  || '[Party B]',
      EFFECTIVE_DATE: this._formatDate(fields.effective_date),
      DURATION:       fields.duration      || '2 years',
      PURPOSE:        fields.purpose       || '[stated purpose]',
      GOVERNING_LAW:  this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Freelance Contract ───────────────────────────────────────────────────

  _generateFreelance(fields) {
    const doc = this.documents.freelance;
    let template = doc.template;

    const ipClause = (doc.ip_clauses && doc.ip_clauses[fields.ip_ownership])
      ? doc.ip_clauses[fields.ip_ownership]
      : doc.ip_clauses.client;

    const revisionRounds = fields.revision_rounds === 'unlimited'
      ? 'unlimited'
      : (fields.revision_rounds || '2');

    template = this._replace(template, {
      CLIENT_NAME:         fields.client_name     || '[Client Name]',
      FREELANCER_NAME:     fields.freelancer_name  || '[Contractor Name]',
      PROJECT_TITLE:       fields.project_title    || '[Project Title]',
      EFFECTIVE_DATE:      this._formatDate(fields.effective_date),
      PROJECT_DEADLINE:    this._formatDate(fields.project_deadline),
      SCOPE_OF_WORK:       fields.scope_of_work    || '[Scope of work to be described here]',
      TOTAL_FEE:           fields.total_fee         || '[Fee Amount]',
      PAYMENT_SCHEDULE:    fields.payment_schedule  || '50% deposit upfront, 50% on completion',
      IP_OWNERSHIP_CLAUSE: ipClause,
      REVISION_ROUNDS:     revisionRounds,
      NOTICE_PERIOD:       fields.notice_period     || '14',
      GOVERNING_LAW:       this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Employment Contract ──────────────────────────────────────────────────

  _generateEmployment(fields) {
    const doc = this.documents.employment;
    let template = doc.template;

    const probationClause = (fields.has_probation === 'yes' && fields.probation_period)
      ? `Probationary Period: The Employee's employment is subject to a probationary period of ${fields.probation_period}. During this period, either Party may terminate this Agreement with reduced notice of one week. The Employer will conduct a performance review before the end of the probationary period.`
      : '';

    const nonCompetePeriod = fields.non_compete_period || 'none';
    const nonCompeteClause = nonCompetePeriod === 'none'
      ? ''
      : `During employment and for ${nonCompetePeriod} following termination (for any reason), the Employee agrees not to directly engage in, own, manage, operate, consult for, or be employed by any business that competes directly with the Employer's core business activities in the same geographic area.\n\n`;

    template = this._replace(template, {
      EMPLOYER_NAME:    fields.employer_name   || '[Employer Name]',
      EMPLOYEE_NAME:    fields.employee_name   || '[Employee Name]',
      JOB_TITLE:        fields.job_title        || '[Job Title]',
      EMPLOYMENT_TYPE:  fields.employment_type  || 'Full-Time Permanent',
      START_DATE:       this._formatDate(fields.start_date),
      WORK_LOCATION:    fields.work_location    || '[Work Location]',
      COMPENSATION:     fields.compensation     || '[Salary/Wage]',
      PAY_FREQUENCY:    fields.pay_frequency    || 'monthly',
      WORKING_HOURS:    fields.working_hours    || '40',
      ANNUAL_LEAVE:     fields.annual_leave     || '20',
      PROBATION_CLAUSE: probationClause,
      NON_COMPETE_CLAUSE: nonCompeteClause,
      NON_COMPETE_PERIOD: nonCompetePeriod !== 'none' ? nonCompetePeriod : '',
      NOTICE_PERIOD:    fields.notice_period    || '1 month',
      GOVERNING_LAW:    this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Consulting Agreement ─────────────────────────────────────────────────

  _generateConsulting(fields) {
    const doc = this.documents.consulting;
    let template = doc.template;

    const ipClause = (doc.ip_clauses && doc.ip_clauses[fields.ip_ownership])
      ? doc.ip_clauses[fields.ip_ownership]
      : doc.ip_clauses.client;

    const exclusivityClause = (doc.exclusivity_clauses && doc.exclusivity_clauses[fields.is_exclusive])
      ? doc.exclusivity_clauses[fields.is_exclusive].replace(
          '{{SCOPE_SUMMARY}}',
          fields.scope_of_services ? fields.scope_of_services.split('\n')[0].slice(0, 80) : 'the agreed services'
        )
      : doc.exclusivity_clauses.no;

    const endDateClause = fields.end_date
      ? ` and continues until ${this._formatDate(fields.end_date)},`
      : ',';

    const deliverablesSection = fields.deliverables && fields.deliverables.trim()
      ? fields.deliverables
      : 'The Consultant will deliver work products as described in the Scope of Services above, in a format and manner agreed with the Client.';

    template = this._replace(template, {
      CLIENT_NAME:           fields.client_name          || '[Client Name]',
      CONSULTANT_NAME:       fields.consultant_name      || '[Consultant Name]',
      EFFECTIVE_DATE:        this._formatDate(fields.effective_date),
      START_DATE:            this._formatDate(fields.start_date),
      END_DATE_CLAUSE:       endDateClause,
      SCOPE_OF_SERVICES:     fields.scope_of_services    || '[Scope of consulting services]',
      DELIVERABLES_SECTION:  deliverablesSection,
      FEE_STRUCTURE:         fields.fee_structure         || 'Fixed Project Fee',
      FEE_AMOUNT:            fields.fee_amount            || '[Fee Amount]',
      PAYMENT_TERMS:         fields.payment_terms         || 'Net 30 (due within 30 days of invoice)',
      IP_OWNERSHIP_CLAUSE:   ipClause,
      EXCLUSIVITY_CLAUSE:    exclusivityClause,
      CONFIDENTIALITY_PERIOD:fields.confidentiality_period || '2 years',
      NOTICE_PERIOD:         fields.notice_period         || '30',
      GOVERNING_LAW:         this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── SLA ──────────────────────────────────────────────────────────────────

  _generateSLA(fields) {
    const doc = this.documents.sla;
    let template = doc.template;

    template = this._replace(template, {
      PROVIDER_NAME:          fields.provider_name          || '[Service Provider]',
      CLIENT_NAME:            fields.client_name            || '[Client]',
      EFFECTIVE_DATE:         this._formatDate(fields.effective_date),
      SERVICE_DESCRIPTION:    fields.service_description    || '[Description of services covered]',
      UPTIME_GUARANTEE:       fields.uptime_guarantee       || '99.9%',
      MAINTENANCE_WINDOW:     fields.maintenance_window     || '[Maintenance window]',
      SUPPORT_HOURS:          fields.support_hours          || '24 hours a day, 7 days a week',
      CRITICAL_RESPONSE_TIME: fields.critical_response_time || '1 hour',
      HIGH_RESPONSE_TIME:     fields.high_response_time     || '4 hours',
      MEDIUM_RESPONSE_TIME:   fields.medium_response_time   || '1 business day',
      LOW_RESPONSE_TIME:      fields.low_response_time      || '2 business days',
      SERVICE_CREDIT_CAP:     fields.service_credit_cap     || '30%',
      GOVERNING_LAW:          this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── EULA ─────────────────────────────────────────────────────────────────

  _generateEULA(fields) {
    const doc = this.documents.eula;
    let template = doc.template;

    const licenceScopeMap = {
      personal:          'personal, non-commercial purposes only',
      single_commercial: 'single-user commercial purposes',
      multi_commercial:  'commercial purposes within your organisation (multi-user)',
      enterprise:        'enterprise-wide commercial use within your organisation and subsidiaries'
    };
    const licenceScope = licenceScopeMap[fields.licence_type] || 'permitted purposes as stated';

    const versionClause = (fields.software_version && fields.software_version.trim())
      ? ` (version ${fields.software_version.trim()})`
      : '';

    const updatesClauseMap = {
      automatic: '## Updates and New Versions\n\nThe Licensor may release updates, patches, and new versions of the Software from time to time. Updates may be downloaded and installed automatically without further notice. By continuing to use the Software after an update, You accept the updated version and any modifications to these terms that accompany it.',
      manual:    '## Updates and New Versions\n\nThe Licensor may release updates, patches, and new versions of the Software from time to time. You will be notified of available updates and may choose to install them. Continued use of an older version after a new version is released is at Your own risk. The Licensor may cease supporting older versions with reasonable notice.',
      none:      '## Updates and New Versions\n\nNo updates or new versions are included with this licence. The Software is provided as a standalone release. The Licensor is under no obligation to provide updates, patches, or bug fixes.'
    };
    const updatesClause = updatesClauseMap[fields.has_auto_updates] || updatesClauseMap.manual;

    const dataClause = fields.collects_data === 'yes'
      ? '## Data Collection and Privacy\n\nThe Software may collect certain information about Your device, usage patterns, and interactions to improve performance and functionality. All data collection is conducted in accordance with the Licensor\'s Privacy Policy, which is available at [PRIVACY_POLICY_URL]. By using the Software, You consent to such data collection and processing as described in the Privacy Policy.'
      : '## Data Collection and Privacy\n\nThe Software does not collect, transmit, or store any personal data from the Licensee\'s device without explicit user action. No telemetry or usage data is sent to the Licensor.';

    const supportClause = `Technical support is provided for ${fields.support_period || 'the period stated at purchase'}.`;

    template = this._replace(template, {
      SOFTWARE_NAME:        fields.software_name   || '[Software Name]',
      DEVELOPER_NAME:       fields.developer_name  || '[Developer Name]',
      EFFECTIVE_DATE:       this._formatDate(fields.effective_date),
      SOFTWARE_VERSION_CLAUSE: versionClause,
      PLATFORM:             fields.platform        || 'compatible devices',
      LICENCE_SCOPE:        licenceScope,
      UPDATES_CLAUSE:       updatesClause,
      DATA_CLAUSE:          dataClause,
      SUPPORT_PERIOD:       fields.support_period  || 'the period stated at purchase',
      GOVERNING_LAW:        this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Partnership Agreement ────────────────────────────────────────────────

  _generatePartnership(fields) {
    const doc = this.documents.partnership;
    let template = doc.template;

    const hasC = fields.has_third_partner === 'yes' && fields.partner_c_name && fields.partner_c_name.trim();
    const partnerCBlock      = hasC ? `\n${fields.partner_c_name} ("Partner C")` : '';
    const partnerCContrib    = hasC ? `\nPartner C — ${fields.partner_c_name}: ${fields.partner_c_contribution || '[Contribution]'}` : '';
    const partnerCShare      = hasC ? `\n${fields.partner_c_name}: ${fields.partner_c_share || '[Share]'}` : '';
    const partnerCSig        = hasC
      ? `\n\n\n${fields.partner_c_name} (Partner C)\n\nSignature: _________________________________\nPrinted Name: _________________________________\nDate: _________________________________`
      : '';

    const decisionClauseMap = {
      unanimous: 'Major decisions affecting the Partnership — including significant financial commitments, changes to the business direction, admission of new partners, and dissolution — require the unanimous written agreement of all Partners.',
      majority:  'Major decisions affecting the Partnership shall be made by a simple majority vote of all Partners, with each Partner holding one vote regardless of their capital contribution or profit share.',
      managing:  'The Partners shall designate a Managing Partner who has authority to make day-to-day operational decisions. Major decisions — including significant financial commitments, changes to the business direction, admission of new partners, and dissolution — require the prior written consent of all Partners.'
    };
    const decisionClause = decisionClauseMap[fields.decision_making] || decisionClauseMap.unanimous;

    const nonCompete = fields.non_compete_period === 'none'
      ? 'No post-exit non-compete obligation applies under this Agreement. Partners may pursue other business activities freely, subject to the confidentiality obligations in Section 9.'
      : `During their participation in the Partnership and for ${fields.non_compete_period || '12 months'} following their departure (for any reason), each Partner agrees not to directly engage in, own, or operate any business that directly competes with the Partnership's primary business activities in the same geographic area.`;

    template = this._replace(template, {
      BUSINESS_NAME:              fields.business_name         || '[Partnership Name]',
      BUSINESS_PURPOSE:           fields.business_purpose      || '[Business purpose]',
      EFFECTIVE_DATE:             this._formatDate(fields.effective_date),
      PARTNER_A_NAME:             fields.partner_a_name        || '[Partner A]',
      PARTNER_A_CONTRIBUTION:     fields.partner_a_contribution || '[Contribution]',
      PARTNER_A_SHARE:            fields.partner_a_share        || '[Share %]',
      PARTNER_B_NAME:             fields.partner_b_name        || '[Partner B]',
      PARTNER_B_CONTRIBUTION:     fields.partner_b_contribution || '[Contribution]',
      PARTNER_B_SHARE:            fields.partner_b_share        || '[Share %]',
      PARTNER_C_BLOCK:            partnerCBlock,
      PARTNER_C_CONTRIBUTION_BLOCK: partnerCContrib,
      PARTNER_C_SHARE_BLOCK:      partnerCShare,
      PARTNER_C_SIGNATURE_BLOCK:  partnerCSig,
      DECISION_MAKING_CLAUSE:     decisionClause,
      PROFIT_DISTRIBUTION:        fields.profit_distribution    || 'quarterly',
      NON_COMPETE_CLAUSE:         nonCompete,
      GOVERNING_LAW:              this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Influencer / Brand Deal ──────────────────────────────────────────────

  _generateInfluencer(fields) {
    const doc = this.documents.influencer;
    let template = doc.template;

    const approvalClause = fields.has_content_approval === 'yes'
      ? `Content Approval: All Content must be submitted to the Brand for written approval at least ${fields.approval_window || '48 hours'} before the intended posting date. The Brand will provide written approval or change requests within the approval window. If the Brand does not respond within the approval window, approval is deemed given. The Brand may request reasonable changes that do not fundamentally alter the Creator's voice or style.`
      : 'Content Approval: No pre-posting approval is required. The Creator may post Content at their discretion, provided it meets the Content Standards in Section 2.';

    const ftcClause = fields.requires_ftc === 'yes'
      ? 'The Creator must clearly and conspicuously disclose the paid/sponsored nature of all Content in compliance with applicable advertising standards (including FTC guidelines in the US and ASA/CAP guidelines in the UK). Disclosure language such as "#ad", "#sponsored", or "Paid partnership with [Brand]" must appear prominently at the start of captions or descriptions and must be clearly visible without additional user interaction.'
      : 'This engagement involves gifting only with no monetary compensation. While mandatory disclosure may not apply, the Creator is encouraged to transparently indicate the gifted nature of any Content in the interest of audience trust and applicable platform policies.';

    const exclusivityClause = fields.exclusivity_days === 'none'
      ? 'Exclusivity: This Agreement is non-exclusive. The Creator is free to collaborate with competing brands before, during, and after the Campaign.'
      : `Exclusivity: During the Campaign and for ${fields.exclusivity_days || '30 days'} following the final posting date, the Creator agrees not to promote, endorse, or create paid content for brands that directly compete with the Brand's products or services without the Brand's prior written consent.`;

    const usageScope = fields.usage_includes_ads === 'yes'
      ? 'across the Brand\'s owned and operated channels (website, social media, email marketing) and in paid advertising campaigns (digital, social, and programmatic)'
      : 'across the Brand\'s owned and operated channels (website, social media, email marketing) only — not in paid advertising without separate written agreement';

    template = this._replace(template, {
      BRAND_NAME:             fields.brand_name             || '[Brand Name]',
      CREATOR_NAME:           fields.creator_name           || '[Creator Name]',
      CAMPAIGN_NAME:          fields.campaign_name          || '[Campaign Name]',
      EFFECTIVE_DATE:         this._formatDate(fields.effective_date),
      PLATFORMS:              fields.platforms              || '[Platforms]',
      DELIVERABLES:           fields.deliverables           || '[Deliverables to be specified]',
      CONTENT_DEADLINE:       this._formatDate(fields.content_deadline),
      POSTING_DEADLINE:       this._formatDate(fields.posting_deadline),
      CONTENT_APPROVAL_CLAUSE:approvalClause,
      FTC_DISCLOSURE_CLAUSE:  ftcClause,
      COMPENSATION_TYPE:      fields.compensation_type      || 'Flat Fee',
      COMPENSATION_AMOUNT:    fields.compensation_amount    || '[Amount]',
      REVISION_ROUNDS:        fields.revision_rounds        || '2',
      USAGE_RIGHTS_DURATION:  fields.usage_rights_duration  || '12 months',
      USAGE_RIGHTS_SCOPE:     usageScope,
      EXCLUSIVITY_CLAUSE:     exclusivityClause,
      GOVERNING_LAW:          this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Sponsorship Agreement ────────────────────────────────────────────────

  _generateSponsorship(fields) {
    const doc = this.documents.sponsorship;
    let template = doc.template;

    const exclusivityClause = fields.has_exclusivity === 'yes'
      ? `Category Exclusivity: During the Sponsorship Period, the Sponsored Party agrees not to accept sponsorship from any other company in the ${fields.exclusivity_category || '[category]'} category that directly competes with the Sponsor's core business. The Sponsored Party will notify the Sponsor before entering any sponsorship discussions with brands in a potentially competing category.`
      : 'Non-Exclusive Arrangement: This sponsorship is non-exclusive. The Sponsored Party may accept sponsorship from other companies, including those operating in the same or similar industries as the Sponsor, unless a separate written exclusivity agreement is entered into.';

    const programName = fields.program_name && fields.program_name.trim()
      ? fields.program_name.trim()
      : `${fields.company_name || '[Company]'} Affiliate Programme`;

    template = this._replace(template, {
      SPONSOR_NAME:        fields.sponsor_name       || '[Sponsor]',
      SPONSORED_NAME:      fields.sponsored_name     || '[Sponsored Party]',
      EFFECTIVE_DATE:      this._formatDate(fields.effective_date),
      SPONSORSHIP_TYPE:    fields.sponsorship_type   || 'Supporting',
      SPONSORSHIP_START:   this._formatDate(fields.sponsorship_start),
      SPONSORSHIP_END:     this._formatDate(fields.sponsorship_end),
      SPONSORSHIP_FEE:     fields.sponsorship_fee    || '[Sponsorship Fee]',
      PAYMENT_SCHEDULE:    fields.payment_schedule   || 'in full upfront',
      DELIVERABLES:        fields.deliverables       || '[Deliverables to be specified]',
      EXCLUSIVITY_CLAUSE:  exclusivityClause,
      CANCELLATION_NOTICE: fields.cancellation_notice || '30',
      GOVERNING_LAW:       this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Affiliate / Referral Agreement ──────────────────────────────────────

  _generateAffiliate(fields) {
    const doc = this.documents.affiliate;
    let template = doc.template;

    const programName = fields.program_name && fields.program_name.trim()
      ? fields.program_name.trim()
      : `${fields.company_name || '[Company]'} Affiliate Programme`;

    const ftcClause = fields.requires_ftc === 'yes'
      ? 'The Affiliate must clearly and conspicuously disclose their affiliate relationship with the Merchant on all promotional content, in compliance with applicable advertising standards (including FTC guidelines in the US and ASA/CAP guidelines in the UK). Disclosure must appear prominently — for example, using language such as "This post contains affiliate links" or "#ad" — before any affiliate links and must be clearly visible without requiring additional user action.'
      : 'This is a business-to-business referral programme with no public consumer-facing promotion. Disclosure obligations under consumer advertising standards may not apply, but the Affiliate must comply with all applicable laws in their jurisdiction.';

    template = this._replace(template, {
      COMPANY_NAME:      fields.company_name      || '[Company Name]',
      AFFILIATE_NAME:    fields.affiliate_name    || '[Affiliate Name]',
      PROGRAM_NAME:      programName,
      EFFECTIVE_DATE:    this._formatDate(fields.effective_date),
      PRODUCTS_SERVICES: fields.products_services || '[Products/Services]',
      COMMISSION_TYPE:   fields.commission_type   || 'a percentage of each qualifying sale',
      COMMISSION_RATE:   fields.commission_rate   || '[Rate]',
      COOKIE_WINDOW:     fields.cookie_window     || '30 days',
      PAYOUT_THRESHOLD:  fields.payout_threshold  || '$50',
      PAYOUT_FREQUENCY:  fields.payout_frequency  || 'monthly',
      PAYMENT_METHOD:    fields.payment_method    || 'Bank Transfer',
      PERMITTED_CHANNELS:fields.permitted_channels || 'all lawful digital channels',
      FTC_DISCLOSURE_CLAUSE: ftcClause,
      GOVERNING_LAW:     this.jurisdictionNames[fields.jurisdiction] || fields.jurisdiction || '[governing jurisdiction]'
    });

    return this._formatDocument(template);
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  /**
   * Replace all {{KEY}} placeholders in a template string
   */
  _replace(template, replacements) {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, value || '');
    }
    return result;
  }

  _formatDate(dateStr) {
    if (!dateStr) return '[Date]';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  _formatDocument(doc) {
    // Remove any unresolved placeholders
    doc = doc.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
    // Normalise excessive blank lines
    doc = doc.replace(/\n{3,}/g, '\n\n');
    return doc.trim();
  }

  // ─── Export helpers ───────────────────────────────────────────────────────

  generateHTML(content, docType) {
    const titles = {
      nda:         'Non-Disclosure Agreement',
      freelance:   'Freelance Service Agreement',
      employment:  'Employment Agreement',
      consulting:  'Consulting Agreement',
      sla:         'Service Level Agreement',
      eula:        'End User Licence Agreement',
      partnership: 'Business Partnership Agreement',
      influencer:  'Influencer Collaboration Agreement',
      sponsorship: 'Sponsorship Agreement',
      affiliate:   'Affiliate and Referral Agreement'
    };
    const title = titles[docType] || 'Legal Document';

    const bodyHtml = content
      .split('\n')
      .map(line => {
        if (line.startsWith('## '))  return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('# '))   return `<h1>${line.slice(2)}</h1>`;
        if (line.startsWith('---'))  return '<hr>';
        if (line.trim() === '')      return '';
        return `<p>${line}</p>`;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.8; max-width: 820px; margin: 60px auto; padding: 0 40px; color: #222; }
    h1   { font-size: 1.6em; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5em; }
    h2   { font-size: 1.1em; margin-top: 2em; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    p    { margin: 0.6em 0; }
    hr   { border: none; border-top: 2px solid #333; margin: 2.5em 0; }
    .signature-block { margin-top: 2em; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <p style="text-align:right;font-size:0.85em;color:#777;">Generated ${new Date().toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })}</p>
  ${bodyHtml}
</body>
</html>`;
  }

  generateMarkdown(content, docType) {
    const titles = {
      nda:         'Non-Disclosure Agreement',
      freelance:   'Freelance Service Agreement',
      employment:  'Employment Agreement',
      consulting:  'Consulting Agreement',
      sla:         'Service Level Agreement',
      eula:        'End User Licence Agreement',
      partnership: 'Business Partnership Agreement',
      influencer:  'Influencer Collaboration Agreement',
      sponsorship: 'Sponsorship Agreement',
      affiliate:   'Affiliate and Referral Agreement'
    };
    const title = titles[docType] || 'Legal Document';
    const date  = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

    return `# ${title}\n\n*Generated: ${date}*\n\n---\n\n${content}`;
  }

  /**
   * Build form HTML for a given document type based on the field definitions in documents.json
   */
  buildFormFields(docType) {
    const doc = this.documents[docType];
    if (!doc) return '';

    return doc.fields.map(field => {
      const required = field.required ? 'required' : '';
      const id = `doc-field-${field.id}`;

      if (field.type === 'select') {
        const options = field.options.map(o =>
          `<option value="${o.value}">${o.label}</option>`
        ).join('');
        return `<div class="form-group">
  <label for="${id}">${field.label}${field.required ? ' <span class="required-star">*</span>' : ''}</label>
  <select id="${id}" data-field="${field.id}" ${required}>
    <option value="">Select…</option>
    ${options}
  </select>
</div>`;
      }

      if (field.type === 'textarea') {
        return `<div class="form-group">
  <label for="${id}">${field.label}${field.required ? ' <span class="required-star">*</span>' : ''}</label>
  <textarea id="${id}" data-field="${field.id}" rows="5" placeholder="${field.placeholder || ''}" ${required}></textarea>
</div>`;
      }

      // text or date
      return `<div class="form-group">
  <label for="${id}">${field.label}${field.required ? ' <span class="required-star">*</span>' : ''}</label>
  <input type="${field.type}" id="${id}" data-field="${field.id}" placeholder="${field.placeholder || ''}" ${required}>
</div>`;
    }).join('\n');
  }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentGenerator;
} else {
  window.DocumentGenerator = DocumentGenerator;
}
