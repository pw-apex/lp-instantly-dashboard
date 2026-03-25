import type { Email, StepAnalytics } from './types';

export function aggregateStepAnalytics(emails: Email[], campaignDetail?: { sequences?: Array<{ steps: Array<{ subject: string }> }> }): StepAnalytics[] {
  const stepMap = new Map<string, {
    step: string;
    subject: string;
    sent: number;
    opened: number;
    replied: number;
    clicked: number;
  }>();

  for (const email of emails) {
    const key = email.step || '0_0_0';
    if (!stepMap.has(key)) {
      stepMap.set(key, {
        step: key,
        subject: email.subject || '',
        sent: 0,
        opened: 0,
        replied: 0,
        clicked: 0,
      });
    }
    const agg = stepMap.get(key)!;
    agg.sent++;
    if (email.is_opened) agg.opened++;
    if (email.is_replied) agg.replied++;
    if (email.is_clicked) agg.clicked++;
  }

  // Parse step field and resolve subjects from campaign detail
  const steps: StepAnalytics[] = Array.from(stepMap.values()).map((s) => {
    const parts = s.step.split('_').map(Number);
    const seqIdx = parts[0] || 0;
    const stepIdx = parts[1] || 0;

    // Try to get subject from campaign detail sequences
    let subject = s.subject;
    if (campaignDetail?.sequences?.[seqIdx]?.steps?.[stepIdx]?.subject) {
      subject = campaignDetail.sequences[seqIdx].steps[stepIdx].subject;
    }

    const openRate = s.sent > 0 ? (s.opened / s.sent) * 100 : 0;

    return {
      step: s.step,
      stepNumber: stepIdx + 1, // 1-based
      subject: subject || `Step ${stepIdx + 1}`,
      sentCount: s.sent,
      openedCount: s.opened,
      openRate,
      replyCount: s.replied,
      clickCount: s.clicked,
      isBestOpen: false,
      isWorstOpen: false,
      isBestReply: false,
      isWorstReply: false,
    };
  });

  // Sort by step number
  steps.sort((a, b) => a.stepNumber - b.stepNumber);

  // Mark best/worst
  if (steps.length > 1) {
    const withSent = steps.filter(s => s.sentCount > 0);
    if (withSent.length > 1) {
      const bestOpen = withSent.reduce((a, b) => a.openRate > b.openRate ? a : b);
      const worstOpen = withSent.reduce((a, b) => a.openRate < b.openRate ? a : b);
      bestOpen.isBestOpen = true;
      worstOpen.isWorstOpen = true;

      const replyRates = withSent.map(s => s.sentCount > 0 ? s.replyCount / s.sentCount : 0);
      const maxReply = Math.max(...replyRates);
      const minReply = Math.min(...replyRates);
      const bestReplyIdx = replyRates.indexOf(maxReply);
      const worstReplyIdx = replyRates.indexOf(minReply);
      if (bestReplyIdx >= 0) withSent[bestReplyIdx].isBestReply = true;
      if (worstReplyIdx >= 0) withSent[worstReplyIdx].isWorstReply = true;
    }
  }

  return steps;
}
