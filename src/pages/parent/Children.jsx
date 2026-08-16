import React, { useState } from 'react';
import { useChild } from '../../context/ChildContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { Users, Plus, Edit2, Check, X, Trash2 } from 'lucide-react';

export const ParentChildren = () => {
  const { currentUser } = useAuth();
  const { childrenList, refreshChildren } = useChild();

  const [editingChild, setEditingChild] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [avatar, setAvatar] = useState('');
  const [notes, setNotes] = useState('');

  const avatarsList = [
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !currentUser) return;

    try {
      await apiClient.post('/children', {
        name,
        age: Number(age),
        avatar: avatar || avatarsList[0],
        notes,
      });
      refreshChildren();
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Failed to create child profile.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingChild) return;

    try {
      await apiClient.put(`/children/${editingChild.id}`, {
        name,
        age: Number(age),
        avatar,
        notes,
      });
      refreshChildren();
      resetForm();
      setEditingChild(null);
    } catch (err) {
      alert(err.message || 'Failed to update child profile.');
    }
  };

  const handleDeactivate = async (childId) => {
    if (window.confirm('Are you sure you want to deactivate this child profile? All associated class entries will remain, but the profile will be hidden.')) {
      try {
        await apiClient.delete(`/children/${childId}`);
        refreshChildren();
      } catch (err) {
        alert(err.message || 'Failed to deactivate child profile.');
      }
    }
  };

  const startEdit = (child) => {
    setEditingChild(child);
    setName(child.name);
    setAge(child.age);
    setAvatar(child.avatar || avatarsList[0]);
    setNotes(child.notes || '');
    setShowAddForm(false);
  };

  const resetForm = () => {
    setName('');
    setAge(8);
    setAvatar(avatarsList[0]);
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Child Profiles</h2>
          <p className="text-stone-500 text-xs mt-1">Manage child information, avatars, and specific learning preferences.</p>
        </div>
        {!showAddForm && !editingChild && (
          <button 
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/15"
          >
            <Plus className="w-4 h-4" />
            <span>Add Child</span>
          </button>
        )}
      </div>

      {/* Profile Form (Add or Edit) */}
      {(showAddForm || editingChild) && (
        <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm max-w-xl">
          <h3 className="text-lg font-bold text-stone-800 mb-4">
            {editingChild ? `Edit Profile: ${editingChild.name}` : 'Register New Child Profile'}
          </h3>
          <form onSubmit={editingChild ? handleUpdate : handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Child's Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leo Parker"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  min={3}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-2">Select Avatar</label>
              <div className="flex space-x-3">
                {avatarsList.map((avUrl) => (
                  <button
                    key={avUrl}
                    type="button"
                    onClick={() => setAvatar(avUrl)}
                    className={`relative rounded-full p-1 border-2 transition-all overflow-hidden ${
                      avatar === avUrl ? 'border-brand-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={avUrl} alt="Avatar Selection" className="w-10 h-10 rounded-full object-cover" />
                    {avatar === avUrl && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 text-white rounded-full flex items-center justify-center text-[9px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Teacher Tips & Preferences (Optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include tips (e.g. Sarah has high energy, loves reward stars, is allergic to peanuts...)"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500 text-stone-850"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setEditingChild(null); setShowAddForm(false); resetForm(); }}
                className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-md shadow-brand-500/15"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {childrenList.map((child) => (
          <div key={child.id} className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <img 
                src={child.avatar} 
                alt={child.name} 
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-50" 
              />
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-stone-800">{child.name}</h3>
                <span className="inline-block bg-brand-50 text-brand-900 font-semibold text-xs px-3 py-0.5 rounded-full">
                  Age {child.age}
                </span>
                <p className="text-stone-505 text-xs leading-relaxed mt-2 italic">
                  "{child.notes || 'No custom preferences shared.'}"
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => startEdit(child)}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-brand-600 transition-colors"
                title="Edit details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {childrenList.length > 1 && (
                <button 
                  onClick={() => handleDeactivate(child.id)}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Remove profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {childrenList.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-brand-100 p-8">
            <Users className="w-12 h-12 text-brand-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No Children Registered</h3>
            <p className="text-stone-500 text-xs mt-1">Please create a child profile to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
