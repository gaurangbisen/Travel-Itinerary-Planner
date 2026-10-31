import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  User, 
  DollarSign, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Tag 
} from 'lucide-react';
import { api } from '../services/api';
import { TripType, TripPace } from '../types';

export const TripBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStage, setGeneratingStage] = useState<string>('Analyzing destination...');

  // Form Fields
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 17);
    return d.toISOString().split('T')[0];
  });
  const [travelers, setTravelers] = useState<number>(1);
  const [tripType, setTripType] = useState<TripType>('solo');
  const [budget, setBudget] = useState<number>(1200);
  const [pace, setPace] = useState<TripPace>('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Culture',
    'Foodie',
    'Photography',
  ]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Calculate day length
  const calculateDays = () => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
      return diff;
    } catch {
      return 3;
    }
  };

  const tripDaysCount = calculateDays();

  // Destination suggestions
  const quickDestinations = [
    'Tokyo, Japan',
    'Paris, France',
    'Barcelona, Spain',
    'Rome, Italy',
    'Kyoto, Japan',
    'New York, USA',
    'London, UK',
  ];

  const allInterests = [
    'Culture & History',
    'Foodie & Street Food',
    'Architecture',
    'Photography Spots',
    'Scenic Nature',
    'Nightlife & Bars',
    'Relaxation & Spas',
    'Adventure & Sports',
    'Vintage Shopping',
    'Art & Museums',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleTripTypeSelect = (type: TripType) => {
    setTripType(type);
    if (type === 'solo') {
      setTravelers(1);
    } else if (type === 'couple' && travelers < 2) {
      setTravelers(2);
    } else if (type === 'group' && travelers < 3) {
      setTravelers(4);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const finalTitle = title.trim() || `${tripDaysCount}-Day ${destination || 'Explorer'} Itinerary`;

    try {
      setGeneratingStage('Creating trip profile...');
      const createdTrip = await api.createTrip({
        title: finalTitle,
        destination: destination || 'Tokyo, Japan',
        start_date: startDate,
        end_date: endDate,
        travelers: travelers,
        trip_type: tripType,
        budget: Number(budget),
        budget_currency: 'USD',
        pace: pace,
        interests: selectedInterests,
        status: 'planned',
      });

      // Animated progress stages for realistic UX
      setGeneratingStage('Clustering coordinates and stops...');
      await new Promise(r => setTimeout(r, 600));

      setGeneratingStage('Optimizing meal anchors & transit times...');
      await new Promise(r => setTimeout(r, 600));

      setGeneratingStage('Validating strict Pydantic itinerary schema...');
      await api.generateItinerary(createdTrip.id, customPrompt);

      setGeneratingStage('Itinerary ready!');
      await new Promise(r => setTimeout(r, 400));

      navigate(`/trips/${createdTrip.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate itinerary. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wizard Progress Header */}
      <div className="mb-8 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
          Step {step} of 5
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
          {step === 1 && 'Where and when are you traveling?'}
          {step === 2 && 'Who is traveling on this journey?'}
          {step === 3 && 'What is your budget & preferred pace?'}
          {step === 4 && 'What are your primary travel interests?'}
          {step === 5 && 'Review & Generate Itinerary'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {step === 1 && 'Select destination and trip dates to calculate travel days.'}
          {step === 2 && 'Tailor recommendations for solo flexibility, romantic couples, or group splits.'}
          {step === 3 && 'Balance daily stops and spending targets.'}
          {step === 4 && 'Choose tags to guide our AI recommendations.'}
          {step === 5 && 'Confirm your preferences and watch our AI assemble your custom route.'}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              onClick={() => s < step && setStep(s)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-indigo-600'
                  : s < step
                  ? 'w-4 bg-indigo-300 dark:bg-indigo-800 cursor-pointer'
                  : 'w-4 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Generating State Overlay */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl space-y-6 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Generating Your Itinerary...
            </h3>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2 animate-pulse">
              {generatingStage}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Wayfare is geographically clustering stops, timing meals, and balancing your budget.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Destination & Dates */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destination City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Tokyo, Japan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
                  {quickDestinations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestination(d)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        destination === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Day count alert */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Calculated Itinerary Duration:</span>
                </div>
                <div className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                  {tripDaysCount} Days ({tripDaysCount - 1} Nights)
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trip Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. ${destination ? `${destination.split(',')[0]} Highlights` : 'Summer Discovery'}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Travelers & Type */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Trip Dynamics
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleTripTypeSelect('solo')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    tripType === 'solo'
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Solo Explorer</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Affordable, nimble walkability, solo ramen booths, and high flexibility.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTripTypeSelect('couple')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    tripType === 'couple'
                      ? 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/50 dark:bg-rose-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Couple Getaway</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Romantic viewpoints, candlelit dining, scenic strolls, and relaxed mornings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTripTypeSelect('group')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    tripType === 'group'
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Group Roadtrip</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Shared bills, member preference merging, group table reservations, and activities.
                  </p>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-12 text-center text-sm font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {travelers}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Pace */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Budget Target (USD $)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ~${(budget / Math.max(1, travelers)).toFixed(2)} per person total (~${(budget / (tripDaysCount * Math.max(1, travelers))).toFixed(2)} / person / day)
                </div>
              </div>

              {/* Pace Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Trip Pacing
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'relaxed', label: 'Relaxed', desc: '2-3 stops/day. Late mornings, long leisurely meals.' },
                    { id: 'moderate', label: 'Moderate', desc: '3-4 stops/day. Balanced blend of highlights and downtime.' },
                    { id: 'fast-paced', label: 'Fast-Paced', desc: '4-5 stops/day. High-efficiency checklist of all top landmarks.' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id as TripPace)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        pace === p.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</span>
                        {pace === p.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Interests */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Focus Interests
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose tags that best describe what you want to see and experience.
                </p>

                <div className="flex flex-wrap gap-2">
                  {allInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Specific Wishes or Constraints (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Vegetarian dining only, love mid-century modern architecture, prefer scenic walking trails..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Generate */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Destination & Dynamics
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {destination || 'Tokyo, Japan'}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 capitalize">
                    {tripType} • {travelers} Traveler(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <div>
                    <div className="text-slate-400">Duration</div>
                    <div className="font-bold text-slate-800 dark:text-white">{tripDaysCount} Days</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Dates</div>
                    <div className="font-bold text-slate-800 dark:text-white">{startDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Budget Target</div>
                    <div className="font-bold text-slate-800 dark:text-white">${budget}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Pace</div>
                    <div className="font-bold text-slate-800 dark:text-white capitalize">{pace}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs text-slate-400 mb-1.5">Interests to harmonize</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Our AI planner will build geographically clustered stops, enforce proper meal timings, and compute travel durations.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !destination.trim()) {
                    setDestination('Tokyo, Japan');
                  }
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/30 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Full Itinerary</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
