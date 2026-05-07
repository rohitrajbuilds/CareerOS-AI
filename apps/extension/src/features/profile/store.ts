import type { ResumeAsset, UserProfile, UserProfileRecord } from '@careeros/shared-types';
import { create } from 'zustand';
import { createEmptyProfileRecord } from './defaults';
import { fileToBase64 } from './file-utils';
import { encryptJson } from '@/lib/security/encryption';
import { loadUserProfileRecord, saveUserProfileRecord } from './storage';

type ProfileStoreState = {
  record: UserProfileRecord;
  isLoaded: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  load: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  updateResumeTags: (resumeId: string, tags: string[]) => Promise<void>;
  setPrimaryResume: (resumeId: string) => Promise<void>;
  removeResume: (resumeId: string) => Promise<void>;
  uploadResumeFiles: (files: FileList | File[]) => Promise<void>;
};

async function persistRecord(record: UserProfileRecord): Promise<UserProfileRecord> {
  const nextRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };

  return saveUserProfileRecord(nextRecord);
}

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  record: createEmptyProfileRecord(),
  isLoaded: false,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,
  async load() {
    set({ saveError: null });
    const record = await loadUserProfileRecord();
    set({
      record,
      isLoaded: true,
      lastSavedAt: record.updatedAt,
    });
  },
  async saveProfile(profile) {
    set({ isSaving: true, saveError: null });

    try {
      const current = get().record;
      const saved = await persistRecord({
        ...current,
        profile,
      });

      set({
        record: saved,
        isSaving: false,
        lastSavedAt: saved.updatedAt,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to save profile',
      });
    }
  },
  async updateResumeTags(resumeId, tags) {
    set({ isSaving: true, saveError: null });

    try {
      const current = get().record;
      const saved = await persistRecord({
        ...current,
        resumes: current.resumes.map((resume) =>
          resume.id === resumeId
            ? {
                ...resume,
                tags,
                updatedAt: new Date().toISOString(),
              }
            : resume,
        ),
      });

      set({
        record: saved,
        isSaving: false,
        lastSavedAt: saved.updatedAt,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to update resume tags',
      });
    }
  },
  async setPrimaryResume(resumeId) {
    set({ isSaving: true, saveError: null });

    try {
      const current = get().record;
      const saved = await persistRecord({
        ...current,
        resumes: current.resumes.map((resume) => ({
          ...resume,
          isPrimary: resume.id === resumeId,
          updatedAt: resume.id === resumeId ? new Date().toISOString() : resume.updatedAt,
        })),
      });

      set({
        record: saved,
        isSaving: false,
        lastSavedAt: saved.updatedAt,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to set primary resume',
      });
    }
  },
  async removeResume(resumeId) {
    set({ isSaving: true, saveError: null });

    try {
      const current = get().record;
      const remaining = current.resumes.filter((resume) => resume.id !== resumeId);
      const hasPrimary = remaining.some((resume) => resume.isPrimary);
      const normalized = remaining.map((resume, index) => ({
        ...resume,
        isPrimary: hasPrimary ? resume.isPrimary : index === 0,
      }));
      const saved = await persistRecord({
        ...current,
        resumes: normalized,
      });

      set({
        record: saved,
        isSaving: false,
        lastSavedAt: saved.updatedAt,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to remove resume',
      });
    }
  },
  async uploadResumeFiles(filesInput) {
    set({ isSaving: true, saveError: null });

    try {
      const current = get().record;
      const files = Array.from(filesInput);
      const now = new Date().toISOString();
      const resumes: ResumeAsset[] = await Promise.all(
        files.map(async (file, index) => {
          const fileBase64 = await fileToBase64(file);
          return {
            id: crypto.randomUUID(),
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            uploadedAt: now,
            updatedAt: now,
            tags: [],
            isPrimary: current.resumes.length === 0 && index === 0,
            encryptedBlob: await encryptJson({
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              contentBase64: fileBase64,
            }),
          };
        }),
      );

      const saved = await persistRecord({
        ...current,
        resumes: [...current.resumes, ...resumes],
      });

      set({
        record: saved,
        isSaving: false,
        lastSavedAt: saved.updatedAt,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to upload resumes',
      });
    }
  },
}));
