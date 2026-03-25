import type { Email, StepAnalytics } from './types';
import type { CampaignDetail } from './instantly';

export function aggregateStepAnalytics(emails: Email[], campaignDetail?: CampaignDetail): StepAnalytics[] {
  const stepMap = new Map<string, {
    step: string;
    subject: string;
    sent: number;
  }>();

  for (const email of emails) {
    const key = email.step || '0_0_0';
    if (!stepMap.has(key)) {
      stepMap.set(key, {
        step: key,
        subject: email.subject || '',
        sent: 0,
      });
    }
    const agg = stepMap.get(key)!;
    agg.sent++;
  }

  // Parse step field and resolve subjects from campaign detail
  const steps: StepAnalytics[] = Array.from(stepMap.values()).map((s) => {
    const parts = s.step.split('_').map(Number);
    const seqIdx = parts[0] || 0;
    const stepIdx = parts[1] || 0;
    const variantIdx = parts[2] || 0;

    // Get subject from campaign detail: sequences[seqIdx].steps[stepIdx].variants[variantIdx].subject
    let subject = s.subject;
    const variant = campaignDetail?.sequences?.[seqIdx]?.steps?.[stepIdx]?.variants?.[variantIdx];
    if (variant?.subject) {
      subject = variant.subject;
    }

    return {
      step: s.step,
      stepNumber: stepIdx + 1, // 1-based
      subject: subject || `Step ${stepIdx + 1}`,
      sentCount: s.sent,
      openedCount: 0,
      openRate: 0,
      replyCount: 0,
      clickCount: 0,
      isBestOpen: false,
      isWorstOpen: false,
      isBestReply: false,
      isWorstReply: false,
    };
  });

  // Sort by step number
  steps.sort((a, b) => a.stepNumber - b.stepNumber);

  return steps;
}
