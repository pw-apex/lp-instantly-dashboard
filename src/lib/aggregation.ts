import type { Email, StepAnalytics } from './types';
import type { CampaignDetail } from './instantly';

export function aggregateStepAnalytics(
  sentEmails: Email[],
  receivedEmails: Email[],
  campaignDetail?: CampaignDetail
): StepAnalytics[] {
  // Count sent emails per step
  const sentMap = new Map<string, number>();
  for (const email of sentEmails) {
    const key = email.step || '0_0_0';
    sentMap.set(key, (sentMap.get(key) || 0) + 1);
  }

  // Count replies per step (received emails carry the step they're replying to)
  const replyMap = new Map<string, number>();
  for (const email of receivedEmails) {
    const key = email.step || '0_0_0';
    replyMap.set(key, (replyMap.get(key) || 0) + 1);
  }

  // Get all unique step keys
  const allSteps = new Set([...sentMap.keys(), ...replyMap.keys()]);

  // Build step analytics
  const steps: StepAnalytics[] = Array.from(allSteps).map((stepKey) => {
    const parts = stepKey.split('_').map(Number);
    const seqIdx = parts[0] || 0;
    const stepIdx = parts[1] || 0;
    const variantIdx = parts[2] || 0;

    // Get subject from campaign detail: sequences[seqIdx].steps[stepIdx].variants[variantIdx].subject
    let subject = `Step ${stepIdx + 1}`;
    const variant = campaignDetail?.sequences?.[seqIdx]?.steps?.[stepIdx]?.variants?.[variantIdx];
    if (variant?.subject) {
      subject = variant.subject;
    }

    // If subject is still generic, try to get it from a sent email with this step
    if (subject === `Step ${stepIdx + 1}`) {
      const sampleEmail = sentEmails.find(e => e.step === stepKey);
      if (sampleEmail?.subject) {
        subject = sampleEmail.subject;
      }
    }

    const sentCount = sentMap.get(stepKey) || 0;
    const replyCount = replyMap.get(stepKey) || 0;

    return {
      step: stepKey,
      stepNumber: stepIdx + 1,
      subject,
      sentCount,
      openedCount: 0, // Not available per-step from emails API
      openRate: 0,
      replyCount,
      clickCount: 0,
      isBestOpen: false,
      isWorstOpen: false,
      isBestReply: false,
      isWorstReply: false,
    };
  });

  // Sort by step number
  steps.sort((a, b) => a.stepNumber - b.stepNumber);

  // Mark best/worst reply rates
  if (steps.length > 1) {
    const withSent = steps.filter(s => s.sentCount > 10);
    if (withSent.length > 1) {
      const replyRates = withSent.map(s => s.replyCount / s.sentCount);
      const maxReply = Math.max(...replyRates);
      const minReply = Math.min(...replyRates);
      const bestIdx = replyRates.indexOf(maxReply);
      const worstIdx = replyRates.indexOf(minReply);
      if (bestIdx >= 0 && maxReply > 0) withSent[bestIdx].isBestReply = true;
      if (worstIdx >= 0 && worstIdx !== bestIdx) withSent[worstIdx].isWorstReply = true;
    }
  }

  return steps;
}
