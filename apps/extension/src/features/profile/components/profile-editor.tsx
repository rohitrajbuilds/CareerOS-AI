import type { SponsorshipStatus } from '@careeros/shared-types';
import type { ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';
import { sponsorshipStatusOptions } from '../schema';
import { useProfileForm } from '../hooks/use-profile-form';

const sponsorshipLabels: Record<SponsorshipStatus, string> = {
  citizen: 'Citizen',
  permanent_resident: 'Permanent Resident',
  visa_sponsorship_required: 'Visa Sponsorship Required',
  student_visa: 'Student Visa',
  other: 'Other',
};

function InputField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function baseInputClasses(): string {
  return 'w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(22,64,214,0.15)]';
}

export function ProfileEditor(): JSX.Element {
  const { form, education, workExperience, appendEducation, appendWorkExperience } =
    useProfileForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FormProvider {...form}>
      <form className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2">
          <InputField label="Full name" error={errors.fullName?.message}>
            <input className={baseInputClasses()} {...register('fullName')} />
          </InputField>
          <InputField label="Email" error={errors.email?.message}>
            <input className={baseInputClasses()} type="email" {...register('email')} />
          </InputField>
          <InputField label="Phone" error={errors.phone?.message}>
            <input className={baseInputClasses()} {...register('phone')} />
          </InputField>
          <InputField label="Sponsorship status" error={errors.sponsorshipStatus?.message}>
            <select className={baseInputClasses()} {...register('sponsorshipStatus')}>
              {sponsorshipStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {sponsorshipLabels[status]}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="LinkedIn" error={errors.linkedInUrl?.message}>
            <input className={baseInputClasses()} {...register('linkedInUrl')} />
          </InputField>
          <InputField label="GitHub" error={errors.githubUrl?.message}>
            <input className={baseInputClasses()} {...register('githubUrl')} />
          </InputField>
          <div className="md:col-span-2">
            <InputField label="Portfolio" error={errors.portfolioUrl?.message}>
              <input className={baseInputClasses()} {...register('portfolioUrl')} />
            </InputField>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Education</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Track degrees, institutions, and supporting details for autofill readiness.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
              onClick={appendEducation}
            >
              Add education
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {education.fields.map((field, index) => (
              <article key={field.id} className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 md:grid-cols-2">
                <InputField label="Institution" error={errors.education?.[index]?.institution?.message}>
                  <input className={baseInputClasses()} {...register(`education.${index}.institution`)} />
                </InputField>
                <InputField label="Degree" error={errors.education?.[index]?.degree?.message}>
                  <input className={baseInputClasses()} {...register(`education.${index}.degree`)} />
                </InputField>
                <InputField label="Field of study" error={errors.education?.[index]?.fieldOfStudy?.message}>
                  <input className={baseInputClasses()} {...register(`education.${index}.fieldOfStudy`)} />
                </InputField>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Start date">
                    <input className={baseInputClasses()} type="month" {...register(`education.${index}.startDate`)} />
                  </InputField>
                  <InputField label="End date">
                    <input className={baseInputClasses()} type="month" {...register(`education.${index}.endDate`)} />
                  </InputField>
                </div>
                <div className="md:col-span-2">
                  <InputField label="Description" error={errors.education?.[index]?.description?.message}>
                    <textarea className={baseInputClasses()} rows={3} {...register(`education.${index}.description`)} />
                  </InputField>
                </div>
                {education.fields.length > 1 ? (
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-red-600"
                      onClick={() => education.remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Work experience</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Keep recent roles structured so generated answers stay factual and reusable.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
              onClick={appendWorkExperience}
            >
              Add role
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {workExperience.fields.map((field, index) => (
              <article key={field.id} className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 md:grid-cols-2">
                <InputField label="Company" error={errors.workExperience?.[index]?.company?.message}>
                  <input className={baseInputClasses()} {...register(`workExperience.${index}.company`)} />
                </InputField>
                <InputField label="Role title" error={errors.workExperience?.[index]?.title?.message}>
                  <input className={baseInputClasses()} {...register(`workExperience.${index}.title`)} />
                </InputField>
                <InputField label="Location" error={errors.workExperience?.[index]?.location?.message}>
                  <input className={baseInputClasses()} {...register(`workExperience.${index}.location`)} />
                </InputField>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Start date">
                    <input className={baseInputClasses()} type="month" {...register(`workExperience.${index}.startDate`)} />
                  </InputField>
                  <InputField label="End date">
                    <input className={baseInputClasses()} type="month" {...register(`workExperience.${index}.endDate`)} />
                  </InputField>
                </div>
                <div className="md:col-span-2">
                  <InputField label="Summary" error={errors.workExperience?.[index]?.summary?.message}>
                    <textarea className={baseInputClasses()} rows={4} {...register(`workExperience.${index}.summary`)} />
                  </InputField>
                </div>
                {workExperience.fields.length > 1 ? (
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-red-600"
                      onClick={() => workExperience.remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </form>
    </FormProvider>
  );
}
