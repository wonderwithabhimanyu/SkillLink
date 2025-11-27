import { useState, useEffect } from 'react';
import { Plus, BookOpen, GraduationCap, Edit2, Trash2, Coins } from 'lucide-react';
import { supabase, Skill, UserSkillTeaching, UserSkillLearning } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const MySkillsView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'teaching' | 'learning'>('teaching');
  const [teachingSkills, setTeachingSkills] = useState<any[]>([]);
  const [learningSkills, setLearningSkills] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadTeachingSkills();
      loadLearningSkills();
      loadAllSkills();
    }
  }, [user]);

  const loadTeachingSkills = async () => {
    const { data } = await supabase
      .from('user_skills_teaching')
      .select(`
        *,
        skills (*)
      `)
      .eq('user_id', user?.id);
    if (data) setTeachingSkills(data);
  };

  const loadLearningSkills = async () => {
    const { data } = await supabase
      .from('user_skills_learning')
      .select(`
        *,
        skills (*)
      `)
      .eq('user_id', user?.id);
    if (data) setLearningSkills(data);
  };

  const loadAllSkills = async () => {
    const { data } = await supabase.from('skills').select('*').order('name');
    if (data) setAllSkills(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Skills</h1>
          <p className="text-lg text-gray-600">
            Manage the skills you teach and want to learn
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('teaching')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'teaching'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <GraduationCap size={20} />
                  <span>Teaching ({teachingSkills.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'learning'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen size={20} />
                  <span>Learning ({learningSkills.length})</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
            >
              <Plus size={20} />
              <span>Add {activeTab === 'teaching' ? 'Teaching' : 'Learning'} Skill</span>
            </button>

            {activeTab === 'teaching' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachingSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {skill.skills?.name}
                        </h3>
                        <p className="text-sm text-gray-600">{skill.skills?.category}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Proficiency</span>
                        <span className="font-medium capitalize bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          {skill.proficiency_level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rate</span>
                        <div className="flex items-center space-x-1 font-semibold text-amber-600">
                          <Coins size={16} />
                          <span>{skill.hourly_coin_rate}/hr</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Mode</span>
                        <span className="font-medium capitalize">{skill.teaching_mode}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sessions</span>
                        <span className="font-semibold text-green-600">{skill.total_sessions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-xl p-6 hover:border-green-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {skill.skills?.name}
                        </h3>
                        <p className="text-sm text-gray-600">{skill.skills?.category}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Priority</span>
                        <span className={`font-medium capitalize px-3 py-1 rounded-full ${
                          skill.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : skill.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {skill.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Level</span>
                        <span className="font-medium capitalize">{skill.current_level || 'Beginner'}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Target Level</span>
                        <span className="font-medium capitalize">{skill.target_level || 'Expert'}</span>
                      </div>

                      <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                        Find Teachers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((activeTab === 'teaching' && teachingSkills.length === 0) ||
              (activeTab === 'learning' && learningSkills.length === 0)) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'teaching' ? <GraduationCap size={48} className="mx-auto" /> : <BookOpen size={48} className="mx-auto" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab} skills yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your first skill to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
