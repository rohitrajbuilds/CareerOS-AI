export type ATSProvider = 'workday' | 'linkedin' | 'greenhouse' | 'lever' | 'unknown';

export type ExtensionSurface = 'popup' | 'sidepanel' | 'background' | 'content' | 'options';

export type SiteContext = {
  provider: ATSProvider;
  url: string;
  title: string;
  hostname?: string;
  fieldCount?: number;
  lastDetectedAt?: string;
};

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'date'
  | 'file'
  | 'search'
  | 'unknown';

export type FormField = {
  id: string;
  type: FieldType;
  confidence: number;
  selector: string;
  xpath: string;
  label: string;
  required: boolean;
  placeholder?: string;
  ariaLabel?: string;
  name?: string;
  nearbyText: string[];
};

export type AutofillResult = {
  filledCount: number;
  unresolved: string[];
  previewCount?: number;
  undoCount?: number;
  skippedCount?: number;
  failedCount?: number;
  operation?: 'fill' | 'preview' | 'undo';
};

export type AutofillMode = 'fill' | 'preview' | 'undo';

export type AutofillActionType =
  | 'type'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'skip';

export type AutofillAction = {
  fieldId: string;
  selector: string;
  label: string;
  type: FieldType;
  actionType: AutofillActionType;
  confidence: number;
  value: string | boolean | null;
  valueLabel?: string;
  reason?: string;
};

export type AutofillDebugEntry = {
  fieldId: string;
  label: string;
  selector: string;
  status: 'planned' | 'previewed' | 'filled' | 'skipped' | 'failed' | 'undone';
  message: string;
  confidence: number;
};

export type HealthResponse = {
  status: 'ok';
  service: string;
  environment: string;
};

export type ExtensionSettings = {
  extensionEnabled: boolean;
  autoOpenSidePanel: boolean;
  debugMode: boolean;
};

export type SponsorshipStatus =
  | 'citizen'
  | 'permanent_resident'
  | 'visa_sponsorship_required'
  | 'student_visa'
  | 'other';

export type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type WorkExperienceEntry = {
  id: string;
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  summary?: string;
};

export type ResumeAsset = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  isPrimary: boolean;
  textPreview?: string | null;
  encryptedBlob: string;
};

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  sponsorshipStatus: SponsorshipStatus;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
};

export type UserProfileRecord = {
  profile: UserProfile;
  resumes: ResumeAsset[];
  createdAt: string;
  updatedAt: string;
};

export type ProfileCompletion = {
  completedFields: number;
  totalFields: number;
  percentage: number;
};

export type TabSession = {
  tabId: number;
  windowId?: number;
  url: string;
  title: string;
  status: 'idle' | 'injecting' | 'ready' | 'error';
  provider: ATSProvider;
  connectedAt?: string;
  lastError?: string;
  fieldCount?: number;
};

export type ExtensionSnapshot = {
  activeTabId: number | null;
  activeSession: TabSession | null;
  settings: ExtensionSettings;
  lastSyncAt: string;
};

export type ExtensionMessageError = {
  code: string;
  message: string;
};

export type RuntimeResult<TData> = {
  ok: true;
  data: TData;
} | {
  ok: false;
  error: ExtensionMessageError;
};

export type AiResponseType =
  | 'cover_letter'
  | 'why_company'
  | 'short_answer'
  | 'experience_summary'
  | 'technical_answer';

export type JobPageContext = {
  provider: ATSProvider;
  url: string;
  companyName?: string;
  roleTitle?: string;
  questionLabel?: string;
  jobDescription?: string;
  nearbyText?: string[];
};

export type ResumeContext = {
  primaryResumeFileName?: string;
  primaryResumeTags?: string[];
  profileSummary: string;
  resumeText?: string;
};

export type AiGenerationRequest = {
  type: AiResponseType;
  promptHint?: string;
  profile: UserProfile;
  resumeContext: ResumeContext;
  jobContext: JobPageContext;
  maxOutputTokens?: number;
};

export type AiStreamEvent =
  | {
      type: 'started';
      requestType: AiResponseType;
      model: string;
    }
  | {
      type: 'delta';
      text: string;
    }
  | {
      type: 'completed';
      text: string;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
      };
    }
  | {
      type: 'error';
      message: string;
      retryable: boolean;
    };

export type RequirementCategory =
  | 'skills'
  | 'experience'
  | 'education'
  | 'responsibility'
  | 'domain'
  | 'other';

export type RequirementMatchSource = 'resume' | 'profile' | 'job_context' | 'unmatched';

export type JobRequirement = {
  id: string;
  text: string;
  category: RequirementCategory;
  matched: boolean;
  confidence: number;
  matchSource: RequirementMatchSource;
};

export type JobSkillSignal = {
  name: string;
  normalizedName: string;
  required: boolean;
  matched: boolean;
  weight: number;
};

export type JobAnalysisBreakdown = {
  skillCoverage: number;
  requirementCoverage: number;
  keywordAlignment: number;
  experienceAlignment: number;
  educationAlignment: number;
};

export type JobAnalysisRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  kind: 'missing_skill' | 'keyword' | 'experience' | 'education' | 'general';
};

export type JobAnalysisInsight = {
  generated: boolean;
  summary: string;
  strengths: string[];
  risks: string[];
  nextSteps: string[];
};

export type JobAnalysisRequest = {
  profile: UserProfile;
  resumeContext: ResumeContext;
  jobContext: JobPageContext;
};

export type JobAnalysisResponse = {
  analyzedAt: string;
  atsScore: number;
  matchScore: number;
  matchIndicator: 'strong' | 'moderate' | 'weak';
  requirements: JobRequirement[];
  detectedSkills: JobSkillSignal[];
  matchedSkills: string[];
  missingSkills: string[];
  breakdown: JobAnalysisBreakdown;
  recommendations: JobAnalysisRecommendation[];
  aiInsights: JobAnalysisInsight;
  jobContext: JobPageContext;
};
