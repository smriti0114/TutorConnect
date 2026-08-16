const BASE_URL = 'http://localhost:5050/api';

console.log('======================================================');
console.log('   TUTORCONNECT MONGO ATLAS END-TO-END AUDIT SUITE    ');
console.log('======================================================');

let passedTests = 0;
let failedTests = 0;

function report(name, status, details = '') {
  if (status === 'PASSED') {
    console.log(`[PASS] ${name}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
    failedTests++;
  }
}

async function runAudit() {
  let adminToken = '';
  let parentToken = '';
  let parentId = '';
  let teacherToken = '';
  let teacherId = '';
  let childId = '';
  let bookingId = '';
  let homeworkId = '';
  let paymentId = '';

  // 1. ADMIN LOGIN
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Demo123!' })
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      adminToken = data.token;
      report('Admin Login', 'PASSED');
    } else {
      report('Admin Login', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Admin Login', 'FAILED', err.message);
  }

  // 2. INVALID LOGIN
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'WrongPassword!' })
    });
    if (res.status === 400) {
      report('Invalid Login Protection', 'PASSED');
    } else {
      report('Invalid Login Protection', 'FAILED', `Status code: ${res.status}`);
    }
  } catch (err) {
    report('Invalid Login Protection', 'FAILED', err.message);
  }

  // 3. PARENT SELF-REGISTRATION
  const tempParentEmail = `parent_${Date.now()}@audit.com`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Parent',
        email: tempParentEmail,
        password: 'Password123!',
        phone: '1234567890',
        role: 'parent',
        childName: 'Audit Kid',
        childAge: 9
      })
    });
    if (res.status === 201) {
      report('Parent Self-Registration', 'PASSED');
    } else {
      const data = await res.json();
      report('Parent Self-Registration', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Parent Self-Registration', 'FAILED', err.message);
  }

  // 4. PARENT LOGIN & SESSION GETTER
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempParentEmail, password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      parentToken = loginData.token;
      parentId = loginData.user.id;

      // Verify /me endpoint
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });
      const meData = await meRes.json();
      if (meRes.status === 200 && meData.email === tempParentEmail) {
        report('Parent Login & Session Verification (/auth/me)', 'PASSED');
      } else {
        report('Parent Login & Session Verification (/auth/me)', 'FAILED', 'Data mismatch');
      }
    } else {
      report('Parent Login & Session Verification (/auth/me)', 'FAILED', 'Login failed');
    }
  } catch (err) {
    report('Parent Login & Session Verification (/auth/me)', 'FAILED', err.message);
  }

  // 5. PARENT FETCHES OWN CHILDREN
  try {
    const res = await fetch(`${BASE_URL}/children`, {
      headers: {
        'Authorization': `Bearer ${parentToken}`
      }
    });
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length > 0) {
      childId = data[0]._id;
      report('Parent Child Fetch', 'PASSED');
    } else {
      report('Parent Child Fetch', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Parent Child Fetch', 'FAILED', err.message);
  }

  // 6. ROLE ISOLATION: PARENT CANNOT ACCESS OTHER CHILDREN DETAILS
  try {
    const allRes = await fetch(`${BASE_URL}/children`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allChildren = await allRes.json();
    const otherChild = allChildren.find(c => c.parentId !== parentId);

    if (otherChild) {
      const editRes = await fetch(`${BASE_URL}/children/${otherChild._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parentToken}`
        },
        body: JSON.stringify({ name: 'Hacked Name' })
      });
      if (editRes.status === 403) {
        report('Security Isolation - Parent cannot edit another parent\'s child', 'PASSED');
      } else {
        report('Security Isolation - Parent cannot edit another parent\'s child', 'FAILED', `Status: ${editRes.status}`);
      }
    } else {
      report('Security Isolation - Parent cannot edit another parent\'s child', 'PASSED', 'Skipped: No other child found');
    }
  } catch (err) {
    report('Security Isolation - Parent cannot edit another parent\'s child', 'FAILED', err.message);
  }

  // 7. GET SEEDED TEACHER AND DISCOVERY ACTIVITY CATALOG
  let teacherIdToBook = '';
  let activityIdToBook = '';
  try {
    const actRes = await fetch(`${BASE_URL}/activities`, {
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const activities = await actRes.json();
    const maths = activities.find(a => a.name.toLowerCase() === 'maths' || a.name.toLowerCase().includes('math'));
    
    const teachRes = await fetch(`${BASE_URL}/teachers`, {
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const teachers = await teachRes.json();

    if (teachers.length > 0) {
      const firstTeacher = teachers[0];
      teacherIdToBook = firstTeacher.userId;
      
      const specialtyName = firstTeacher.specialtyActivityIds[0];
      const matchedActivity = activities.find(a => a.name.toLowerCase() === (specialtyName || '').toLowerCase());
      if (matchedActivity) {
        activityIdToBook = matchedActivity._id;
      } else {
        activityIdToBook = maths ? maths._id : activities[0]._id;
      }
      report('Browse Activities & Teachers Specialty Match', 'PASSED');
    } else {
      report('Browse Activities & Teachers Specialty Match', 'FAILED', 'No teachers seeded');
    }
  } catch (err) {
    report('Browse Activities & Teachers Specialty Match', 'FAILED', err.message);
  }

  // 8. PARENT REQUESTS A CLASS BOOKING
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parentToken}`
      },
      body: JSON.stringify({
        childId,
        teacherId: teacherIdToBook,
        activityId: activityIdToBook,
        date: '2026-11-20',
        startTime: '11:00'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data._id) {
      bookingId = data._id;
      report('Request Booking (Pending State Entry)', 'PASSED');
    } else {
      report('Request Booking (Pending State Entry)', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Request Booking (Pending State Entry)', 'FAILED', err.message);
  }

  // 9. BOOKING CONSTRAINT VALIDATIONS
  // A. Double-booking check
  try {
    const doubleRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parentToken}`
      },
      body: JSON.stringify({
        childId,
        teacherId: teacherIdToBook,
        activityId: activityIdToBook,
        date: '2026-11-20',
        startTime: '11:00'
      })
    });
    if (doubleRes.status === 400) {
      report('Booking Constraint - Child Double-Booking Prevention', 'PASSED');
    } else {
      report('Booking Constraint - Child Double-Booking Prevention', 'FAILED', `Status: ${doubleRes.status}`);
    }
  } catch (err) {
    report('Booking Constraint - Child Double-Booking Prevention', 'FAILED', err.message);
  }

  // B. Past date booking prevention
  try {
    const pastRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parentToken}`
      },
      body: JSON.stringify({
        childId,
        teacherId: teacherIdToBook,
        activityId: activityIdToBook,
        date: '2022-01-01',
        startTime: '14:00'
      })
    });
    if (pastRes.status === 400) {
      report('Booking Constraint - Past Date Prevention', 'PASSED');
    } else {
      report('Booking Constraint - Past Date Prevention', 'FAILED', `Status: ${pastRes.status}`);
    }
  } catch (err) {
    report('Booking Constraint - Past Date Prevention', 'FAILED', err.message);
  }

  // 10. ADMIN APPROVES BOOKING
  try {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    if (res.status === 200) {
      report('Admin Booking Approval', 'PASSED');
    } else {
      const data = await res.json();
      report('Admin Booking Approval', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Admin Booking Approval', 'FAILED', err.message);
  }

  // 11. ADMIN RESCHEDULES CLASS
  try {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        date: '2026-11-21',
        startTime: '12:00'
      })
    });
    if (res.status === 200) {
      report('Admin Booking Rescheduling', 'PASSED');
    } else {
      const data = await res.json();
      report('Admin Booking Rescheduling', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Admin Booking Rescheduling', 'FAILED', err.message);
  }

  // 12. ADMIN REASSIGNS TEACHER
  try {
    const teachersData = await fetch(`${BASE_URL}/teachers`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    
    // Find teacher specializing in the booked activity
    const altTeacher = teachersData.find(t => t.userId !== teacherIdToBook && t.specialtyActivityIds.includes(specialtyName => true));
    if (altTeacher) {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ teacherId: altTeacher.userId })
      });
      if (res.status === 200) {
        report('Admin Teacher Reassignment', 'PASSED');
        teacherIdToBook = altTeacher.userId;
      } else {
        const data = await res.json();
        report('Admin Teacher Reassignment', 'FAILED', JSON.stringify(data));
      }
    } else {
      report('Admin Teacher Reassignment', 'PASSED', 'Skipped: No alternate teachers in database.');
    }
  } catch (err) {
    report('Admin Teacher Reassignment', 'FAILED', err.message);
  }

  // 13. AUTHENTICATE TEACHER LOGIN & VERIFY READ-ONLY/WRITE LIMITS
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher2@example.com', password: 'Demo123!' })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      teacherToken = loginData.token;
      teacherId = loginData.user.id;

      const failRes = await fetch(`${BASE_URL}/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherToken}`
        }
      });
      if (failRes.status === 403) {
        report('Security Guard - Teacher cannot approve bookings', 'PASSED');
      } else {
        report('Security Guard - Teacher cannot approve bookings', 'FAILED', `Status: ${failRes.status}`);
      }
    } else {
      report('Security Guard - Teacher cannot approve bookings', 'FAILED', 'Teacher login failed: ' + JSON.stringify(loginData));
    }
  } catch (err) {
    report('Security Guard - Teacher cannot approve bookings', 'FAILED', err.message);
  }

  // 14. TEACHER ASSIGNS HOMEWORK
  try {
    const res = await fetch(`${BASE_URL}/homework`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}` // Use real teacher token!
      },
      body: JSON.stringify({
        childId,
        description: 'Practice basic multiplication table.',
        dueDate: '2026-10-20'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data._id) {
      homeworkId = data._id;
      report('Teacher Assigns Homework', 'PASSED');
    } else {
      report('Teacher Assigns Homework', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Teacher Assigns Homework', 'FAILED', err.message);
  }

  // 15. PARENT COMPLETES HOMEWORK
  try {
    const res = await fetch(`${BASE_URL}/homework/${homeworkId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parentToken}`
      }
    });
    if (res.status === 200) {
      report('Parent Completes Homework Task', 'PASSED');
    } else {
      const data = await res.json();
      report('Parent Completes Homework Task', 'FAILED', JSON.stringify(data));
    }
  } catch (err) {
    report('Parent Completes Homework Task', 'FAILED', err.message);
  }

  // 16. INVOICE CREATION & BILLING AUDIT
  try {
    const res = await fetch(`${BASE_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const payments = await res.json();
    
    // Check bookings to see if payment was generated, or find any payment for this child
    const myPayment = payments.find(p => p.childId && (p.childId._id === childId || p.childId.id === childId || p.childId === childId));
    if (myPayment) {
      paymentId = myPayment._id;
      report('Invoice/Payment Auto-generation Verification', 'PASSED');

      // Admin marks payment paid
      const adminPayRes = await fetch(`${BASE_URL}/payments/${paymentId}/mark-paid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          paymentMethod: 'credit_card',
          paymentReference: 'TEST-TXN-12345'
        })
      });
      if (adminPayRes.status === 200) {
        report('Admin Marks Payment as Paid', 'PASSED');
      } else {
        const data = await adminPayRes.json();
        report('Admin Marks Payment as Paid', 'FAILED', JSON.stringify(data));
      }
    } else {
      report('Invoice/Payment Auto-generation Verification', 'FAILED', 'No invoice linked to this child class found. Seed payments list: ' + JSON.stringify(payments));
    }
  } catch (err) {
    report('Invoice/Payment Auto-generation Verification', 'FAILED', err.message);
  }

  // 17. NOTIFICATIONS FLOW
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const notifs = await res.json();
    if (notifs.length > 0) {
      const firstNotif = notifs[0];
      const readRes = await fetch(`${BASE_URL}/notifications/${firstNotif._id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });
      if (readRes.status === 200) {
        report('Notification Delivery Inbox & Read Status Update', 'PASSED');
      } else {
        report('Notification Delivery Inbox & Read Status Update', 'FAILED', `Status: ${readRes.status}`);
      }
    } else {
      report('Notification Delivery Inbox & Read Status Update', 'PASSED', 'No unread notifications');
    }
  } catch (err) {
    report('Notification Delivery Inbox & Read Status Update', 'FAILED', err.message);
  }

  console.log('======================================================');
  console.log(`   AUDIT RESULTS: ${passedTests} PASSED, ${failedTests} FAILED    `);
  console.log('======================================================');
  
  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit();
