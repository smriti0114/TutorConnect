import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import { Users, Award, ArrowLeft } from 'lucide-react';

export const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: null (choose role), 'parent', 'teacher'
  const [selectedRole, setSelectedRole] = useState(null);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Teacher-Specific Fields
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);

  // States
  const [inlineErrors, setInlineErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load activities list for teacher specialties selection
  useEffect(() => {
    const loadActs = async () => {
      try {
        const list = await apiClient.get('/activities');
        setActivitiesList(list.filter(a => a.active));
      } catch (err) {
        console.error('Failed to load activities:', err);
      }
    };
    loadActs();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setInlineErrors({});
    setFormError(null);
  };

  const handleBackToSelect = () => {
    setSelectedRole(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setBio('');
    setExperienceYears('');
    setSelectedSpecialties([]);
    setInlineErrors({});
    setFormError(null);
  };

  const toggleSpecialty = (activityId) => {
    if (selectedSpecialties.includes(activityId)) {
      setSelectedSpecialties(prev => prev.filter(id => id !== activityId));
    } else {
      setSelectedSpecialties(prev => [...prev, activityId]);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Phone validation
    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Confirm password
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // Teacher validations
    if (selectedRole === 'teacher') {
      if (!bio.trim()) {
        errors.bio = 'Biography/teaching statement is required.';
      } else if (bio.trim().length < 10) {
        errors.bio = 'Bio should be at least 10 characters.';
      }

      const years = Number(experienceYears);
      if (experienceYears === '') {
        errors.experience = 'Years of experience is required.';
      } else if (isNaN(years) || years < 0) {
        errors.experience = 'Please enter a valid non-negative number.';
      }

      if (selectedSpecialties.length === 0) {
        errors.specialties = 'Select at least one teaching specialty activity.';
      }
    }

    setInlineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Security check: Guard role selection
    if (selectedRole !== 'parent' && selectedRole !== 'teacher') {
      setFormError('Invalid registration role.');
      return;
    }

    if (!validateForm()) {
      setFormError('Please resolve the errors highlighted below.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role: selectedRole,
        specialtyActivityIds: selectedRole === 'teacher' ? selectedSpecialties : undefined,
        bio: selectedRole === 'teacher' ? bio.trim() : undefined,
        experience: selectedRole === 'teacher' ? `${experienceYears} years experience` : undefined,
        childName: selectedRole === 'parent' ? `${name.split(' ')[0]}'s Child` : undefined,
        childAge: 8,
      });

      setSuccessMsg('Registration successful! Redirecting to dashboard...');
      
      // Auto login
      setTimeout(async () => {
        const loggedIn = await login(email.trim().toLowerCase(), password);
        if (loggedIn) {
          if (selectedRole === 'parent') {
            navigate('/parent/dashboard');
          } else {
            navigate('/teacher/dashboard');
          }
        } else {
          navigate('/login');
        }
      }, 1200);

    } catch (err) {
      setFormError(err.message || 'Account creation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 animate-fadeIn">
      
      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-brand-500/20 animate-scaleUp">
            ★
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          Join StellarTutors
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Connect with professional extracurricular mentors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-brand-100 sm:px-10">
          
          {/* Step 1: Role Selection */}
          {selectedRole === null && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h3 className="text-base font-bold text-stone-800">Select Registration Type</h3>
                <p className="text-xs text-stone-400 mt-1">Please select if you are a parent looking for classes or a tutor.</p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('parent')}
                  className="w-full p-5 text-left border border-stone-200 rounded-3xl hover:border-brand-500 hover:bg-brand-50/10 transition-all flex items-start space-x-4 group cursor-pointer"
                >
                  <div className="p-3 bg-brand-55 text-brand-650 rounded-2xl group-hover:bg-brand-100 transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-850">Register as Parent</h4>
                    <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                      Discover activities, book specialized lessons, track homework, and manage your child's schedule.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full p-5 text-left border border-stone-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/10 transition-all flex items-start space-x-4 group cursor-pointer"
                >
                  <div className="p-3 bg-indigo-55 text-indigo-650 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-850">Register as Teacher / Tutor</h4>
                    <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                      Set hourly rates, manage your student roster, publish available calendar slots, and review earnings.
                    </p>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-550">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Form Display */}
          {selectedRole !== null && (
            <form onSubmit={handleSubmit} className="space-y-4.5 animate-fadeIn">
              
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToSelect}
                className="flex items-center space-x-1.5 text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Account Type</span>
              </button>

              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-sm font-extrabold text-stone-850 capitalize">
                  {selectedRole} Account Registration
                </h3>
              </div>

              {formError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-xl text-xs text-rose-805 font-bold">
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-805 font-bold text-center animate-pulse">
                  {successMsg}
                </div>
              )}

              {/* Full Name */}
              <div className="text-xs">
                <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Parker"
                  className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    inlineErrors.name ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                  }`}
                />
                {inlineErrors.name && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.name}</p>}
              </div>

              {/* Email */}
              <div className="text-xs">
                <label className="block font-bold text-stone-755 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    inlineErrors.email ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                  }`}
                />
                {inlineErrors.email && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.email}</p>}
              </div>

              {/* Phone */}
              <div className="text-xs">
                <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0199"
                  className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    inlineErrors.phone ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                  }`}
                />
                {inlineErrors.phone && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.phone}</p>}
              </div>

              {/* Password */}
              <div className="text-xs">
                <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    inlineErrors.password ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                  }`}
                />
                {inlineErrors.password && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="text-xs">
                <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    inlineErrors.confirmPassword ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                  }`}
                />
                {inlineErrors.confirmPassword && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.confirmPassword}</p>}
              </div>

              {/* TEACHER-SPECIFIC SUB-FORM */}
              {selectedRole === 'teacher' && (
                <div className="space-y-4 pt-2 border-t border-stone-100 animate-fadeIn">
                  
                  {/* Years of Experience */}
                  <div className="text-xs">
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Years of Experience</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5"
                      className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        inlineErrors.experience ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                      }`}
                    />
                    {inlineErrors.experience && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.experience}</p>}
                  </div>

                  {/* Bio statement */}
                  <div className="text-xs">
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-1">Teaching Bio Statement</label>
                    <textarea
                      rows={3}
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Introduce your skills, curriculum philosophies, and achievements..."
                      className={`w-full px-3.5 py-2.5 border rounded-xl shadow-xs text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-normal ${
                        inlineErrors.bio ? 'border-rose-350 focus:ring-rose-500' : 'border-stone-200'
                      }`}
                    />
                    {inlineErrors.bio && <p className="text-[10px] text-rose-600 mt-1 font-bold">{inlineErrors.bio}</p>}
                  </div>

                  {/* Specialties checklist */}
                  <div className="text-xs">
                    <label className="block font-bold text-stone-750 uppercase tracking-wider mb-2">
                      Specialties / Activities
                    </label>
                    {inlineErrors.specialties && (
                      <p className="text-[10px] text-rose-605 mt-0.5 mb-2 font-bold">{inlineErrors.specialties}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-150">
                      {activitiesList.map((act) => {
                        const isChecked = selectedSpecialties.includes(act.id);
                        return (
                          <button
                            type="button"
                            key={act.id}
                            onClick={() => toggleSpecialty(act.id)}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 border-stone-300 rounded-sm cursor-pointer accent-white"
                            />
                            <span className="text-[11px] truncate">{act.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    `Complete Registration`
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-550">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
                    Log in
                  </Link>
                </p>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
