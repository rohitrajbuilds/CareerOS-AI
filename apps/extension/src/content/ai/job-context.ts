import type { AiResponseType, JobPageContext } from '@careeros/shared-types';
import { buildFieldCandidateContext } from '../core/accessibility';
import { fuzzyContains, normalizeText } from '../core/text-utils';
import { getSiteContext } from '../core/site-context';

function textFromSelectors(selectors: string[]): string {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    const text = normalizeText(node?.textContent);
    if (text) {
      return text;
    }
  }

  return '';
}

function inferResponseType(questionText: string): AiResponseType {
  if (fuzzyContains(questionText, ['cover letter'])) {
    return 'cover_letter';
  }
  if (fuzzyContains(questionText, ['why do you want to work here', 'why this company', 'why company'])) {
    return 'why_company';
  }
  if (fuzzyContains(questionText, ['technical', 'architecture', 'system design', 'algorithm'])) {
    return 'technical_answer';
  }
  if (fuzzyContains(questionText, ['summarize your experience', 'experience summary', 'background'])) {
    return 'experience_summary';
  }
  return 'short_answer';
}

export function buildJobContextForField(textarea: HTMLTextAreaElement): {
  jobContext: JobPageContext;
  inferredType: AiResponseType;
} {
  const siteContext = getSiteContext();
  const fieldContext = buildFieldCandidateContext(textarea);
  const providerSelectors: Record<string, { title: string[]; company: string[]; description: string[] }> = {
    workday: {
      title: ['[data-automation-id="jobPostingHeader"] h2', '[data-automation-id="jobPostingHeader"]'],
      company: ['[data-automation-id="company"]', '[data-automation-id="jobPostingCompany"]'],
      description: ['[data-automation-id="jobPostingDescription"]', '[data-automation-id="jobDetails"]'],
    },
    greenhouse: {
      title: ['.app-title', '#header .app-title', '.job-post h1'],
      company: ['#header .company-name', '.company-name'],
      description: ['#content', '.job-post'],
    },
    lever: {
      title: ['.posting-headline h2', '.posting-headline .posting-title', '.posting-title'],
      company: ['.main-header-text', '.posting-categories .sort-by-team'],
      description: ['.posting-page', '.content'],
    },
    linkedin: {
      title: ['.jobs-unified-top-card__job-title', '.jobs-details-top-card__job-title'],
      company: ['.jobs-unified-top-card__company-name', '.jobs-details-top-card__company-url'],
      description: ['.jobs-description-content__text', '.jobs-box__html-content'],
    },
    unknown: {
      title: ['h1', 'h2'],
      company: ['[data-company-name]', '.company-name'],
      description: ['main', '[role="main"]'],
    },
  };

  const selectors = providerSelectors[siteContext.provider] ?? providerSelectors.unknown;
  const questionLabel = normalizeText(
    [fieldContext.label, fieldContext.ariaLabel, textarea.placeholder, ...fieldContext.nearbyText]
      .filter(Boolean)
      .join(' '),
  );
  const description = textFromSelectors(selectors.description) || normalizeText(document.body.innerText).slice(0, 12000);

  const jobContext: JobPageContext = {
    provider: siteContext.provider,
    url: siteContext.url,
    companyName: textFromSelectors(selectors.company) || undefined,
    roleTitle: textFromSelectors(selectors.title) || siteContext.title,
    questionLabel: questionLabel || undefined,
    jobDescription: description.slice(0, 12000),
    nearbyText: fieldContext.nearbyText.slice(0, 12),
  };

  return {
    jobContext,
    inferredType: inferResponseType(questionLabel || description.slice(0, 300)),
  };
}
