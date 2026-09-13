/**
 * LabourLink Authentication & Role-Based Access Control System
 * Manages separate sessions, registration, login, and data storage for:
 * - Customer Portal (customer.html)
 * - Worker / Labour Hub (labour.html)
 * - B2B Enterprise Portal (b2b.html)
 * - Admin Panel (admin.html)
 */

const AuthSystem = {
  USERS_KEY: 'LL_USERS_DB',
  SESSION_KEY: 'LL_SESSION',
  ADMIN_CREDENTIALS: { id: 'admin', password: 'LabourLink@Admin2025', role: 'admin', name: 'Platform Administrator' },

  // Default seed data for immediate demonstration if storage is empty
  DEFAULT_SEED_USERS: [
    // Customers
    {
      id: 'cust_seed_1',
      role: 'customer',
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'priya.sharma@example.com',
      password: 'password123',
      city: 'Mumbai',
      address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
      createdAt: '2026-09-01T10:30:00.000Z',
      status: 'active',
      totalBookings: 8,
      walletBalance: 450,
      tier: 'Gold',
      loyaltyPoints: 120
    },
    {
      id: 'cust_seed_2',
      role: 'customer',
      name: 'Rajesh Patel',
      phone: '9820123456',
      email: 'rajesh.patel@example.com',
      password: 'password123',
      city: 'Pune',
      address: 'Plot 12, Kalyani Nagar, Pune',
      createdAt: '2026-09-03T14:15:00.000Z',
      status: 'active',
      totalBookings: 4,
      walletBalance: 200,
      tier: 'Silver',
      loyaltyPoints: 60
    },
    {
      id: 'cust_seed_3',
      role: 'customer',
      name: 'Anita Desai',
      phone: '9811223344',
      email: 'anita.d@example.com',
      password: 'password123',
      city: 'Delhi NCR',
      address: 'Flat 102, Green Park Extension, New Delhi',
      createdAt: '2026-09-06T09:00:00.000Z',
      status: 'active',
      totalBookings: 2,
      walletBalance: 100,
      tier: 'Bronze',
      loyaltyPoints: 30
    },

    // Workers / Labour
    {
      id: 'lab_seed_1',
      role: 'labour',
      name: 'Ramesh Kumar',
      phone: '9876500001',
      email: 'ramesh.kumar@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Electrician',
      experience: '6',
      createdAt: '2026-08-15T08:00:00.000Z',
      status: 'active',
      rating: 4.9,
      totalJobs: 142,
      walletBalance: 3250,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Certified Pro'
    },
    {
      id: 'lab_seed_2',
      role: 'labour',
      name: 'Suresh Yadav',
      phone: '9876500002',
      email: 'suresh.yadav@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Plumber',
      experience: '8',
      createdAt: '2026-08-20T11:20:00.000Z',
      status: 'active',
      rating: 4.8,
      totalJobs: 98,
      walletBalance: 1800,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Verified'
    },
    {
      id: 'lab_seed_3',
      role: 'labour',
      name: 'Dilip Verma',
      phone: '9876500003',
      email: 'dilip.v@labourlink.in',
      password: 'password123',
      city: 'Pune',
      category: 'Painter',
      experience: '4',
      createdAt: '2026-09-02T13:45:00.000Z',
      status: 'active',
      rating: 4.7,
      totalJobs: 46,
      walletBalance: 2400,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: false },
      badge: 'Verified'
    },
    {
      id: 'lab_seed_4',
      role: 'labour',
      name: 'Mohan Lal',
      phone: '9876500004',
      email: 'mohan.lal@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Carpenter',
      experience: '5',
      createdAt: '2026-09-10T16:10:00.000Z',
      status: 'pending',
      rating: 4.6,
      totalJobs: 12,
      walletBalance: 850,
      onboardingStage: 4,
      documents: { aadhar: true, pan: false, bank: true, photo: true, policeVerification: false },
      badge: 'Under Review'
    },
    {
      id: 'lab_seed_5',
      role: 'labour',
      name: 'Raju Shinde',
      phone: '9876500005',
      email: 'raju.s@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Loader',
      experience: '3',
      createdAt: '2026-09-08T10:00:00.000Z',
      status: 'active',
      rating: 4.8,
      totalJobs: 64,
      walletBalance: 1600,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Verified'
    },

    // B2B Enterprise Clients
    {
      id: 'b2b_seed_1',
      role: 'b2b',
      name: 'Vikram Singhania',
      companyName: 'Apex Infrastructure Ltd',
      phone: '9899001122',
      email: 'v.singhania@apexinfra.com',
      password: 'password123',
      city: 'Mumbai',
      gst: '27AAACA9012A1ZG',
      contactPerson: 'Vikram Singhania (VP Operations)',
      createdAt: '2026-08-10T12:00:00.000Z',
      status: 'active',
      totalContracts: 5,
      activeHeadcount: 24,
      creditLimit: 250000,
      monthlyBilling: 185000
    },
    {
      id: 'b2b_seed_2',
      role: 'b2b',
      name: 'Aditi Roy',
      companyName: 'BuildCon Projects Pvt Ltd',
      phone: '9877889900',
      email: 'procurement@buildcon.in',
      password: 'password123',
      city: 'Pune',
      gst: '27AABCB8765B1ZH',
      contactPerson: 'Aditi Roy (Site Manager)',
      createdAt: '2026-08-28T15:30:00.000Z',
      status: 'active',
      totalContracts: 2,
      activeHeadcount: 12,
      creditLimit: 150000,
      monthlyBilling: 92000
    },
    {
      id: 'b2b_seed_3',
      role: 'b2b',
      name: 'Harish Mehta',
      companyName: 'Urban Logistics & Warehousing',
      phone: '9844556677',
      email: 'harish@urbanlogistics.com',
      password: 'password123',
      city: 'Mumbai',
      gst: '27AABCU4321C1ZJ',
      contactPerson: 'Harish Mehta (Fleet Lead)',
      createdAt: '2026-09-05T11:00:00.000Z',
      status: 'active',
      totalContracts: 3,
      activeHeadcount: 18,
      creditLimit: 200000,
      monthlyBilling: 140000
    }
  ],

  /* ── Storage Access ── */
  _getUsers() {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) {
      // Seed with rich default database on first run
      this._saveUsers(this.DEFAULT_SEED_USERS);
      return [...this.DEFAULT_SEED_USERS];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...this.DEFAULT_SEED_USERS];
    } catch (e) {
      return [...this.DEFAULT_SEED_USERS];
    }
  },

  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  _generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  },

  /* ── Session Management ── */
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...user, loginAt: Date.now() }));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  getRedirectUrlForRole(role) {
    switch (role) {
      case 'customer': return 'customer.html';
      case 'labour':   return 'labour.html';
      case 'b2b':      return 'b2b.html';
      case 'admin':    return 'admin.html';
      default:         return 'auth.html';
    }
  },

  /* ── Strict Role Guard ── */
  requireAuth(expectedRole) {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'auth.html';
      return null;
    }

    // If expectedRole is specified, enforce that this user belongs to this portal
    if (expectedRole) {
      // Admin is permitted to inspect other portals
      if (session.role === 'admin') {
        return session;
      }
      if (session.role !== expectedRole) {
        // Redirect to their own rightful portal
        window.location.href = this.getRedirectUrlForRole(session.role);
        return null;
      }
    }
    return session;
  },

  /* ── User Registration ── */
  register(role, formData) {
    const users = this._getUsers();
    const existing = users.find(u => u.phone === formData.phone && u.role === role);
    if (existing) {
      return { ok: false, msg: `Phone number ${formData.phone} is already registered as a ${role}. Please log in.` };
    }

    const newUser = {
      id: this._generateId(role),
      role,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      password: formData.password,
      city: formData.city || 'Mumbai',
      createdAt: new Date().toISOString(),
      status: role === 'labour' ? 'pending' : 'active',

      // Role-specific fields
      ...(role === 'customer' && {
        address: formData.address || 'Flat 402, Mumbai',
        totalBookings: 0,
        walletBalance: 0,
        tier: 'Bronze',
        loyaltyPoints: 0
      }),

      ...(role === 'labour' && {
        category: formData.category || 'General Helper',
        experience: formData.experience || '1',
        rating: 5.0,
        totalJobs: 0,
        walletBalance: 0,
        onboardingStage: 1,
        documents: { aadhar: false, pan: false, bank: false, photo: false, policeVerification: false },
        badge: 'New Worker'
      }),

      ...(role === 'b2b' && {
        companyName: formData.companyName || formData.name + ' Enterprises',
        gst: formData.gst || '',
        contactPerson: formData.name,
        totalContracts: 0,
        activeHeadcount: 0,
        creditLimit: 100000,
        monthlyBilling: 0
      })
    };

    users.unshift(newUser);
    this._saveUsers(users);
    this.setSession(newUser);
    return { ok: true, user: newUser, redirectUrl: this.getRedirectUrlForRole(role) };
  },

  /* ── User Login ── */
  login(role, identifier, password) {
    // Admin login
    if (role === 'admin') {
      if (
        (identifier === this.ADMIN_CREDENTIALS.id || identifier === 'admin@labourlink.in') &&
        password === this.ADMIN_CREDENTIALS.password
      ) {
        const adminUser = { ...this.ADMIN_CREDENTIALS };
        this.setSession(adminUser);
        return { ok: true, user: adminUser, redirectUrl: 'admin.html' };
      }
      return { ok: false, msg: 'Invalid admin ID or password.' };
    }

    const users = this._getUsers();
    // Allow login by phone or email
    const user = users.find(
      u => u.role === role && (u.phone === identifier || u.email === identifier) && u.password === password
    );

    if (!user) {
      return { ok: false, msg: 'Incorrect phone number or password for this role.' };
    }

    if (user.status === 'blocked') {
      return { ok: false, msg: 'This account has been suspended by the administrator.' };
    }

    this.setSession(user);
    return { ok: true, user, redirectUrl: this.getRedirectUrlForRole(role) };
  },

  /* ── 1-Click Demo Login ── */
  demoLogin(role) {
    if (role === 'admin') {
      const adminUser = { ...this.ADMIN_CREDENTIALS };
      this.setSession(adminUser);
      return { ok: true, user: adminUser, redirectUrl: 'admin.html' };
    }

    const users = this._getUsers();
    const candidate = users.find(u => u.role === role && u.status === 'active') || users.find(u => u.role === role);
    if (!candidate) {
      return { ok: false, msg: `No sample ${role} account available.` };
    }

    this.setSession(candidate);
    return { ok: true, user: candidate, redirectUrl: this.getRedirectUrlForRole(role) };
  },

  /* ── Admin Operations ── */
  getAllUsers() {
    return this._getUsers();
  },

  getUsersByRole(role) {
    return this._getUsers().filter(u => u.role === role);
  },

  updateUser(userId, updates) {
    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    this._saveUsers(users);

    const session = this.getSession();
    if (session && session.id === userId) {
      this.setSession(users[idx]);
    }
    return true;
  },

  deleteUser(userId) {
    const users = this._getUsers().filter(u => u.id !== userId);
    this._saveUsers(users);
  },

  logout() {
    this.clearSession();
    window.location.href = 'auth.html';
  }
};

window.AuthSystem = AuthSystem;
