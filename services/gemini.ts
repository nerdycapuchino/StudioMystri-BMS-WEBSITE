
// This service has been disabled to prevent dependency errors and crashes.
// All content generation is now handled via local templates in the Marketing component.

export const generateMarketingContent = async (
  topic: string,
  targetAudience: string,
  channel: 'Email' | 'WhatsApp'
): Promise<string> => {
  // Return a static mock response
  return `(Templates Mode - AI Disabled)\n\nSubject: Exclusive Offer on ${topic}!\n\nHi ${targetAudience},\n\nWe are excited to introduce our latest ${topic} collection designed just for you. Visit Studio Mystri today!`;
};
