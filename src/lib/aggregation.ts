import type { StepAnalytics, StepAnalyticsRaw } from './types';
import type { CampaignDetail } from './instantly';

export function aggregateStepAnalytics(
  rawSteps: StepAnalyticsRaw[],
  campaignDetail?: CampaignDetail
): StepAnalytics[] {
  if (!rawSteps || rawSteps.length === 0) return [];

  const steps: StepAnalytics[] = rawSteps.map((raw) => {
    const stepIdx = parseInt(raw.step, 10) || 0;
    const variantIdx = parseInt(raw.variant, 10) || 0;

    // Get subject from campaign detail: sequences[0].steps[stepIdx].variants[variantIdx].subject
    let subject = `Step ${stepIdx + 1}`;
    const variant = campaignDetail?.sequences?.[0]?.steps?.[stepIdx]?.variants?.[variantIdx];
    if (variant?.subject) {
      subject = variant.subject;
    }

    const openRate = raw.sent > 0 ? (raw.unique_opened / raw.sent) * 100 : 0;

    return {
      stepIndex: stepIdx,
      stepNumber: stepIdx + 1,
      variant: variantIdx,
      subject,
      sentCount: raw.sent,
      openedCount: raw.unique_opened,
      openRate,
      replyCount: raw.unique_replies,
      clickCount: raw.unique_clicks,
      opportunityCount: raw.unique_opportunities,
      isBestOpen: false,
      isWorstOpen: false,
    };
  });

  // Sort by step number then variant
  steps.sort((a, b) => a.stepIndex - b.stepIndex || a.variant - b.variant);

  // Mark best/worst open rates (only among steps with meaningful volume)
  if (steps.length > 1) {
    const withSent = steps.filter(s => s.sentCount > 10);
    if (withSent.length > 1) {
      const openRates = withSent.map(s => s.openRate);
      const maxOpen = Math.max(...openRates);
      const minOpen = Math.min(...openRates);
      const bestIdx = openRates.indexOf(maxOpen);
      const worstIdx = openRates.indexOf(minOpen);
      if (bestIdx >= 0 && maxOpen > 0) withSent[bestIdx].isBestOpen = true;
      if (worstIdx >= 0 && worstIdx !== bestIdx) withSent[worstIdx].isWorstOpen = true;
    }
  }

  return steps;
}
