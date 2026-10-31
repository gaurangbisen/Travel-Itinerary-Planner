import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoUser } = useAuth();

  const scenarios = [
    {
      id: 't-solo-tokyo-001',
      title: 'Solo Explorer & Ramen Trails',
      destination: 'Tokyo, Japan',
      type: 'solo',
      userEmail: 'alex@wayfare.ai',
      badge: 'Solo Scenario',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600',
      dates: 'Nov 10 – Nov 12 (3 Days)',
      budget: '$850 Budget',
      pace: 'Moderate Pace',
      description: 'Affordable, hyper-flexible solo route balancing vintage cafes in Shimokitazawa, solo dining ramen booths, and Shibuya sunset observatory.',
      highlights: ['Solo dining booths', 'Clustered walkable stops', 'Subway logistics'],
    },
    {
      id: 't-couple-paris-002',
      title: 'Romantic Paris & Seine River Sunset',
      destination: 'Paris, France',
      type: 'couple',
      userEmail: 'elena.leo@wayfare.ai',
      badge: 'Couple Scenario',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
      dates: 'Nov 20 – Nov 23 (4 Days)',
      budget: '$2,400 Budget',
      pace: 'Relaxed Pace',
      description: 'Leisurely couples getaway featuring private Seine champagne cruise, candlelit Latin Quarter bistros, and golden hour Louvre courtyard strolls.',
      highlights: ['Scenic sunset viewpoints', 'Boutique dining', 'Relaxed morning pace'],
    },
    {
      id: 't-group-barcelona-003',
      title: 'Barcelona Friends Getaway & Beach',
      destination: 'Barcelona, Spain',
      type: 'group',
      userEmail: 'group.lead@wayfare.ai',
      badge: 'Group Scenario',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
      dates: 'Nov 25 – Nov 27 (3 Days)',
      budget: '$1,800 Split ($450/pp)',
      pace: 'Fast-Paced',
      description: 'High-energy trip for 4 friends balancing shared paella pans, Gothic Quarter bar hopping, paddleboarding, and multi-preference dietary harmony.',
      highlights: ['Member preference merge', 'Split cost tracker', 'Group table bookings'],
    },
  ];

  const handleLaunchScenario = async (scenario: typeof scenarios[0]) => {
    await switchDemoUser(scenario.userEmail);
    navigate(`/trips/${scenario.id}`);
  };

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-6 shadow-xs animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Intelligent Multi-Stop AI Itinerary Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          AI Travel Itineraries Engineered for Real Life.
        </h1>

        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Realistic timings, geographically clustered stops, meal synchronization, drag-and-drop timeline reordering, and live budget tracking for solo, couple, and group trips.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/builder')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Create Custom Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <span>Explore Dashboard</span>
          </button>
        </div>
      </section>

      {/* 3 Pre-Tuned Scenarios Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pre-Tuned Scenarios: Pick Your Travel Persona
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Test drive our AI planner tuned for different dynamics, constraints, and budgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={sc.image}
                  alt={sc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{sc.destination}</span>
                  </div>
                  <h3 className="text-lg font-extrabold truncate mt-0.5">{sc.title}</h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sc.dates}</span>
                    </div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">
                      {sc.budget}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sc.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {sc.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchScenario(sc)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  <span>Launch This Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Geographic Clustering</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Minimizes criss-crossing transit by organizing each day around coherent neighborhoods.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Meal Synchronization</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Automatically anchors lunch at 12:30 and dinner at 19:30 with appropriate dining durations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Cost Tracker</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Recharts breakdowns by category, daily spending, per-person splits, and over-budget alerts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Drag & Lock Itinerary</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              dnd-kit drag-and-drop, 3 AI alternatives per stop, and lock items against day regeneration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
