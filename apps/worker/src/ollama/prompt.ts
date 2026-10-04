import {
  AIDraftOutput,
  AIDraftOutputSchema,
  PLACEHOLDER_TOKEN_REGEX,
  countWords,
  MAX_DRAFT_WORDS,
} from '@ghost-hunter/shared';

export interface PromptParams {
  company: string;
  role: string;
  recruiterName: string;
  outreachContext: string;
  stage: number;
  daysSince?: number;
  outreachChannel?: string;
}

/**
 * Extracts a friendly first name from a full name, stripping honorifics if present.
 */
export function extractFirstName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'there';
  }
  const clean = fullName.trim().replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+/i, '');
  const first = clean.split(/\s+/)[0];
  return first && first.length > 0 ? first : 'there';
}

/**
 * Builds system and user prompts with quarantined data and anti-hallucination constraints.
 */
export function buildPrompt(params: PromptParams): { system: string; user: string } {
  const firstName = extractFirstName(params.recruiterName);
  const daysSince = params.daysSince ?? (params.stage === 1 ? 3 : params.stage === 2 ? 7 : 14);
  const channel = params.outreachChannel || 'email';

  const system = `You are Ghost-Hunter, an expert career assistant that writes concise, polite, professional follow-up messages for job seekers.

CRITICAL RULES:
1. Output MUST be ONLY valid JSON matching this schema:
   {
     "subject": "string",
     "body": "string"
   }
2. The "body" MUST NOT exceed ${MAX_DRAFT_WORDS} words.
3. NEVER use placeholder tokens like [Name], [Company], [Role], <Name>, {Company}, etc. Always use the real data provided.
4. Do NOT hallucinate past interviews, phone screens, or promises that are not explicitly stated in the outreach context.
5. Address the recruiter directly by their first name (e.g., "Hi ${firstName},").
6. Tone: Warm, respectful, concise, and non-presumptive.
7. Conclude cleanly with "Best regards," without appending placeholder names like "[Your Name]" or "[Candidate Name]".
8. Stage guidelines:
   - Stage 1: Brief, polite follow-up reiterating interest in the position.
   - Stage 2: Gentle check-in, low pressure, asking if additional info or portfolio links are helpful.
   - Stage 3: Graceful final check-in, acknowledging busy schedules and keeping the door open for future opportunities.`;

  const user = `Draft a stage ${params.stage} follow-up message based ONLY on the following quarantined data:

<DATA>
Company: """${params.company}"""
Role: """${params.role}"""
Recruiter Full Name: """${params.recruiterName}"""
Recruiter First Name: """${firstName}"""
Outreach Channel: """${channel}"""
Follow-Up Stage: ${params.stage}
Days Since Initial Outreach: ${daysSince}
Candidate Original Outreach Context:
"""
${params.outreachContext}
"""
</DATA>

Return ONLY the JSON object. Do not include markdown code blocks or explanations.`;

  return { system, user };
}

/**
 * Parses and validates raw LLM output against the AIDraftOutputSchema.
 */
export function validateAndParseDraft(rawOutput: string): AIDraftOutput {
  if (!rawOutput || typeof rawOutput !== 'string') {
    throw new Error('AI output is empty or not a string');
  }

  // Strip markdown code fences if present (e.g. ```json ... ```)
  let cleaned = rawOutput.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Malformed AI JSON: ${(err as Error).message}. Raw output: ${rawOutput.slice(0, 100)}`);
  }

  // Sanitize trailing signature placeholders like "[Your Name]" or "[Candidate Name]"
  if (parsed && typeof parsed.body === 'string') {
    parsed.body = parsed.body.replace(/\s*\[(?:Your\s*Name|Candidate\s*Name|My\s*Name)\]\s*$/i, '').trim();
  }

  const result = AIDraftOutputSchema.safeParse(parsed);
  if (!result.success) {
    const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`AI Draft validation failed: ${errorMessages}`);
  }

  return result.data;
}

/**
 * Generates a dependable fallback template when the AI model is unavailable or outputs invalid data.
 */
export function generateFallbackTemplate(params: PromptParams): AIDraftOutput {
  const firstName = extractFirstName(params.recruiterName);
  const { company, role, stage } = params;

  let subject: string;
  let body: string;

  if (stage === 1) {
    subject = `Following up on ${role} application - ${company}`;
    body = `Hi ${firstName},\n\nI hope your week is going well. I wanted to quickly follow up on my recent note regarding the ${role} position at ${company}. I remain very enthusiastic about the opportunity to contribute to your team. Please let me know if you would like any additional information.\n\nBest regards`;
  } else if (stage === 2) {
    subject = `Re: ${role} application at ${company}`;
    body = `Hi ${firstName},\n\nI am checking in briefly regarding my application for the ${role} position at ${company}. I understand how busy hiring can be, so no pressure at all. I would still love to connect whenever time permits.\n\nThank you for your consideration,\nBest regards`;
  } else {
    subject = `Final follow-up: ${role} position - ${company}`;
    body = `Hi ${firstName},\n\nI am following up one last time regarding the ${role} position at ${company}. If the position has been filled or priorities have shifted, I completely understand. I would love to stay in touch for future opportunities.\n\nThank you again for your time,\nBest regards`;
  }

  // Double check template validity with schema to guarantee compliance
  return AIDraftOutputSchema.parse({ subject, body });
}
