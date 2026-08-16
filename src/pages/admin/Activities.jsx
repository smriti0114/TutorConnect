import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { Activity, Plus, Edit2, Check, X } from 'lucide-react';

export const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  
  // Edit Form States
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');

  // Add Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(30);
  const [newDescription, setNewDescription] = useState('');

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get('/activities');
      setActivities(data.map(a => ({ ...a, id: a._id })));
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const startEdit = (act) => {
    setEditingId(act.id || act._id);
    setName(act.name);
    setPrice(act.pricePerClass);
    setDescription(act.description || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await apiClient.put(`/activities/${editingId}`, {
        name,
        pricePerClass: Number(price),
        description,
      });
      setEditingId(null);
      fetchActivities();
    } catch (err) {
      alert(err.message || 'Failed to update activity.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName) return;

    try {
      await apiClient.post('/activities', {
        name: newName,
        pricePerClass: Number(newPrice),
        description: newDescription,
      });
      setShowAddForm(false);
      setNewName('');
      setNewPrice(30);
      setNewDescription('');
      fetchActivities();
    } catch (err) {
      alert(err.message || 'Failed to create activity.');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await apiClient.put(`/activities/${id}`, {
        active: !currentActive,
      });
      fetchActivities();
    } catch (err) {
      alert(err.message || 'Failed to toggle active state.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-850">Extracurricular Activity catalog</h2>
          <p className="text-stone-500 text-xs mt-1">Manage platform extracurricular subjects and update tuition price rates.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-teal-605 hover:bg-teal-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Create Activity</span>
          </button>
        )}
      </div>

      {/* Add New Activity form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs max-w-xl animate-fadeIn">
          <h3 className="text-base font-bold text-stone-800 mb-4">Add New Extracurricular Subject</h3>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Flute Class"
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Base Rate per Class ($)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                rows={3}
                required
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Subject curriculum parameters..."
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/10"
              >
                Create Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((act) => (
          <div key={act.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow animate-fadeIn">
            {editingId === act.id ? (
              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Rate ($)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-stone-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-250 rounded-xl text-stone-850"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 bg-stone-105 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-705 text-white font-bold rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl">
                      {act.id.includes('guitar') ? '🎸' :
                       act.id.includes('piano') ? '🎹' :
                       act.id.includes('violin') ? '🎻' :
                       act.id.includes('vocals') ? '🎤' :
                       act.id.includes('dance') ? '💃' : '🎨'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-850">{act.name}</h3>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1 inline-block ${
                        act.active ? 'bg-emerald-50 text-emerald-705' : 'bg-rose-50 text-rose-705'
                      }`}>
                        {act.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(act)}
                      className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-505 hover:text-teal-600 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(act.id, act.active)}
                      className={`px-3 py-1 border rounded-xl text-[10px] font-bold transition-all ${
                        act.active ? 'border-rose-200 hover:bg-rose-50 text-rose-600' : 'border-emerald-200 hover:bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {act.active ? 'Hide Subject' : 'Show Subject'}
                    </button>
                  </div>
                </div>

                <p className="text-stone-505 text-xs leading-relaxed italic border-t border-stone-50 pt-3">
                  "{act.description || 'No summary parameters provided.'}"
                </p>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Rate value:</span>
                  <span className="font-extrabold text-stone-850">${act.pricePerClass} per class hour</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
