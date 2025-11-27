import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MatchRequest {
  learner_id: string;
  skill_id: string;
  filters?: {
    gender?: string;
    branch?: string;
    year?: number;
    learning_mode?: string;
    min_rating?: number;
    max_coin_rate?: number;
  };
}

interface TeacherProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  gender?: string;
  branch?: string;
  year?: number;
  rating: number;
  verified_teacher: boolean;
  skill_dna_profile: any;
  preferences: any;
  languages?: string[];
}

interface TeachingSkill {
  user_id: string;
  proficiency_level: string;
  hourly_coin_rate: number;
  teaching_mode: string;
  total_sessions: number;
  average_rating: number;
  availability: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { learner_id, skill_id, filters }: MatchRequest = await req.json();

    const { data: learnerProfile, error: learnerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', learner_id)
      .maybeSingle();

    if (learnerError || !learnerProfile) {
      return new Response(
        JSON.stringify({ error: 'Learner not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let teachersQuery = supabase
      .from('user_skills_teaching')
      .select(`
        *,
        profiles!user_skills_teaching_user_id_fkey (*)
      `)
      .eq('skill_id', skill_id)
      .neq('user_id', learner_id);

    const { data: teachers, error: teachersError } = await teachersQuery;

    if (teachersError || !teachers || teachers.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No teachers found for this skill' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const matches = teachers
      .map((teachingSkill: any) => {
        const teacher = teachingSkill.profiles;
        if (!teacher) return null;

        if (filters?.gender && teacher.gender !== filters.gender) return null;
        if (filters?.branch && teacher.branch !== filters.branch) return null;
        if (filters?.year && teacher.year !== filters.year) return null;
        if (filters?.min_rating && teacher.rating < filters.min_rating) return null;
        if (filters?.max_coin_rate && teachingSkill.hourly_coin_rate > filters.max_coin_rate) return null;
        if (filters?.learning_mode && teachingSkill.teaching_mode !== 'both' && teachingSkill.teaching_mode !== filters.learning_mode) return null;

        const matchScore = calculateMatchScore(learnerProfile, teacher, teachingSkill);

        return {
          teacher_id: teacher.id,
          teacher_name: teacher.full_name,
          teacher_avatar: teacher.avatar_url,
          teacher_rating: teacher.rating,
          verified_teacher: teacher.verified_teacher,
          hourly_coin_rate: teachingSkill.hourly_coin_rate,
          proficiency_level: teachingSkill.proficiency_level,
          teaching_mode: teachingSkill.teaching_mode,
          total_sessions: teachingSkill.total_sessions,
          match_score: matchScore.total,
          compatibility_factors: matchScore.factors,
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);

    for (const match of matches) {
      await supabase.from('skill_matches').insert({
        learner_id,
        teacher_id: match.teacher_id,
        skill_id,
        match_score: match.match_score,
        compatibility_factors: match.compatibility_factors,
        status: 'pending',
      });
    }

    return new Response(
      JSON.stringify({ matches }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateMatchScore(learner: any, teacher: any, teachingSkill: any) {
  let total = 0;
  const factors: any = {};

  const ratingScore = (teacher.rating / 5) * 25;
  factors.rating_score = Math.round(ratingScore);
  total += ratingScore;

  const experienceScore = Math.min(teachingSkill.total_sessions * 2, 20);
  factors.experience_score = Math.round(experienceScore);
  total += experienceScore;

  const proficiencyMap = { beginner: 5, intermediate: 10, expert: 15 };
  const proficiencyScore = proficiencyMap[teachingSkill.proficiency_level as keyof typeof proficiencyMap] || 10;
  factors.proficiency_score = proficiencyScore;
  total += proficiencyScore;

  const verifiedBonus = teacher.verified_teacher ? 10 : 0;
  factors.verified_bonus = verifiedBonus;
  total += verifiedBonus;

  const dnaScore = calculateDNACompatibility(learner.skill_dna_profile, teacher.skill_dna_profile);
  factors.dna_compatibility = Math.round(dnaScore);
  total += dnaScore;

  const languageMatch = calculateLanguageMatch(learner.languages || [], teacher.languages || []);
  factors.language_match = Math.round(languageMatch);
  total += languageMatch;

  const learningStyleScore = calculateLearningStyleMatch(learner.learning_style, teacher.skill_dna_profile);
  factors.learning_style_match = Math.round(learningStyleScore);
  total += learningStyleScore;

  return {
    total: Math.min(Math.round(total), 100),
    factors,
  };
}

function calculateDNACompatibility(learnerDNA: any, teacherDNA: any): number {
  if (!learnerDNA || !teacherDNA) return 10;

  let score = 0;
  const traits = ['technical_aptitude', 'creative_thinking', 'analytical_skills', 'communication'];

  traits.forEach(trait => {
    if (learnerDNA[trait] && teacherDNA[trait]) {
      const diff = Math.abs(learnerDNA[trait] - teacherDNA[trait]);
      score += (10 - diff) / 2;
    }
  });

  return Math.max(0, score);
}

function calculateLanguageMatch(learnerLangs: string[], teacherLangs: string[]): number {
  if (learnerLangs.length === 0 || teacherLangs.length === 0) return 5;

  const commonLangs = learnerLangs.filter(lang => teacherLangs.includes(lang));
  return commonLangs.length > 0 ? 10 : 0;
}

function calculateLearningStyleMatch(learnerStyle: string, teacherDNA: any): number {
  if (!learnerStyle || !teacherDNA) return 5;

  const styleCompatibility: Record<string, string[]> = {
    visual: ['creative_thinking'],
    auditory: ['communication'],
    kinesthetic: ['technical_aptitude'],
    reading: ['analytical_skills'],
  };

  const relevantTraits = styleCompatibility[learnerStyle] || [];
  let score = 5;

  relevantTraits.forEach(trait => {
    if (teacherDNA[trait] && teacherDNA[trait] >= 7) {
      score += 2.5;
    }
  });

  return score;
}
