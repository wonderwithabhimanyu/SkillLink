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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'POST' && action === 'create') {
      const sessionData = await req.json();

      const { data: learner } = await supabase
        .from('profiles')
        .select('skill_coins')
        .eq('id', sessionData.learner_id)
        .maybeSingle();

      if (!learner || learner.skill_coins < sessionData.coin_amount) {
        return new Response(
          JSON.stringify({ error: 'Insufficient skill coins' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert([
        {
          user_id: sessionData.teacher_id,
          notification_type: 'session_request',
          title: 'New Session Request',
          body: 'You have a new learning session request',
          data: { session_id: session.id },
        },
        {
          user_id: sessionData.learner_id,
          notification_type: 'session_created',
          title: 'Session Scheduled',
          body: 'Your learning session has been scheduled',
          data: { session_id: session.id },
        },
      ]);

      return new Response(
        JSON.stringify({ session }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST' && action === 'complete') {
      const { session_id } = await req.json();

      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .maybeSingle();

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('sessions')
        .update({ status: 'completed', actual_end: new Date().toISOString() })
        .eq('id', session_id);

      await supabase.rpc('process_session_completion', { session_uuid: session_id });

      await supabase.from('notifications').insert([
        {
          user_id: session.teacher_id,
          notification_type: 'session_completed',
          title: 'Session Completed',
          body: 'Please leave a review for your student',
          data: { session_id: session.id },
        },
        {
          user_id: session.learner_id,
          notification_type: 'session_completed',
          title: 'Session Completed',
          body: 'Please leave a review for your teacher',
          data: { session_id: session.id },
        },
      ]);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
