import { BookOpen, Users, Award, TrendingUp, Sparkles, Video } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
}

export const HomeView = ({ onNavigate, onAuthClick, isAuthenticated }: HomeViewProps) => {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">AI-Powered Skill Matching</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Learn. Teach. Grow.
              <br />
              <span className="text-blue-600">Together.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join your campus community in the ultimate skill-sharing platform. Exchange knowledge,
              earn skill coins, and unlock your potential with AI-powered matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => onNavigate('find')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    Find a Teacher
                  </button>
                  <button
                    onClick={() => onNavigate('skills')}
                    className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition"
                  >
                    Start Teaching
                  </button>
                </>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Get Started Free
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Users, label: '10,000+ Students', color: 'blue' },
              { icon: BookOpen, label: '500+ Skills', color: 'green' },
              { icon: Award, label: '50,000+ Sessions', color: 'amber' },
              { icon: TrendingUp, label: '4.8★ Average Rating', color: 'red' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <stat.icon className={`text-${stat.color}-600 mx-auto mb-3`} size={32} />
                <p className="text-2xl font-bold text-gray-900">{stat.label.split(' ')[0]}</p>
                <p className="text-gray-600">{stat.label.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How SkillLink Works
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to start your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Set up your profile and list skills you know and want to learn',
              },
              {
                step: '2',
                title: 'AI Matching',
                description: 'Our AI finds perfect matches based on your Skill DNA and preferences',
              },
              {
                step: '3',
                title: 'Book Sessions',
                description: 'Schedule video, chat, or in-person sessions with your matches',
              },
              {
                step: '4',
                title: 'Earn & Learn',
                description: 'Earn skill coins by teaching, spend them to learn new skills',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for peer-to-peer learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Skill DNA',
                description: 'Advanced AI analyzes your learning patterns and creates a unique Skill DNA profile for perfect matching',
              },
              {
                icon: Video,
                title: 'Video Sessions',
                description: 'High-quality video calls with screen sharing, recording, and interactive whiteboards',
              },
              {
                icon: Award,
                title: 'Gamification',
                description: 'Earn badges, maintain streaks, unlock achievements, and build your digital portfolio',
              },
              {
                icon: Users,
                title: 'Community Rooms',
                description: 'Join skill-based community rooms for group learning and networking',
              },
              {
                icon: TrendingUp,
                title: 'Smart Filters',
                description: 'Filter by gender, branch, year, mode, availability, language, and more',
              },
              {
                icon: BookOpen,
                title: 'Marketplace',
                description: 'Buy and sell courses, notes, tutorials, and resources using skill coins',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already learning and teaching on SkillLink
          </p>
          {!isAuthenticated && (
            <button
              onClick={onAuthClick}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-xl"
            >
              Create Free Account
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
