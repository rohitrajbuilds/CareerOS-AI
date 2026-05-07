import type { FormField, SiteContext } from '@careeros/shared-types';
import { detectFormFields, toSerializableFieldMap } from './field-detector';
import { getSiteContext } from './site-context';
import type { DetectedFormField } from './types';

export type PageState = {
  siteContext: SiteContext;
  fields: FormField[];
};

export type RuntimePageState = PageState & {
  detectedFields: DetectedFormField[];
};

export function getRuntimePageState(): RuntimePageState {
  const siteContext = getSiteContext();
  const detectedFields = detectFormFields(siteContext.provider);
  const fields = toSerializableFieldMap(detectedFields);

  return {
    siteContext: {
      ...siteContext,
      fieldCount: fields.length,
      lastDetectedAt: new Date().toISOString(),
    },
    fields,
    detectedFields,
  };
}

export function getPageState(): PageState {
  const runtimePageState = getRuntimePageState();

  return {
    siteContext: runtimePageState.siteContext,
    fields: runtimePageState.fields,
  };
}
