import { useState, useEffect } from 'react';
import { Search, Filter, Star, Coins, MapPin, Video, User as UserIcon, CheckCircle } from 'lucide-react';
import { supabase, Skill } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const FindTeachersView = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    gender: '',
    branch: '',
    year: '',
    learning_mode: '',
    min_rating: 0,
    max_coin_rate: 1000,
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('popularity_score', { ascending: false });
    if (data) setSkills(data);
  };

  const findMatches = async () => {
    if (!selectedSkill || !user) return;

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-skill-matcher`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learner_id: user.id,
          skill_id: selectedSkill,
          filters,
        }),
      });

      const result = await response.json();
      setMatches(result.matches || []);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Teacher</h1>
          <p className="text-lg text-gray-600">
            AI-powered matching to connect you with the best mentors
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to learn?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={20} />
              <span className="font-medium">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Mode</label>
                <select
                  value={filters.learning_mode}
                  onChange={(e) => setFilters({ ...filters, learning_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating: {filters.min_rating}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.min_rating}
                  onChange={(e) => setFilters({ ...filters, min_rating: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select a skill
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {filteredSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill.id)}
                  className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                    selectedSkill === skill.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs text-gray-500">{skill.category}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={findMatches}
            disabled={!selectedSkill || loading}
            className="mt-6 w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Finding Matches...' : 'Find Teachers'}
          </button>
        </div>

        {matches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Top Matches for You ({matches.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {match.teacher_avatar ? (
                        <img
                          src={match.teacher_avatar}
                          alt={match.teacher_name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserIcon className="text-white" size={24} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900">{match.teacher_name}</h3>
                          {match.verified_teacher && (
                            <CheckCircle className="text-blue-600" size={16} />
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Star className="text-amber-500" size={14} fill="currentColor" />
                          <span>{match.teacher_rating.toFixed(1)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{match.total_sessions} sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Match Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${match.match_score}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-green-600">{match.match_score}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Proficiency</span>
                      <span className="font-medium capitalize">{match.proficiency_level}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mode</span>
                      <div className="flex items-center space-x-1">
                        {match.teaching_mode === 'online' || match.teaching_mode === 'both' ? (
                          <Video size={16} className="text-blue-600" />
                        ) : null}
                        {match.teaching_mode === 'in-person' || match.teaching_mode === 'both' ? (
                          <MapPin size={16} className="text-green-600" />
                        ) : null}
                        <span className="font-medium capitalize">{match.teaching_mode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-1 text-amber-600 font-semibold">
                      <Coins size={18} />
                      <span>{match.hourly_coin_rate}/hr</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && matches.length === 0 && selectedSkill && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your filters or selecting a different skill</p>
          </div>
        )}
      </div>
    </div>
  );
};
