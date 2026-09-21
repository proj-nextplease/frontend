import { LegalPageLayout } from '../components/LegalPageLayout.jsx';
import { PRIVACY_DOC } from '../lib/legalDocuments.js';

export function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Pháp lý"
      title={PRIVACY_DOC.title}
      updated={PRIVACY_DOC.updated}
      intro={PRIVACY_DOC.intro}
      sections={PRIVACY_DOC.sections}
    />
  );
}
