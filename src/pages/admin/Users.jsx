import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { Search, UserPlus, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [children, setChildren] = useState([]);
  const [activeTab, setActiveTab] = useState('parents');
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAge, setEditAge] = useState(8);
  const [editNotes, setEditNotes] = useState('');

  const fetchRegistry = async () => {
    try {
      const usersData = await apiClient.get('/auth/list');
      setUsers(usersData.map(u => ({ ...u, id: u._id })));

      const childrenData = await apiClient.get('/children');
      setChildren(childrenData.map(c => ({ ...c, id: c._id })));
    } catch (err) {
      console.error('Failed to load user and child databases:', err);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !email || !phone || !password) {
      setError('Please complete all form fields.');
      return;
    }

    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError('A user account with this email address already exists.');
      return;
    }

    try {
      await apiClient.post('/auth/admin-create', {
        name,
        email,
        phone,
        password,
        role,
      });

      setSuccess(true);
      fetchRegistry();

      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    }
  };

  const handleToggleActive = async (userId) => {
    if (window.confirm('Are you sure you want to toggle the active status of this user?')) {
      try {
        await apiClient.put(`/auth/${userId}/toggle-active`);
        fetchRegistry();
      } catch (err) {
        alert(err.message || 'Failed to toggle status.');
      }
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditPassword('');
  };

  const startEditChild = (child) => {
    setEditingUser(child);
    setEditName(child.name);
    setEditAge(child.age);
    setEditNotes(child.notes || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      if (editingUser.parentId !== undefined) {
        await apiClient.put(`/children/${editingUser.id || editingUser._id}`, {
          name: editName,
          age: Number(editAge),
          notes: editNotes,
        });
      } else {
        await apiClient.put(`/auth/${editingUser.id || editingUser._id}`, {
          name: editName,
          email: editEmail,
          phone: editPhone,
          password: editPassword || undefined,
        });
      }

      setEditingUser(null);
      fetchRegistry();
    } catch (err) {
      alert(err.message || 'Failed to save edits.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'parents') return u.role === 'parent';
    if (activeTab === 'teachers') return u.role === 'teacher';
    return false;
  });

  const filteredChildren = children.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return activeTab === 'children' && matchesSearch;
  });

  const getParentName = (parentId) => {
    return users.find(u => u.id === parentId)?.name || 'Parent';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-850">User Registry</h2>
          <p className="text-stone-500 text-xs mt-1">Audit, activate, or suspend system accounts and register new accounts.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-teal-605 hover:bg-teal-705 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/10 self-start"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs max-w-xl animate-fadeIn">
          <h3 className="text-base font-bold text-stone-850 mb-4">Add New Account</h3>
          <form onSubmit={handleAddUser} className="space-y-4 text-xs">
            {error && <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-800 font-bold">{error}</div>}
            {success && <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-800 font-bold text-center">User Created Successfully!</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Parker"
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0199"
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-500 text-stone-850"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`py-2.5 rounded-xl border font-bold text-center ${role === 'parent' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-605'}`}
                >
                  Parent / Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2.5 rounded-xl border font-bold text-center ${role === 'teacher' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-stone-200 bg-white text-stone-605'}`}
                >
                  Tutor / Teacher
                </button>
              </div>
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
                className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-705 rounded-xl transition-all shadow-md shadow-teal-500/10"
              >
                Register Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200">
        <div className="flex space-x-6">
          <button
            onClick={() => { setActiveTab('parents'); setSearchQuery(''); }}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'parents' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Parents
          </button>
          <button
            onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'teachers' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Tutors
          </button>
          <button
            onClick={() => { setActiveTab('children'); setSearchQuery(''); }}
            className={`pb-3 text-sm font-bold transition-all ${activeTab === 'children' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-stone-400 hover:text-stone-605'}`}
          >
            Children Profiles
          </button>
        </div>

        <div className="relative max-w-xs w-full pb-2 sm:pb-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-850 bg-white"
          />
        </div>
      </div>

      {/* Registry Lists */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {activeTab !== 'children' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 font-bold uppercase border-b border-stone-100 text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/20 transition-all animate-fadeIn">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-stone-850">{u.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <p>{u.email}</p>
                      <p className="text-stone-400 text-[10px] mt-0.5">{u.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-stone-100 text-stone-850 px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[9px] ${
                        u.active ? 'bg-emerald-50 text-emerald-705' : 'bg-rose-50 text-rose-705'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          disabled={u.id === 'u-admin'}
                          className={`p-1.5 rounded-xl transition-colors ${u.active ? 'text-teal-650 hover:bg-teal-50' : 'text-stone-300 hover:bg-stone-50'}`}
                          title="Toggle account active status"
                        >
                          {u.active ? <ToggleLeft className="w-6 h-6" /> : <ToggleRight className="w-6 h-6 text-stone-300" />}
                        </button>
                        <button
                          onClick={() => startEditUser(u)}
                          className="p-1.5 border border-stone-200 hover:bg-stone-50 hover:text-teal-600 rounded-lg text-stone-500 transition-colors"
                          title="Edit user details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 font-bold uppercase border-b border-stone-100 text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Child's Name</th>
                  <th className="px-6 py-3.5">Age</th>
                  <th className="px-6 py-3.5">Parent Account</th>
                  <th className="px-6 py-3.5">Profile notes</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 animate-fadeIn">
                {filteredChildren.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/20 transition-all">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-stone-850">{c.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{c.age}</td>
                    <td className="px-6 py-4 font-bold text-stone-850">{getParentName(c.parentId)}</td>
                    <td className="px-6 py-4 italic text-stone-505 truncate max-w-xs" title={c.notes}>
                      "{c.notes || 'No comments shared.'}"
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => startEditChild(c)}
                        className="p-1.5 border border-stone-200 hover:bg-stone-50 hover:text-teal-600 rounded-lg text-stone-500 transition-colors"
                        title="Edit child profile details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User/Child Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            <h3 className="text-lg font-bold text-stone-850 mb-4 font-display">Edit Profile details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-505 text-stone-850"
                />
              </div>

              {editingUser.parentId === undefined ? (
                <>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-505 text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-505 text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="text"
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-555 text-stone-850"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Age</label>
                    <input
                      type="number"
                      required
                      min={3}
                      max={18}
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-505 text-stone-850"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">Profile notes</label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-4 py-2.5 border border-stone-250 rounded-xl text-sm focus:ring-teal-505 text-stone-850"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 text-sm font-bold text-stone-650 bg-stone-105 hover:bg-stone-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
