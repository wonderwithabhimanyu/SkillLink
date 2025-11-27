import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, questionnaire_responses } = await req.json();

    if (!user_id || !questionnaire_responses) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userSkills } = await supabase
      .from('user_skills_teaching')
      .select('skill_id, skills(category)')
      .eq('user_id', user_id);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .or(`teacher_id.eq.${user_id},learner_id.eq.${user_id}`);

    const { data: reviews } = await supabase
      .from('session_reviews')
      .select('tags')
      .eq('reviewee_id', user_id);

    const skillDNA = generateSkillDNA(
      questionnaire_responses,
      userSkills || [],
      sessions || [],
      reviews || []
    );

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ skill_dna_profile: skillDNA })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ skill_dna: skillDNA }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSkillDNA(
  questionnaire: any,
  userSkills: any[],
  sessions: any[],
  reviews: any[]
) {
  const skillCategories = userSkills.reduce((acc: any, skill: any) => {
    const category = skill.skills?.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const techSkills = skillCategories['Technology'] || 0;
  const creativeSkills = skillCategories['Arts'] + skillCategories['Design'] + skillCategories['Music'] || 0;
  const businessSkills = skillCategories['Business'] || 0;

  const technical_aptitude = Math.min(
    10,
    Math.round(
      (questionnaire.enjoys_problem_solving || 5) * 0.4 +
      (techSkills * 2) +
      (questionnaire.technical_comfort || 5) * 0.3
    )
  );

  const creative_thinking = Math.min(
    10,
    Math.round(
      (questionnaire.enjoys_creative_work || 5) * 0.4 +
      (creativeSkills * 2) +
      (questionnaire.artistic_interest || 5) * 0.3
    )
  );

  const analytical_skills = Math.min(
    10,
    Math.round(
      (questionnaire.enjoys_data_analysis || 5) * 0.4 +
      (questionnaire.logical_thinking || 5) * 0.4
    )
  );

  const allTags = reviews.flatMap((r: any) => r.tags || []);
  const communicationTags = ['clear', 'patient', 'articulate', 'responsive'];
  const communicationScore = allTags.filter((tag: string) => 
    communicationTags.includes(tag.toLowerCase())
  ).length;

  const communication = Math.min(
    10,
    Math.round(
      (questionnaire.communication_comfort || 5) * 0.5 +
      communicationScore * 0.5 +
      (sessions.length > 10 ? 2 : 0)
    )
  );

  const leadership = Math.min(
    10,
    Math.round(
      (questionnaire.enjoys_teaching || 5) * 0.4 +
      (sessions.filter((s: any) => s.teacher_id === questionnaire.user_id).length * 0.2) +
      (questionnaire.leadership_experience || 5) * 0.3
    )
  );

  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((acc: number, s: any) => {
        if (s.actual_start && s.actual_end) {
          return acc + (new Date(s.actual_end).getTime() - new Date(s.actual_start).getTime());
        }
        return acc;
      }, 0) / sessions.length / (1000 * 60)
    : 45;

  const learning_speed = avgSessionDuration < 30 ? 'fast' : avgSessionDuration > 60 ? 'slow' : 'moderate';

  const preferred_learning_time = questionnaire.preferred_time_slots || ['morning', 'afternoon'];

  const interests = Object.keys(skillCategories).slice(0, 5);

  const personality_traits: string[] = [];
  if (technical_aptitude >= 7) personality_traits.push('analytical');
  if (creative_thinking >= 7) personality_traits.push('creative');
  if (communication >= 7) personality_traits.push('social');
  if (leadership >= 7) personality_traits.push('leader');
  if (questionnaire.detail_oriented) personality_traits.push('detail-oriented');

  return {
    technical_aptitude,
    creative_thinking,
    analytical_skills,
    communication,
    leadership,
    learning_speed,
    preferred_learning_time,
    interests,
    personality_traits,
    last_updated: new Date().toISOString(),
  };
}
