import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { 
  GraduationCap, Sparkles, BookOpen, Calendar, Clock, Award, 
  Shield, Check, ArrowRight, Menu, X, CheckCircle2, ChevronRight, 
  DollarSign, Star, BookMarked, Layers, BarChart3, Users, LayoutDashboard,
  Music, Palette, Compass, Activity as ActivityIcon
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load activities dynamically
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiClient.get('/activities');
        setActivities(data.filter(a => a.active));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load activities for homepage:', err);
        setError(true);
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Standard fallback activities if API fails
  const fallbackActivities = [
    { _id: 'act1', name: 'Guitar', description: 'Learn basic acoustic and electric guitar chords, notes, and music theories.', pricePerClass: 40, icon: Music },
    { _id: 'act2', name: 'Piano', description: 'Classical and modern keyboard training focusing on posture, sight reading, and finger coordination.', pricePerClass: 45, icon: Music },
    { _id: 'act3', name: 'Drawing', description: 'Pencil shading, watercolor, and digital illustration skills for young creative minds.', pricePerClass: 25, icon: Palette },
    { _id: 'act4', name: 'Maths', description: 'Fun and logic-based mathematics tutoring covering basic arithmetic to algebra foundations.', pricePerClass: 30, icon: BookOpen },
  ];

  const displayedActivities = error || activities.length === 0 
    ? fallbackActivities 
    : activities.slice(0, 4);

  // Scroll helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-stone-900">
                Tutor<span className="text-brand-500">Connect</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 text-sm font-semibold text-stone-600">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-500 transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollToSection('activities')} className="hover:text-brand-500 transition-colors cursor-pointer">Activities</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-brand-500 transition-colors cursor-pointer">How It Works</button>
              <button onClick={() => scrollToSection('parents')} className="hover:text-brand-500 transition-colors cursor-pointer">For Parents</button>
              <button onClick={() => scrollToSection('teachers')} className="hover:text-brand-500 transition-colors cursor-pointer">For Teachers</button>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-stone-700 hover:text-brand-500 transition-colors px-3 py-2">
                Log in
              </Link>
              <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/10 transition-all hover:scale-[1.02] cursor-pointer">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-stone-100 bg-white/95 px-4 pt-2 pb-6 space-y-3">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-semibold text-stone-700 hover:text-brand-500">Home</button>
            <button onClick={() => scrollToSection('activities')} className="block w-full text-left py-2 font-semibold text-stone-700 hover:text-brand-500">Activities</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 font-semibold text-stone-700 hover:text-brand-500">How It Works</button>
            <button onClick={() => scrollToSection('parents')} className="block w-full text-left py-2 font-semibold text-stone-700 hover:text-brand-500">For Parents</button>
            <button onClick={() => scrollToSection('teachers')} className="block w-full text-left py-2 font-semibold text-stone-700 hover:text-brand-500">For Teachers</button>
            <div className="pt-4 flex flex-col space-y-2">
              <Link to="/login" className="w-full text-center py-3 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50">Log in</Link>
              <Link to="/signup" className="w-full text-center py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/10">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 text-brand-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Extracurricular Learning</span>
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-stone-900 leading-tight">
                Learning Beyond <br className="hidden sm:inline" />
                <span className="text-brand-500">the Classroom.</span>
              </h1>
              <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Discover trusted teachers and engaging extracurricular activities that help your child learn, grow, and build skills they’ll love.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-base font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.03] text-center">
                  Find a Teacher
                </Link>
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-base font-bold shadow-xs transition-all hover:scale-[1.02] text-center">
                  Become a Teacher
                </Link>
              </div>
            </div>

            {/* Hero Visual Composition */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-[480px] lg:max-w-none h-[420px] sm:h-[480px] flex items-center justify-center">
                {/* Background Accent circles */}
                <div className="absolute w-72 h-72 rounded-full bg-brand-100/50 blur-3xl -top-10 -left-10 -z-10"></div>
                <div className="absolute w-80 h-80 rounded-full bg-indigo-100/40 blur-3xl -bottom-10 -right-10 -z-10"></div>

                {/* Central Canvas of Floating Skill Cards */}
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Music Card */}
                  <div className="absolute top-8 left-4 sm:left-12 w-48 bg-white p-4 rounded-2xl border border-stone-150 shadow-md transform -rotate-6 transition-all hover:rotate-0 hover:scale-[1.03] duration-300">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                      <Music className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-stone-850">Acoustic Guitar</h3>
                    <p className="text-[10px] text-stone-400 font-semibold mt-1">Instructor: David H.</p>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-500">Rate: $40/class</span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  {/* Art Card */}
                  <div className="absolute bottom-8 right-4 sm:right-12 w-48 bg-white p-4 rounded-2xl border border-stone-150 shadow-md transform rotate-6 transition-all hover:rotate-0 hover:scale-[1.03] duration-300">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-3">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-stone-850">Creative Art</h3>
                    <p className="text-[10px] text-stone-400 font-semibold mt-1">Instructor: Sarah W.</p>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-500">Rate: $25/class</span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  {/* Statistics floating widget */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-44 bg-stone-900 text-white p-4 rounded-2xl shadow-xl z-10 transition-all hover:scale-[1.05] duration-300">
                    <div className="flex items-center space-x-1.5 text-brand-400">
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Top Rated</span>
                    </div>
                    <p className="font-display font-extrabold text-2xl mt-1.5">Trusted</p>
                    <p className="text-[10px] text-stone-400 font-semibold leading-normal mt-0.5">By over 250+ active families weekly</p>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute top-1/4 right-8 bg-white/90 backdrop-blur-xs border border-stone-150 py-2 px-3.5 rounded-xl shadow-xs text-xs font-bold text-stone-750 flex items-center space-x-2 transform translate-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Flexible Scheduling</span>
                  </div>

                  <div className="absolute bottom-1/4 left-8 bg-white/90 backdrop-blur-xs border border-stone-150 py-2 px-3.5 rounded-xl shadow-xs text-xs font-bold text-stone-750 flex items-center space-x-2 transform -translate-x-2">
                    <BookMarked className="w-4 h-4 text-brand-500" />
                    <span>12+ Extracurricular Activities</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST / VALUE STRIP */}
      <section className="bg-white border-y border-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                <Award className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-stone-850">Trusted Teachers</h3>
              <p className="text-[11px] text-stone-500 font-medium">Handpicked specialist bios</p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                <Calendar className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-stone-850">Flexible Scheduling</h3>
              <p className="text-[11px] text-stone-500 font-medium">Easy slot selection panels</p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-stone-850">Secure & Simple</h3>
              <p className="text-[11px] text-stone-500 font-medium">No double booking rules</p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-stone-850">Progress Tracking</h3>
              <p className="text-[11px] text-stone-500 font-medium">Class history & homework logs</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. EXPLORE WHAT YOUR CHILD CAN LEARN */}
      <section id="activities" className="py-20 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">Explore What Your Child Can Learn</h2>
            <p className="text-stone-550 text-sm max-w-xl mx-auto font-medium">
              Choose from our curated selection of arts, sciences, and music classes designed to help children build lifelong talents.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedActivities.map((act) => {
                const IconComponent = act.icon || Compass;
                return (
                  <div key={act._id} className="bg-white p-6 rounded-2xl border border-stone-150 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/2 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
                        <IconComponent className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="font-display font-bold text-base text-stone-850">{act.name}</h3>
                      <p className="text-xs text-stone-400 font-medium leading-relaxed mt-2 line-clamp-3">
                        {act.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
                      <span className="text-xs font-extrabold text-brand-600">
                        {act.pricePerClass ? `$${act.pricePerClass}/class` : 'Tuition Varies'}
                      </span>
                      <Link to="/signup" className="text-xs font-bold text-stone-600 hover:text-brand-500 flex items-center space-x-1 transition-colors">
                        <span>Find Tutors</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/signup" className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold shadow-xs hover:border-stone-300 transition-colors">
              <span>View All Activities</span>
              <ArrowRight className="w-4 h-4 text-brand-500" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">Simple Step-by-Step Enrollment</h2>
            <p className="text-stone-550 text-sm max-w-xl mx-auto font-medium">
              We have streamlined extracurricular enrollment so you can get learning without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-4 text-center md:text-left relative">
              <span className="font-display font-extrabold text-4xl text-brand-200 block">01</span>
              <h3 className="font-display font-bold text-base text-stone-850">Choose an Activity</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Browse activities that match your child's interests and goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center md:text-left relative">
              <span className="font-display font-extrabold text-4xl text-brand-200 block">02</span>
              <h3 className="font-display font-bold text-base text-stone-850">Find a Teacher</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Explore available teachers and their specialties.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center md:text-left relative">
              <span className="font-display font-extrabold text-4xl text-brand-200 block">03</span>
              <h3 className="font-display font-bold text-base text-stone-850">Choose a Schedule</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Select a suitable class slot.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 text-center md:text-left relative">
              <span className="font-display font-extrabold text-4xl text-brand-200 block">04</span>
              <h3 className="font-display font-bold text-base text-stone-850">Start Learning</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Track classes, homework, payments and progress from your dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. WHY PARENTS CHOOSE TUTORCONNECT */}
      <section className="py-20 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">Why Parents Choose TutorConnect</h2>
            <p className="text-stone-550 text-sm max-w-xl mx-auto font-medium">
              We offer structured transparency and convenience for modern extracurricular teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-2xl border border-stone-150 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-5">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-850">Personalized Learning</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium mt-3">
                Choose activities and teachers that match your child's interests and level.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-150 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-5">
                <Calendar className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-850">Easy Scheduling</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium mt-3">
                Find suitable class slots without complicated phone tag or coordinations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-150 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-5">
                <BookMarked className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-850">Homework Tracking</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium mt-3">
                Keep assignments, remarks and completion status organized in one dashboard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-150 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-5">
                <BarChart3 className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-850">Progress Visibility</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium mt-3">
                Stay informed about classes, attendance logs, and direct teacher remarks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-150 hover:shadow-md transition-shadow md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-5">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display font-bold text-base text-stone-850">Secure and Isolated Ecosystem</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium mt-3">
                Role-based access controls separate Parent, Teacher, and Admin flows. Your records, child configurations, and billing details are completely secured.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FOR PARENTS SECTION */}
      <section id="parents" className="py-20 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image mockup block representing parents profile */}
            <div className="order-2 lg:order-1 bg-stone-50 p-6 rounded-3xl border border-stone-150 relative">
              <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">P</div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-800">Emily Robinson</h4>
                      <p className="text-[9px] text-stone-400 font-semibold">Account: Parent Profile</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full">2 Active Kids</span>
                </div>
                {/* List items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f6] text-[10px] font-bold">
                    <span className="text-stone-700">Leo Bow (Age 9)</span>
                    <span className="text-brand-500 font-extrabold">Maths & Guitar</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f6] text-[10px] font-bold">
                    <span className="text-stone-700">Alice Bow (Age 7)</span>
                    <span className="text-brand-500 font-extrabold">Creative Art</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content text */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 leading-tight">
                Everything you need to support your child's learning.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed font-medium">
                Create child profiles, choose subject specialties, submit schedules requests, complete practice tasks, and track school tuition invoices in a central location.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-stone-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>Manage multiple children</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>Discover teachers specialty</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>Class double booking checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>Complete homework logs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>Track billing ledgers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-500" />
                  <span>In-app unread alerts</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link to="/signup" className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/10 transition-colors cursor-pointer">
                  <span>Get Started as a Parent</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FOR TEACHERS SECTION */}
      <section id="teachers" className="py-20 bg-[#faf9f6] border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content text */}
            <div className="space-y-6">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 leading-tight">
                Teach what you love. <br />Make an impact.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed font-medium">
                TutorConnect provides the scheduling structures and records support you need so you can focus entirely on educating children.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-stone-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Build your teacher profile</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Showcase specialties</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Manage assigned students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Log attendance status</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Assign homework tasks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Monitor earnings stats</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link to="/signup" className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold shadow-md transition-colors cursor-pointer">
                  <span>Join as a Teacher</span>
                  <ArrowRight className="w-4 h-4 text-brand-400" />
                </Link>
              </div>
            </div>

            {/* Image mockup block representing teacher details */}
            <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200 relative">
              <div className="bg-white rounded-2xl shadow-md border border-stone-150 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">T</div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-800">Professor Marcus</h4>
                      <p className="text-[9px] text-stone-400 font-semibold">Specialties: Mathematics, Science</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">Available</span>
                </div>
                {/* Stats widgets */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-[#faf9f6] rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">Total Earnings</span>
                    <span className="text-sm font-extrabold text-stone-850 mt-0.5 block">$3,240</span>
                  </div>
                  <div className="p-3 bg-[#faf9f6] rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">Weekly Classes</span>
                    <span className="text-sm font-extrabold text-stone-850 mt-0.5 block">14 Lessons</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. PLATFORM EXPERIENCE / DASHBOARD PREVIEW */}
      <section className="py-20 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">Centralized Dashboard Management</h2>
            <p className="text-stone-550 text-sm max-w-xl mx-auto font-medium">
              A visually clean, easy-to-use user experience that helps you manage classes, children, and payments.
            </p>
          </div>

          <div className="bg-[#faf9f6] rounded-3xl p-4 sm:p-6 lg:p-8 border border-stone-150 max-w-4xl mx-auto shadow-xs">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              
              {/* Header simulation */}
              <div className="bg-stone-50 border-b border-stone-100 px-4 py-3.5 flex justify-between items-center text-xs font-bold">
                <span className="text-stone-700 flex items-center space-x-1.5">
                  <LayoutDashboard className="w-4 h-4 text-brand-500" />
                  <span>Student Dashboard Overview</span>
                </span>
                <span className="bg-brand-50 text-brand-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  Active Session
                </span>
              </div>

              {/* Grid content mockup */}
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Upcoming class card */}
                <div className="sm:col-span-2 border border-stone-150 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Next Approved Session</span>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-850">Piano Class - Bow techniques</h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">Tutor: Sarah Watson • Student: Alice Bow</p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 text-[10px] font-bold text-stone-750">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>2026-11-20 at 11:00</span>
                  </div>
                </div>

                {/* Fees card */}
                <div className="border border-stone-150 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tuition Fees</span>
                    <h3 className="font-display font-extrabold text-2xl text-stone-900 mt-1">$45.00</h3>
                  </div>
                  <span className="inline-block text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 py-1 px-2.5 rounded-full text-center">
                    Pending Payment
                  </span>
                </div>

                {/* Homework check card */}
                <div className="border border-stone-150 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Assigned Task</span>
                  <p className="font-display font-bold text-xs text-stone-850 line-clamp-1">Practice scales on piano</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-bold text-stone-400">Due: 2026-10-20</span>
                    <span className="bg-indigo-550 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">Pending</span>
                  </div>
                </div>

                {/* Notifications badge */}
                <div className="sm:col-span-2 border border-stone-150 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Recent Activity Notification</span>
                  <p className="text-[11px] text-stone-600 font-medium">Your Math booking request for Alice Bow has been approved by admin.</p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="bg-[#fffaf5] border-t border-brand-100 py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-tight">
            Give your child more ways to learn, <br />explore, and grow.
          </h2>
          <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
            Find engaging activities and trusted teachers through TutorConnect. Create a free account to get started.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-base font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.03] cursor-pointer">
              Get Started
            </Link>
            <button onClick={() => scrollToSection('activities')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-base font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer">
              Explore Activities
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-white border-t border-stone-150 py-12 text-xs font-semibold text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-stone-100">
            
            {/* Logo/Brand details */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-display font-extrabold text-base tracking-tight text-stone-900">
                  Tutor<span className="text-brand-500">Connect</span>
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-400 font-medium max-w-xs">
                Helping children learn beyond the classroom. Discover trusted teachers and engaging extracurricular activities.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-750 uppercase tracking-wider text-[10px]">Platform Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-500 transition-colors cursor-pointer">Home</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('activities')} className="hover:text-brand-500 transition-colors cursor-pointer">Activities</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-brand-500 transition-colors cursor-pointer">How It Works</button>
                </li>
              </ul>
            </div>

            {/* Accounts */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-750 uppercase tracking-wider text-[10px]">User Portal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="hover:text-brand-500 transition-colors">Login Portal</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-brand-500 transition-colors">Parent Register</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-brand-500 transition-colors">Teacher signup</Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex justify-between items-center text-stone-400 text-[10px]">
            <span>© 2026 TutorConnect. All rights reserved.</span>
            <span>Supporting kids extracurricular education safely.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
