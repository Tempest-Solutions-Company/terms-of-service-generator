document.addEventListener('DOMContentLoaded', async () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialise generators
  // ═══════════════════════════════════════════════════════════════════════════

  const tosGenerator = new TOSGenerator();
  const docGenerator = new DocumentGenerator();

  await Promise.all([
    tosGenerator.initialize(),
    docGenerator.initialize()
  ]);

  // Shared state
  let currentContent  = '';
  let currentDocType  = 'tos';   // which tab is active
  let currentFilename = 'terms-of-service';

  // ═══════════════════════════════════════════════════════════════════════════
  // Tab switching
  // ═══════════════════════════════════════════════════════════════════════════

  const tabButtons  = document.querySelectorAll('.tab-btn');
  const tabPanels   = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`tab-${target}`).classList.add('active');

      currentDocType = target;

      // Hide any stale result when switching tabs
      document.getElementById('result').classList.add('hidden');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Build dynamic forms for the four new document types
  // ═══════════════════════════════════════════════════════════════════════════

  ['nda', 'freelance', 'employment', 'consulting',
   'sla', 'eula', 'partnership', 'influencer', 'sponsorship', 'affiliate'].forEach(docType => {
    const container = document.getElementById(`${docType}-fields`);
    if (container) {
      container.innerHTML = docGenerator.buildFormFields(docType);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOS form — existing behaviour (preserved)
  // ═══════════════════════════════════════════════════════════════════════════

  let complianceModules = {};
  let clauseLibrary     = {};

  try {
    const [complianceRes, clauseRes] = await Promise.all([
      fetch('./data/compliance_modules.json'),
      fetch('./data/clause_library.json')
    ]);
    complianceModules = await complianceRes.json();
    clauseLibrary     = await clauseRes.json();
    populateComplianceModules(complianceModules);
  } catch (err) {
    console.error('Error loading TOS data:', err);
  }

  function populateComplianceModules(modules) {
    const container = document.getElementById('compliance-modules');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(modules).forEach(code => {
      const mod = modules[code];
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      div.setAttribute('title', mod.description);

      const input = document.createElement('input');
      input.type  = 'checkbox';
      input.id    = `compliance-${code}`;
      input.value = code;
      input.name  = 'compliance';

      const label = document.createElement('label');
      label.htmlFor    = `compliance-${code}`;
      label.textContent = `${mod.name} (${mod.region})`;

      div.appendChild(input);
      div.appendChild(label);
      container.appendChild(div);
    });
  }

  function updateApplicableClauses() {
    const businessType    = document.getElementById('business-type').value;
    const clausesContainer = document.getElementById('specialized-clauses');
    clausesContainer.innerHTML = '';

    if (!businessType) {
      clausesContainer.innerHTML = '<p class="field-description">Please select a business type to see recommended clauses.</p>';
      return;
    }

    Object.keys(clauseLibrary).forEach(code => {
      const clause       = clauseLibrary[code];
      const isApplicable = clause.applicable_to && clause.applicable_to.includes(businessType);

      const div   = document.createElement('div');
      div.className = isApplicable ? 'checkbox-item recommended' : 'checkbox-item';
      div.setAttribute('title', clause.description);

      const input     = document.createElement('input');
      input.type      = 'checkbox';
      input.id        = `clause-${code}`;
      input.value     = code;
      input.name      = 'clause';
      input.checked   = isApplicable;

      const label     = document.createElement('label');
      label.htmlFor   = `clause-${code}`;
      label.textContent = clause.name;

      div.appendChild(input);
      div.appendChild(label);
      clausesContainer.appendChild(div);
    });
  }

  document.getElementById('business-type').addEventListener('change', updateApplicableClauses);
  updateApplicableClauses();

  // TOS form submit
  document.getElementById('tos-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const businessName  = document.getElementById('business-name').value;
    const businessType  = document.getElementById('business-type').value;
    const jurisdiction  = document.getElementById('jurisdiction').value;

    const selectedClauses = Array.from(
      document.querySelectorAll('#specialized-clauses input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const selectedModules = Array.from(
      document.querySelectorAll('#compliance-modules input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    showLoading(document.getElementById('loading-indicator'));

    try {
      currentContent  = await tosGenerator.generate(businessName, businessType, jurisdiction, {
        specialClauses:   selectedClauses,
        complianceModules: selectedModules
      });
      currentFilename = 'terms-of-service';
      showResult(currentContent, 'tos', 'Your Terms of Service', 'Terms of Service');
    } catch (err) {
      console.error('TOS generation failed:', err);
      alert('Failed to generate Terms of Service. Please try again.');
    } finally {
      hideLoading(document.getElementById('loading-indicator'));
    }
  });

  // Discord bot auto-checks
  document.getElementById('business-type').addEventListener('change', function () {
    if (this.value === 'bot') {
      setTimeout(() => {
        ['bot_commands', 'discord_compliance', 'data_processing'].forEach(val => {
          const cb = document.querySelector(`input[value="${val}"]`);
          if (cb) cb.checked = true;
        });
      }, 300);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // New document forms — shared handler
  // ═══════════════════════════════════════════════════════════════════════════

  const docTypeConfig = {
    nda:         { title: 'Your Non-Disclosure Agreement',          badge: 'NDA',                      filename: 'nda' },
    freelance:   { title: 'Your Freelance Contract',                badge: 'Freelance Contract',        filename: 'freelance-contract' },
    employment:  { title: 'Your Employment Contract',               badge: 'Employment Contract',       filename: 'employment-contract' },
    consulting:  { title: 'Your Consulting Agreement',              badge: 'Consulting Agreement',      filename: 'consulting-agreement' },
    sla:         { title: 'Your Service Level Agreement',           badge: 'SLA',                      filename: 'service-level-agreement' },
    eula:        { title: 'Your End User Licence Agreement',        badge: 'EULA',                     filename: 'end-user-licence-agreement' },
    partnership: { title: 'Your Partnership Agreement',             badge: 'Partnership Agreement',     filename: 'partnership-agreement' },
    influencer:  { title: 'Your Influencer Collaboration Agreement',badge: 'Influencer Agreement',     filename: 'influencer-collaboration-agreement' },
    sponsorship: { title: 'Your Sponsorship Agreement',             badge: 'Sponsorship Agreement',    filename: 'sponsorship-agreement' },
    affiliate:   { title: 'Your Affiliate & Referral Agreement',    badge: 'Affiliate Agreement',      filename: 'affiliate-referral-agreement' }
  };

  ['nda', 'freelance', 'employment', 'consulting',
   'sla', 'eula', 'partnership', 'influencer', 'sponsorship', 'affiliate'].forEach(docType => {
    const form = document.getElementById(`${docType}-form`);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const loadingEl = form.querySelector('.loading-indicator');
      showLoading(loadingEl);

      try {
        const fields = collectFields(form);
        currentContent  = docGenerator.generate(docType, fields);
        currentFilename = docTypeConfig[docType].filename;

        const cfg = docTypeConfig[docType];
        showResult(currentContent, docType, cfg.title, cfg.badge);
      } catch (err) {
        console.error(`${docType} generation failed:`, err);
        alert(`Failed to generate document. Please check all required fields and try again.`);
      } finally {
        hideLoading(loadingEl);
      }
    });
  });

  /**
   * Collect all [data-field] inputs from a form into a plain object
   */
  function collectFields(form) {
    const fields = {};
    form.querySelectorAll('[data-field]').forEach(el => {
      fields[el.dataset.field] = el.value.trim();
    });
    return fields;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Result display
  // ═══════════════════════════════════════════════════════════════════════════

  function showResult(content, docType, title, badgeText) {
    const resultEl  = document.getElementById('result');
    const previewEl = document.getElementById('preview');
    const titleEl   = document.getElementById('result-title');
    const badgeEl   = document.getElementById('result-badge');

    titleEl.textContent   = title;
    badgeEl.textContent   = badgeText;
    badgeEl.className     = `result-doc-badge badge-${docType}`;

    // Render content: treat ##/# as headings, --- as <hr>, rest as <p>
    previewEl.innerHTML = content
      .split('\n')
      .map(line => {
        if (line.startsWith('## '))  return `<h3>${escapeHtml(line.slice(3))}</h3>`;
        if (line.startsWith('# '))   return `<h2>${escapeHtml(line.slice(2))}</h2>`;
        if (line.startsWith('---'))  return '<hr class="doc-divider">';
        if (line.trim() === '')      return '';
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join('');

    resultEl.classList.remove('hidden');
    resultEl.scrollIntoView({ behavior: 'smooth' });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Download / copy buttons
  // ═══════════════════════════════════════════════════════════════════════════

  document.getElementById('download-html').addEventListener('click', () => {
    const html = currentDocType === 'tos'
      ? tosGenerator.generateHTML(currentContent)
      : docGenerator.generateHTML(currentContent, currentDocType);
    downloadFile(`${currentFilename}.html`, html, 'text/html');
  });

  document.getElementById('download-md').addEventListener('click', () => {
    const md = currentDocType === 'tos'
      ? tosGenerator.generateMarkdown(currentContent)
      : docGenerator.generateMarkdown(currentContent, currentDocType);
    downloadFile(`${currentFilename}.md`, md, 'text/markdown');
  });

  document.getElementById('copy').addEventListener('click', () => {
    navigator.clipboard.writeText(currentContent)
      .then(() => {
        const btn = document.getElementById('copy');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      })
      .catch(err => console.error('Clipboard write failed:', err));
  });

  function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading helpers
  // ═══════════════════════════════════════════════════════════════════════════

  function showLoading(el) {
    if (el) el.classList.remove('d-none');
  }

  function hideLoading(el) {
    if (el) el.classList.add('d-none');
  }

});
