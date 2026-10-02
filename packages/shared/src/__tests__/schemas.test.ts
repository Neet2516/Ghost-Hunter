import { describe, it, expect } from 'vitest';
import {
  CreateApplicationSchema,
  ApplicationSchema,
  AIDraftOutputSchema,
  DraftDecisionRequestSchema,
  ErrorResponseSchema,
  WorkflowStateResponseSchema,
  countWords
} from '../index.js';

describe('Shared Schemas Validation', () => {
  describe('CreateApplicationSchema', () => {
    it('should validate a valid application creation input', () => {
      const valid = {
        company: 'Stripe',
        role: 'Software Engineer Intern',
        recruiterName: 'Sarah Connor',
        recruiterContact: 'sarah@stripe.com',
        outreachChannel: 'email' as const,
        outreachContext: 'Followed up after career fair discussion regarding backend infrastructure.',
        delayMs: 86400000,
        maxFollowUps: 2
      };

      const result = CreateApplicationSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('Stripe');
        expect(result.data.maxFollowUps).toBe(2);
      }
    });

    it('should assign default values when optional config is omitted', () => {
      const minimal = {
        company: 'Linear',
        role: 'Founding Product Engineer',
        recruiterName: 'Karri Saarinen',
        outreachContext: 'Sent pitch note about issue tracking workflows.'
      };

      const result = CreateApplicationSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.outreachChannel).toBe('email');
        expect(result.data.delayMs).toBe(259200000); // 3 days default
        expect(result.data.maxFollowUps).toBe(2);
      }
    });

    it('should reject maxFollowUps greater than 3', () => {
      const invalid = {
        company: 'Google',
        role: 'SWE',
        recruiterName: 'Jane',
        outreachContext: 'Reached out via LinkedIn.',
        maxFollowUps: 5
      };

      const result = CreateApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('maxFollowUps');
      }
    });

    it('should reject maxFollowUps less than 1', () => {
      const invalid = {
        company: 'Google',
        role: 'SWE',
        recruiterName: 'Jane',
        outreachContext: 'Reached out via LinkedIn.',
        maxFollowUps: 0
      };

      const result = CreateApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject too short outreachContext', () => {
      const invalid = {
        company: 'Apple',
        role: 'iOS Engineer',
        recruiterName: 'Tim',
        outreachContext: 'Hi'
      };

      const result = CreateApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('AIDraftOutputSchema', () => {
    it('should accept valid draft with non-empty subject and concise body', () => {
      const valid = {
        subject: 'Quick follow-up on SWE role at Stripe',
        body: 'Hi Sarah, I wanted to quickly follow up on my note last week regarding the software engineering internship. I remains excited about Stripe’s infrastructure challenges and would love to connect whenever convenient. Best, Aarav'
      };

      const result = AIDraftOutputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject draft exceeding 120 words', () => {
      const longBody = new Array(125).fill('word').join(' ');
      const invalid = {
        subject: 'Following up',
        body: longBody
      };

      const result = AIDraftOutputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('exceeds maximum 120 words');
      }
    });

    it('should reject draft containing placeholder tokens', () => {
      const withBracketPlaceholder = {
        subject: 'Follow-up for [Role Name]',
        body: 'Hi [Recruiter Name], I am writing to check in on my application to [Company].'
      };

      const result = AIDraftOutputSchema.safeParse(withBracketPlaceholder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('placeholder tokens');
      }

      const withBracePlaceholder = {
        subject: 'Checking in',
        body: 'Hello {Recruiter}, hope you are doing well.'
      };
      expect(AIDraftOutputSchema.safeParse(withBracePlaceholder).success).toBe(false);
    });

    it('should reject empty subject or body', () => {
      expect(AIDraftOutputSchema.safeParse({ subject: '', body: 'Valid body' }).success).toBe(false);
      expect(AIDraftOutputSchema.safeParse({ subject: 'Valid subject', body: '' }).success).toBe(false);
    });
  });

  describe('DraftDecisionRequestSchema', () => {
    it('should accept valid decision actions', () => {
      expect(DraftDecisionRequestSchema.safeParse({ action: 'approve' }).success).toBe(true);
      expect(DraftDecisionRequestSchema.safeParse({ action: 'skip' }).success).toBe(true);
      expect(DraftDecisionRequestSchema.safeParse({ action: 'snooze' }).success).toBe(true);
      expect(
        DraftDecisionRequestSchema.safeParse({
          action: 'approve',
          editedBody: 'Edited follow-up text.'
        }).success
      ).toBe(true);
    });

    it('should reject invalid decision action', () => {
      expect(DraftDecisionRequestSchema.safeParse({ action: 'dismiss' }).success).toBe(false);
    });
  });

  describe('ErrorResponseSchema', () => {
    it('should validate structured error envelope', () => {
      const err = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          fields: {
            company: ['Company is required']
          }
        }
      };

      const result = ErrorResponseSchema.safeParse(err);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowStateResponseSchema', () => {
    it('should validate workflow state response', () => {
      const state = {
        workflowId: 'gh-123e4567-e89b-12d3-a456-426614174000',
        status: 'HUNTING' as const,
        subStatus: 'WAITING' as const,
        stage: 1,
        nextActionAt: new Date().toISOString(),
        draftId: null,
        repliedAt: null
      };

      const result = WorkflowStateResponseSchema.safeParse(state);
      expect(result.success).toBe(true);
    });
  });

  describe('countWords helper', () => {
    it('should correctly count words with varying whitespace', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  hello   world  from   test \n multiple lines ')).toBe(6);
    });
  });
});
