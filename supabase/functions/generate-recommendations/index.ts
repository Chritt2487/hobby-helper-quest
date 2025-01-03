import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOpenAIResponse } from "./openai.ts";
import { corsHeaders, generatePrompt, validateActivities } from "./utils.ts";
import type { UserAnswers, RecommendationsResponse } from "./types.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-recommendations function');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    const { answers, existingActivities = [] } = await req.json() as { 
      answers: UserAnswers;
      existingActivities?: string[];
    };
    console.log('Received answers:', answers);
    console.log('Existing activities:', existingActivities);
    
    const prompt = generatePrompt(answers, existingActivities);
    const gptData = await generateOpenAIResponse(openAIApiKey, prompt);
    console.log('Received response from OpenAI:', gptData);

    if (!gptData.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', gptData);
      throw new Error('OpenAI response missing required content');
    }

    let recommendations: RecommendationsResponse;
    try {
      const content = gptData.choices[0].message.content.trim();
      console.log('Attempting to parse content:', content);
      recommendations = JSON.parse(content);
      
      validateActivities(recommendations.activities);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error(`Invalid response format from OpenAI: ${error.message}`);
    }

    // Add placeholder images
    const activitiesWithImages = recommendations.activities.map(activity => ({
      ...activity,
      imageUrl: '/placeholder.svg',
    }));

    console.log('Sending response with activities:', activitiesWithImages);
    return new Response(
      JSON.stringify({ activities: activitiesWithImages }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate recommendations',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});