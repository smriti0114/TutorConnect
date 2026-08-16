import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { useAuth } from './AuthContext';

const ChildContext = createContext(undefined);

export const ChildProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [childrenList, setChildrenList] = useState([]);
  const [activeChild, setActiveChild] = useState(null);

  const refreshChildren = () => {
    if (currentUser && currentUser.role === 'parent') {
      const allChildren = mockDb.getChildren();
      const myChildren = allChildren.filter(c => c.parentId === currentUser.id && c.active);
      setChildrenList(myChildren);
      
      const storedChildId = localStorage.getItem('tutoring_active_child_id');
      const found = myChildren.find(c => c.id === storedChildId);
      if (found) {
        setActiveChild(found);
      } else if (myChildren.length > 0) {
        setActiveChild(myChildren[0]);
        localStorage.setItem('tutoring_active_child_id', myChildren[0].id);
      } else {
        setActiveChild(null);
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
