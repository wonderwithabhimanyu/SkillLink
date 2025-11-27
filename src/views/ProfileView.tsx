import { useState, useEffect } from 'react';
import { User, Mail, School, Calendar, Award, Coins, TrendingUp, Edit2, CheckCircle, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const ProfileView = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    badges: 0,
    certificates: 0,
    totalEarned: 0,
  });
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadBadges();
    }
  }, [user]);

  const loadStats = async () => {
    const [badgesRes, certsRes, transRes] = await Promise.all([
      supabase.from('user_badges').select('*').eq('user_id', user?.id),
      supabase.from('certificates').select('*').eq('user_id', user?.id),
      supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('transaction_type', 'session_earning'),
    ]);

    const totalEarned = transRes.data?.reduce((sum, t) => sum + t.amount, 0) || 0;

    setStats({
      badges: badgesRes.data?.length || 0,
      certificates: certsRes.data?.length || 0,
      totalEarned,
    });
  };

  const loadBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', user?.id);
    if (data) setBadges(data);
  };

  const skillDNA = profile?.skill_dna_profile || {};
  const dnaTraits = [
    { name: 'Technical', value: skillDNA.technical_aptitude || 0 },
    { name: 'Creative', value: skillDNA.creative_thinking || 0 },
    { name: 'Analytical', value: skillDNA.analytical_skills || 0 },
    { name: 'Communication', value: skillDNA.communication || 0 },
    { name: 'Leadership', value: skillDNA.leadership || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white bg-opacity-20 flex items-center justify-center">
                  <User size={40} />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                  {profile?.verified_teacher && (
                    <CheckCircle className="text-white" size={24} />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-blue-100 mb-2">
                  <Mail size={16} />
                  <span>{profile?.email}</span>
                </div>
                {profile?.branch && (
                  <div className="flex items-center space-x-2 text-blue-100">
                    <School size={16} />
                    <span>{profile.branch} - Year {profile.year}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <Flame className="text-amber-300" size={24} />
                <div>
                  <div className="text-2xl font-bold">{profile?.streak_days || 0}</div>
                  <div className="text-xs text-blue-100">Day Streak</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <Coins className="text-amber-300" size={24} />
                <div>
                  <div className="text-2xl font-bold">{profile?.skill_coins || 0}</div>
                  <div className="text-xs text-blue-100">Skill Coins</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: TrendingUp,
              label: 'Rating',
              value: profile?.rating?.toFixed(1) || '0.0',
              color: 'green',
            },
            {
              icon: Calendar,
              label: 'Sessions Taught',
              value: profile?.total_sessions_taught || 0,
              color: 'blue',
            },
            {
              icon: Calendar,
              label: 'Sessions Learned',
              value: profile?.total_sessions_learned || 0,
              color: 'purple',
            },
            {
              icon: Award,
              label: 'Badges Earned',
              value: stats.badges,
              color: 'amber',
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`text-${stat.color}-600`} size={24} />
                <span className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              Skill DNA Profile
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                <Edit2 size={20} />
              </button>
            </h2>

            <div className="space-y-4">
              {dnaTraits.map((trait, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{trait.name}</span>
                    <span className="text-sm font-bold text-blue-600">{trait.value}/10</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${(trait.value / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Learning Speed</span>
                <span className="font-medium capitalize">
                  {skillDNA.learning_speed || 'Moderate'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Personality Traits</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {(skillDNA.personality_traits || []).map((trait: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges & Achievements</h2>

            {badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center border-4 border-amber-200">
                      <Award className="text-amber-600" size={32} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{badge.badges?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="text-gray-300 mx-auto mb-3" size={48} />
                <p className="text-gray-600">No badges earned yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Complete sessions to earn your first badge
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Membership</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                Current Plan: <span className="font-bold text-blue-600 capitalize">{profile?.premium_tier || 'Free'}</span>
              </p>
              <p className="text-sm text-gray-500">
                Upgrade to Pro for unlimited sessions, priority matching, and exclusive features
              </p>
            </div>
            {profile?.premium_tier === 'free' && (
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
