import { zodResolver } from '@hookform/resolvers/zod';
import type { UserProfile } from '@careeros/shared-types';
import { useEffect, useRef } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { createEmptyEducationEntry, createEmptyWorkExperienceEntry } from '../defaults';
import { userProfileSchema, type UserProfileFormValues } from '../schema';
import { useProfileStore } from '../store';

export function useProfileForm() {
  const record = useProfileStore((state) => state.record);
  const isLoaded = useProfileStore((state) => state.isLoaded);
  const saveProfile = useProfileStore((state) => state.saveProfile);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: record.profile,
  });

  const education = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const workExperience = useFieldArray({
    control: form.control,
    name: 'workExperience',
  });

  useEffect(() => {
    if (isLoaded) {
      form.reset(record.profile);
      lastSavedSnapshotRef.current = JSON.stringify(record.profile);
    }
  }, [form, isLoaded, record.profile]);

  const watchedValues = useWatch({
    control: form.control,
  });

  const autosaveTimerRef = useRef<number | null>(null);
  const lastSavedSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const nextSnapshot = JSON.stringify(watchedValues);
      if (nextSnapshot === lastSavedSnapshotRef.current) {
        return;
      }

      void form.trigger().then((isValid) => {
        if (isValid) {
          lastSavedSnapshotRef.current = nextSnapshot;
          void saveProfile(watchedValues as UserProfile);
        }
      });
    }, 700);

    return () => {
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [form, isLoaded, saveProfile, watchedValues]);

  return {
    form,
    education,
    workExperience,
    appendEducation: () => education.append(createEmptyEducationEntry()),
    appendWorkExperience: () => workExperience.append(createEmptyWorkExperienceEntry()),
  };
}
