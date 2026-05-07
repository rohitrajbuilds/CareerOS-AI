import type { FormField, SiteContext } from '@careeros/shared-types';
import { detectFormFields } from './field-detector';
import { getSiteContext } from './site-context';

export type PageState = {
  siteContext: SiteContext;
  fields: FormField[];
};

export function getPageState(): PageState {
  const fields = detectFormFields();
  const siteContext = getSiteContext();

  return {
    siteContext: {
      ...siteContext,
      fieldCount: fields.length,
      lastDetectedAt: new Date().toISOString(),
    },
    fields,
  };
}
