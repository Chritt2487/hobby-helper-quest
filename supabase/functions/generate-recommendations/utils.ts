import { Activity, UserAnswers } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function generatePrompt(answers: UserAnswers, existingActivities: string[] = []): string {
  const activityLevelGuide = {
    low: "very light physical effort, relaxing activities",
    moderate: "some physical movement, balanced energy level",
    high: "significant physical effort, energetic activities"
  };

  const budgetGuide = {
    Free: "no cost required",
    Cheap: "under $20",
    Moderate: "$20-100",
    Expensive: "over $100"
  };

  const timeGuide = {
    "Short (<1 hour)": "activities that take less than 1 hour",
    "Medium (1-3 hours)": "activities that take 1-3 hours",
    "Long (3+ hours)": "activities that take more than 3 hours"
  };

  const refinementContext = answers.isRefined 
    ? `
    Additional strict requirements:
    - Competitiveness Level: ${answers.competitiveness}
      * NonCompetitive: focus on personal enjoyment only
      * MildlyCompetitive: light friendly competition
      * VeryCompetitive: strong competitive element
    - Learning Curve: ${answers.learningCurve}
      * Quick: can be learned in one session
      * Moderate: requires a few sessions to get comfortable
      * Gradual: requires consistent practice
    - Time of Day: ${answers.timeOfDay}
      * Must be suitable for ${answers.timeOfDay.toLowerCase()} hours
    - Structure: ${answers.structure}
      * Structured: clear rules and guidelines
      * Flexible: room for creativity
      * Mixed: combination of both`
    : '';

  return `Generate 4 activity recommendations that STRICTLY match these requirements:

    Core Requirements (ALL must be met):
    - Activity Type: ${answers.activityType}
    - Environment: ${answers.environment} activities only
    - Energy Level: ${answers.activityLevel} (${activityLevelGuide[answers.activityLevel]})
    - Time Commitment: ${answers.timeCommitment} (${timeGuide[answers.timeCommitment]})
    - Budget: ${answers.budget} (${budgetGuide[answers.budget]})
    - Social Setting: ${answers.social} activities only
    ${refinementContext}

    IMPORTANT:
    1. Do NOT include any of these existing activities: ${existingActivities.join(', ')}
    2. Each activity MUST strictly adhere to ALL requirements above
    3. Activities should be specific and actionable
    4. Include practical tips for implementation

    Return ONLY a valid JSON object with this exact structure:
    {
      "activities": [
        {
          "name": "Specific Activity Name",
          "description": "Detailed description (2-3 sentences)",
          "tips": ["3-4 practical tips for getting started"]
        }
      ]
    }`;
}

export function validateActivities(activities: Activity[]): void {
  if (!Array.isArray(activities)) {
    throw new Error('Response missing activities array');
  }
  
  if (activities.length !== 4) {
    throw new Error('Expected exactly 4 activities');
  }
  
  activities.forEach((activity, index) => {
    if (!activity.name || !activity.description || !Array.isArray(activity.tips)) {
      throw new Error(`Activity at index ${index} has invalid structure`);
    }
    
    if (activity.tips.length < 2) {
      throw new Error(`Activity at index ${index} must have at least 2 tips`);
    }
    
    if (activity.description.split('.').length < 2) {
      throw new Error(`Activity at index ${index} description must be at least 2 sentences`);
    }
  });
}