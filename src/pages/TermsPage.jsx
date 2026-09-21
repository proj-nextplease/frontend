import { LegalPageLayout } from '../components/LegalPageLayout.jsx';
import { TERMS_DOC } from '../lib/legalDocuments.js';

export function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Pháp lý"
      title={TERMS_DOC.title}
      updated={TERMS_DOC.updated}
      intro={TERMS_DOC.intro}
      sections={TERMS_DOC.sections}
    />
  );
}
