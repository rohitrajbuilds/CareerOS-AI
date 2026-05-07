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

export type FormField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
};

export type AutofillResult = {
  filledCount: number;
  unresolved: string[];
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
