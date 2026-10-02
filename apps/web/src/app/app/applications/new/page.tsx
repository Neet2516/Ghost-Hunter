'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { CreateApplicationInput } from '@ghost-hunter/shared';
import {
  Display,
  Text,
  Button,
  Field,
  Hairline,
  MonoData,
} from '@/components/primitives';
import { ArrowLeft, ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CreateApplicationPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<CreateApplicationInput>({
    company: '',
    role: '',
    recruiterName: '',
    recruiterContact: '',
    outreachChannel: 'email',
    outreachContext: '',
    delayMs: 20 * 1000, // 20s default for demo
    maxFollowUps: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateApplicationInput) => api.createApplication(data),
    onSuccess: (created) => {
      router.push(`/app/applications/${created.id}`);
    },
    onError: (err: ApiError) => {
      if (err.fields) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(err.fields)) {
          fieldErrors[key] = msgs[0] || 'Invalid input';
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message });
      }
    },
  });

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.company.trim()) errs.company = 'Company name is required';
      if (!formData.role.trim()) errs.role = 'Role title is required';
    } else if (currentStep === 2) {
      if (!formData.recruiterName.trim()) errs.recruiterName = 'Recruiter name is required';
      if (!formData.outreachContext.trim() || formData.outreachContext.trim().length < 5) {
        errs.outreachContext = 'Outreach context must be at least 5 characters';
      }
    } else if (currentStep === 3) {
      if (formData.maxFollowUps < 1 || formData.maxFollowUps > 3) {
        errs.maxFollowUps = 'Follow-ups must be between 1 and 3';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      mutation.mutate(formData);
    }
  };

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    setFormData((prev) => ({
      ...prev,
      delayMs: next ? 20 * 1000 : 3 * 24 * 60 * 60 * 1000,
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ash hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-6 hairline-b">
        <span className="font-mono text-xs uppercase tracking-widest text-signal font-bold">
          Step {step} of 3 &bull; Configuration Wizard
        </span>
        <Display variant="h1" className="uppercase mt-1">
          New Follow-up Sentinel
        </Display>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, title: 'Position' },
          { num: 2, title: 'Context' },
          { num: 3, title: 'Cadence' },
        ].map((s) => (
          <div
            key={s.num}
            className={`hairline p-3 ${
              step === s.num
                ? 'bg-ink text-paper shadow-hard'
                : step > s.num
                ? 'bg-bone text-ink'
                : 'bg-paper text-ash'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider font-bold">
              <span>0{s.num} / {s.title}</span>
              {step > s.num && <Check className="w-3.5 h-3.5 text-moss" />}
            </div>
          </div>
        ))}
      </div>

      {/* Error banner if general error */}
      {errors.general && (
        <div className="hairline p-4 bg-status-failed/10 border-status-failed text-status-failed font-mono text-xs">
          {errors.general}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="hairline p-8 md:p-12 bg-paper shadow-hard space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <Display variant="h2" className="uppercase">
              Target Position Details
            </Display>
            <Text variant="body" className="text-ash">
              Specify the organization and the position you applied for.
            </Text>

            <div className="space-y-6 max-w-xl pt-2">
              <Field
                label="Target Company"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
                placeholder="e.g. Stripe, Linear, Datadog"
                error={errors.company}
              />

              <Field
                label="Role Title"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="e.g. Software Engineering Intern"
                error={errors.role}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Display variant="h2" className="uppercase">
              Recruiter &amp; Initial Context
            </Display>
            <Text variant="body" className="text-ash">
              Your message context stays 100% local on device. Gemma uses this to draft authentic follow-ups.
            </Text>

            <div className="space-y-6 max-w-xl pt-2">
              <Field
                label="Recruiter / Contact Name"
                required
                value={formData.recruiterName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, recruiterName: e.target.value }))
                }
                placeholder="e.g. Sarah Connor"
                error={errors.recruiterName}
              />

              <Field
                label="Recruiter Contact Handle or Email"
                value={formData.recruiterContact || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, recruiterContact: e.target.value }))
                }
                placeholder="e.g. sarah@company.com or linkedin.com/in/sarah"
                hint="optional"
              />

              <Field
                as="select"
                label="Outreach Channel"
                value={formData.outreachChannel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    outreachChannel: e.target.value as 'email' | 'linkedin' | 'other',
                  }))
                }
                options={[
                  { label: 'Email', value: 'email' },
                  { label: 'LinkedIn InMail / Message', value: 'linkedin' },
                  { label: 'Other Channel', value: 'other' },
                ]}
              />

              <Field
                as="textarea"
                label="Initial Outreach Summary / Talking Points"
                required
                value={formData.outreachContext}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, outreachContext: e.target.value }))
                }
                placeholder="e.g. Met at MIT career fair. Sent resume discussing backend distributed systems and SQLite replication performance."
                error={errors.outreachContext}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Display variant="h2" className="uppercase">
              Cadence &amp; Sentinel Parameters
            </Display>

            {/* Demo mode switch button */}
            <div className="p-4 bg-bone hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${isDemoMode ? 'text-signal' : 'text-ash'}`} />
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                    Demo Time-Skip Mode
                  </span>
                  <span className="text-xs text-ash">
                    {isDemoMode
                      ? 'Delays measured in seconds (fast presentation demo).'
                      : 'Delays measured in standard days for real career outreach.'}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant={isDemoMode ? 'signal' : 'secondary'}
                size="sm"
                onClick={toggleDemoMode}
              >
                {isDemoMode ? 'Demo Mode: ON (20s)' : 'Demo Mode: OFF (3d)'}
              </Button>
            </div>

            <div className="space-y-6 max-w-xl pt-2">
              <Field
                as="select"
                label="Maximum Follow-up Stages"
                value={formData.maxFollowUps}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxFollowUps: Number(e.target.value),
                  }))
                }
                options={[
                  { label: '1 Stage (Single follow-up nudge)', value: 1 },
                  { label: '2 Stages (Standard cadence)', value: 2 },
                  { label: '3 Stages (Extended persistence)', value: 3 },
                ]}
                error={errors.maxFollowUps}
              />

              <Field
                label={isDemoMode ? 'Delay (Seconds)' : 'Delay (Days)'}
                type="number"
                value={
                  isDemoMode
                    ? Math.round(formData.delayMs / 1000)
                    : Math.round(formData.delayMs / (24 * 60 * 60 * 1000))
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    delayMs: isDemoMode ? val * 1000 : val * 24 * 60 * 60 * 1000,
                  }));
                }}
              />
            </div>
          </div>
        )}

        <Hairline color="ash" />

        {/* Wizard Controls */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button type="button" variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="signal"
              size="lg"
              isLoading={mutation.isPending}
              rightIcon={<Zap className="w-4 h-4" />}
            >
              Arm Follow-up Sentinel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
