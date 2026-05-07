import type { FieldType, FormField } from '@careeros/shared-types';

export type SupportedFieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type DetectedFormField = FormField & {
  element: SupportedFieldElement;
  rawType: string;
  matchedBy: Array<
    | 'label'
    | 'placeholder'
    | 'aria-label'
    | 'aria-labelledby'
    | 'name'
    | 'id'
    | 'nearby-text'
    | 'xpath'
    | 'accessibility'
    | 'provider-hint'
  >;
};

export type FieldCandidateContext = {
  label: string;
  placeholder: string;
  ariaLabel: string;
  nearbyText: string[];
  describedByText: string[];
  name: string;
  id: string;
};

export type DetectionStrategyResult = {
  fieldType: FieldType;
  confidence: number;
};
