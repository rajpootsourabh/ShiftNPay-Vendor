import EmploymentApplicationForm from "./EmploymentApplicationForm";
import EqualOpportunityForm from "./EqualOpportunityForm";
import RequestForReferenceForm from "./RequestForReferenceForm";
import BackgroundCheckForm from "./BackgroundCheckForm";
import CareAvailabilityForm from "./CareAvailabilityForm";
import HandbookAcknowledgmentForm from "./HandbookAcknowledgmentForm";
import OrientationAcknowledgementsForm from "./OrientationAcknowledgementsForm";
import EmployeePersonalActionForm from "./EmployeePersonalActionForm";
import AbuseNeglectPolicyForm from "./AbuseNeglectPolicyForm";
import CareAssociateScheduleForm from "./CareAssociateScheduleForm";
import OrientationCurriculumForm from "./OrientationCurriculumForm";
import EmergencyContactForm from "./EmergencyContactForm";
import HepatitisBConsentForm from "./HepatitisBConsentForm";
import PreEmploymentDrugConsentForm from "./PreEmploymentDrugConsentForm";
import IDBadgeAgreementForm from "./IDBadgeAgreementForm";
import SkillsChecklistForm from "./SkillsChecklistForm";
import NonDisclosureNoncompeteForm from "./NonDisclosureNoncompeteForm";
import W4Form2023 from "./W4Form2023";
import I9Form from "./I9Form";



export const pdfFormRegistry = {
  1: EmploymentApplicationForm,
  2: EqualOpportunityForm,
  3: SkillsChecklistForm,
  4: RequestForReferenceForm,
  5: BackgroundCheckForm,
  6: CareAvailabilityForm,
  7: EmployeePersonalActionForm,
  8: HandbookAcknowledgmentForm,
  9: OrientationAcknowledgementsForm,
  10: OrientationCurriculumForm,
  11: AbuseNeglectPolicyForm,
  12: CareAssociateScheduleForm,
  13: EmergencyContactForm,
  14: HepatitisBConsentForm,
  15: PreEmploymentDrugConsentForm,
  16: IDBadgeAgreementForm,
  17: NonDisclosureNoncompeteForm,
  18: I9Form,
  19: W4Form2023
};

export const getPdfForm = (documentId) => {
  return pdfFormRegistry[documentId] || null;
};

export const hasPdfForm = (documentId) => {
  return !!pdfFormRegistry[documentId];
};
