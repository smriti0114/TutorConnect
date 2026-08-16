import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { useAuth } from './AuthContext';

const ChildContext = createContext(undefined);

export const ChildProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [childrenList, setChildrenList] = useState([]);
  const [activeChild, setActiveChild] = useState(null);

  const refreshChildren = async () => {
    if (currentUser && currentUser.role === 'parent') {
      try {
        const data = await apiClient.get('/children');
        const formatted = data.map(c => ({
          id: c._id,
          parentId: c.parentId,
          name: c.name,
          age: c.age,
          avatar: c.avatar,
          notes: c.notes,
          active: c.active,
        }));
        setChildrenList(formatted);
        
        const storedChildId = localStorage.getItem('tutoring_active_child_id');
        const found = formatted.find(c => c.id === storedChildId);
        if (found) {
          setActiveChild(found);
        } else if (formatted.length > 0) {
          setActiveChild(formatted[0]);
          localStorage.setItem('tutoring_active_child_id', formatted[0].id);
        } else {
          setActiveChild(null);
        }
      } catch (err) {
        console.error('Failed to fetch children:', err);
      }
    } else {
      setChildrenList([]);
      setActiveChild(null);
    }
  };

  useEffect(() => {
    refreshChildren();
  }, [currentUser]);

  const handleSetActiveChild = (childId) => {
    const child = childrenList.find(c => c.id === childId);
    if (child) {
      setActiveChild(child);
      localStorage.setItem('tutoring_active_child_id', childId);
    }
  };

  return (
    <ChildContext.Provider value={{ childrenList, activeChild, setActiveChild: handleSetActiveChild, refreshChildren }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
};
