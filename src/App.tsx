import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Settings, 
  Users, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Check, 
  Sun, 
  Moon, 
  Building, 
  Square, 
  ChevronRight,
  Sparkles,
  Info,
  X,
  FileText,
  UserCheck,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Solopreneur, Client, Invoice, FollowUp, InvoiceStatus } from './types';
import { 
  INITIAL_SOLOPRENEUR, 
  INITIAL_CLIENTS, 
  INITIAL_INVOICES, 
  INITIAL_FOLLOWUPS 
} from './initialData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Helper to format date strings cleanly
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Main App Component
export default function App() {
  // --- Supabase Cloud Sync Info States ---
  const [supabaseStatus, setSupabaseStatus] = useState<'unconfigured' | 'syncing' | 'connected' | 'error'>('unconfigured');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState<boolean>(false);

  // --- Auth Session & UI States ---
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [isAuthSignUp, setIsAuthSignUp] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [exploreGuestDemo, setExploreGuestDemo] = useState<boolean>(false);

  // --- Persistent LocalState ---
  const [solopreneur, setSolopreneur] = useState<Solopreneur>(() => {
    const saved = localStorage.getItem('crm_solopreneur');
    return saved ? JSON.parse(saved) : INITIAL_SOLOPRENEUR;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('crm_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('crm_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [followups, setFollowups] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('crm_followups');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_dark_mode');
    return saved ? JSON.parse(saved) === 'true' : false;
  });

  // Keep localStorage in sync (Offline-first fallback, namespaced by user ID to prevent data bleed)
  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem(`crm_solopreneur_${session.user.id}`, JSON.stringify(solopreneur));
    } else if (exploreGuestDemo) {
      localStorage.setItem('crm_solopreneur_guest', JSON.stringify(solopreneur));
    } else {
      localStorage.setItem('crm_solopreneur', JSON.stringify(solopreneur));
    }
  }, [solopreneur, session, exploreGuestDemo]);

  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem(`crm_clients_${session.user.id}`, JSON.stringify(clients));
    } else if (exploreGuestDemo) {
      localStorage.setItem('crm_clients_guest', JSON.stringify(clients));
    } else {
      localStorage.setItem('crm_clients', JSON.stringify(clients));
    }
  }, [clients, session, exploreGuestDemo]);

  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem(`crm_invoices_${session.user.id}`, JSON.stringify(invoices));
    } else if (exploreGuestDemo) {
      localStorage.setItem('crm_invoices_guest', JSON.stringify(invoices));
    } else {
      localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    }
  }, [invoices, session, exploreGuestDemo]);

  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem(`crm_followups_${session.user.id}`, JSON.stringify(followups));
    } else if (exploreGuestDemo) {
      localStorage.setItem('crm_followups_guest', JSON.stringify(followups));
    } else {
      localStorage.setItem('crm_followups', JSON.stringify(followups));
    }
  }, [followups, session, exploreGuestDemo]);

  useEffect(() => {
    localStorage.setItem('crm_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Populate guest simulation demo data when guest mode is explicitly selected by clicking the simulation button
  useEffect(() => {
    if (exploreGuestDemo && !session) {
      const savedSolo = localStorage.getItem('crm_solopreneur_guest');
      const savedClients = localStorage.getItem('crm_clients_guest');
      const savedInvoices = localStorage.getItem('crm_invoices_guest');
      const savedFollowups = localStorage.getItem('crm_followups_guest');

      setSolopreneur(savedSolo ? JSON.parse(savedSolo) : INITIAL_SOLOPRENEUR);
      setClients(savedClients ? JSON.parse(savedClients) : INITIAL_CLIENTS);
      setInvoices(savedInvoices ? JSON.parse(savedInvoices) : INITIAL_INVOICES);
      setFollowups(savedFollowups ? JSON.parse(savedFollowups) : INITIAL_FOLLOWUPS);
    }
  }, [exploreGuestDemo, session]);

  // --- Subscribe to active Supabase session changes ---
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Fetch initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          setExploreGuestDemo(false);
          // Load user-namespaced local cache to avoid fetch flicker
          const userId = session.user.id;
          const cachedSolo = localStorage.getItem(`crm_solopreneur_${userId}`);
          const cachedClients = localStorage.getItem(`crm_clients_${userId}`);
          const cachedInvoices = localStorage.getItem(`crm_invoices_${userId}`);
          const cachedFollowups = localStorage.getItem(`crm_followups_${userId}`);

          if (cachedSolo) setSolopreneur(JSON.parse(cachedSolo));
          if (cachedClients) setClients(JSON.parse(cachedClients));
          if (cachedInvoices) setInvoices(JSON.parse(cachedInvoices));
          if (cachedFollowups) setFollowups(JSON.parse(cachedFollowups));
        }
      }).catch(err => {
        console.warn("Could not retrieve initial session, offline-first fallback:", err);
      });

      // Listen for updates
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          setExploreGuestDemo(false);
          setAuthError('');
          setAuthEmail('');
          setAuthPassword('');

          // Load user-namespaced local cache
          const userId = session.user.id;
          const cachedSolo = localStorage.getItem(`crm_solopreneur_${userId}`);
          const cachedClients = localStorage.getItem(`crm_clients_${userId}`);
          const cachedInvoices = localStorage.getItem(`crm_invoices_${userId}`);
          const cachedFollowups = localStorage.getItem(`crm_followups_${userId}`);

          if (cachedSolo) setSolopreneur(JSON.parse(cachedSolo));
          if (cachedClients) setClients(JSON.parse(cachedClients));
          if (cachedInvoices) setInvoices(JSON.parse(cachedInvoices));
          if (cachedFollowups) setFollowups(JSON.parse(cachedFollowups));
        } else {
          // Wipe state details cleanly on logout
          setClients([]);
          setInvoices([]);
          setFollowups([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // --- Automatic solopreneur profile upsert listener ---
  useEffect(() => {
    if (isSupabaseConfigured && supabase && session) {
      const timer = setTimeout(async () => {
        try {
          const userId = session.user.id;
          await supabase.from('crm_solopreneurs').upsert({
            id: `solo-${userId}`,
            user_id: userId,
            business_name: solopreneur.businessName,
            whatsapp_template: solopreneur.whatsappTemplate,
            sms_template: solopreneur.smsTemplate
          });
        } catch (e) {
          console.warn("Templates autosync skipped", e);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [solopreneur, session]);

  // --- Live Mount Database Hydration ---
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured || !supabase) {
        setSupabaseStatus('unconfigured');
        setSyncMessage('Local Mode: Set VITE_SUPABASE_* keys to sync');
        return;
      }

      // If we are NOT logged in, revert to local settings/INITIAL demo models ONLY if explicitly exploring guest mode.
      if (!session) {
        setSupabaseStatus('unconfigured');
        if (exploreGuestDemo) {
          setSyncMessage('Guest simulation sandbox active.');
          const savedSolo = localStorage.getItem('crm_solopreneur_guest');
          const savedClients = localStorage.getItem('crm_clients_guest');
          const savedInvoices = localStorage.getItem('crm_invoices_guest');
          const savedFollowups = localStorage.getItem('crm_followups_guest');

          setSolopreneur(savedSolo ? JSON.parse(savedSolo) : INITIAL_SOLOPRENEUR);
          setClients(savedClients ? JSON.parse(savedClients) : INITIAL_CLIENTS);
          setInvoices(savedInvoices ? JSON.parse(savedInvoices) : INITIAL_INVOICES);
          setFollowups(savedFollowups ? JSON.parse(savedFollowups) : INITIAL_FOLLOWUPS);
        } else {
          setSyncMessage('Connect cloud database to sync.');
          setClients([]);
          setInvoices([]);
          setFollowups([]);
        }
        return;
      }
      
      try {
        setSupabaseStatus('syncing');
        setSyncMessage('Fetching your cloud accounts...');
        setIsLoadingFromSupabase(true);

        const userId = session.user.id;

        // 1. Fetch user-specific Solopreneur Settings
        const { data: rawSolos, error: soloErr } = await supabase
          .from('crm_solopreneurs')
          .select('*')
          .eq('user_id', userId)
          .limit(1);
          
        if (soloErr) throw soloErr;

        if (rawSolos && rawSolos.length > 0) {
          const s = rawSolos[0];
          setSolopreneur({
            businessName: s.business_name,
            whatsappTemplate: s.whatsapp_template,
            smsTemplate: s.sms_template
          });
        } else {
          // If no row exists, create it using simple initial defaults for this user
          const defaultSoloDetails = {
            id: `solo-${userId}`,
            user_id: userId,
            business_name: "Apex Craft & Repairs",
            whatsapp_template: INITIAL_SOLOPRENEUR.whatsappTemplate,
            sms_template: INITIAL_SOLOPRENEUR.smsTemplate
          };
          await supabase.from('crm_solopreneurs').insert(defaultSoloDetails);
          setSolopreneur({
            businessName: defaultSoloDetails.business_name,
            whatsappTemplate: defaultSoloDetails.whatsapp_template,
            smsTemplate: defaultSoloDetails.sms_template
          });
        }

        // 2. Load User-Specific Clients
        const { data: rawClients, error: clientsErr } = await supabase
          .from('crm_clients')
          .select('*')
          .eq('user_id', userId);
        if (clientsErr) throw clientsErr;

        if (rawClients && rawClients.length > 0) {
          const formattedClients: Client[] = rawClients.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            notes: c.notes || '',
            status: c.status as 'Active' | 'Inactive',
            createdAt: c.created_at
          }));
          setClients(formattedClients);
        } else {
          // Start completely blank for non-seeded registered accounts (no default/demo data!)
          setClients([]);
        }

        // 3. Load User-Specific Invoices
        const { data: rawInvoices, error: invErr } = await supabase
          .from('crm_invoices')
          .select('*')
          .eq('user_id', userId);
        if (invErr) throw invErr;

        if (rawInvoices && rawInvoices.length > 0) {
          const formattedInvoices: Invoice[] = rawInvoices.map(i => ({
            id: i.id,
            clientId: i.client_id,
            amount: Number(i.amount),
            status: i.status as 'Paid' | 'Pending' | 'Overdue',
            dueDate: i.due_date,
            description: i.description
          }));
          setInvoices(formattedInvoices);
        } else {
          setInvoices([]);
        }

        // 4. Load User-Specific Follow-ups
        const { data: rawFollowups, error: followErr } = await supabase
          .from('crm_followups')
          .select('*')
          .eq('user_id', userId);
        if (followErr) throw followErr;

        if (rawFollowups && rawFollowups.length > 0) {
          const formattedFollowups: FollowUp[] = rawFollowups.map(f => ({
            id: f.id,
            clientId: f.client_id,
            date: f.date,
            description: f.description,
            completed: f.completed
          }));
          setFollowups(formattedFollowups);
        } else {
          setFollowups([]);
        }

        setSupabaseStatus('connected');
        setSyncMessage('Cloud database sync active!');
      } catch (err: any) {
        console.error("Supabase load failed, keeping offline mode:", err);
        setSupabaseStatus('error');
        setSyncMessage(err.message || 'Verification failure');
      } finally {
        setIsLoadingFromSupabase(false);
      }
    }

    loadData();
  }, [session, isSupabaseConfigured]);


  // --- Active Session Navigation ---
  // Default tabs: 'dashboard' | 'clients' | 'invoices' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'invoices' | 'settings'>('dashboard');
  
  // Drill-down sheets / detailed views
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);

  // Search parameters
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [invoiceFilter, setInvoiceFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');

  // --- Quick Add Form State ---
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceDesc, setNewInvoiceDesc] = useState('Service rendering');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [newFollowUpDesc, setNewFollowUpDesc] = useState('Following up on service satisfaction');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; amount?: string }>({});

  // --- Client Detail Addition forms (inside client sheet) ---
  const [showAddInvoiceInline, setShowAddInvoiceInline] = useState(false);
  const [inlineInvoiceAmount, setInlineInvoiceAmount] = useState('');
  const [inlineInvoiceDesc, setInlineInvoiceDesc] = useState('');
  const [inlineInvoiceDueDate, setInlineInvoiceDueDate] = useState('2026-05-28');

  const [showAddFollowupInline, setShowAddFollowupInline] = useState(false);
  const [inlineFollowupDate, setInlineFollowupDate] = useState('2026-05-21');
  const [inlineFollowupDesc, setInlineFollowupDesc] = useState('');

  // --- Current Date Settings ---
  const TODAY_STR = "2026-05-21"; // Anchored to May 21, 2026 per current metadata

  // --- Form Validation Functions ---
  const validateQuickAdd = () => {
    const errors: { name?: string; phone?: string; amount?: string } = {};
    if (!newClientName.trim()) {
      errors.name = "Client name is required";
    }
    if (!newClientPhone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{7,15}$/.test(newClientPhone.trim())) {
      errors.phone = "Invalid phone number format";
    }
    if (newInvoiceAmount && isNaN(Number(newInvoiceAmount))) {
      errors.amount = "Must be a valid positive number";
    } else if (newInvoiceAmount && Number(newInvoiceAmount) < 0) {
      errors.amount = "Amount cannot be negative";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Calculations ---
  // 1. Total Paid Revenue This Month (May 2026)
  const revenueThisMonth = useMemo(() => {
    return invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [invoices]);

  // 2. Overdue Payments sum & count
  const overdueData = useMemo(() => {
    const overdueList = invoices.filter(i => i.status === 'Overdue');
    const totalAmount = overdueList.reduce((sum, item) => sum + item.amount, 0);
    return {
      count: overdueList.length,
      amount: totalAmount
    };
  }, [invoices]);

  // 3. Follow-ups Today
  const followupsTodayCount = useMemo(() => {
    return followups.filter(f => f.date === TODAY_STR && !f.completed).length;
  }, [followups]);

  // Sorting Lists for Dashboard
  // List A: Urgent Payments Due (Pending or Overdue), sorted oldest due date first (highest severity first)
  const urgentPayments = useMemo(() => {
    return invoices
      .filter(i => i.status === 'Overdue' || i.status === 'Pending')
      .map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return { ...invoice, client };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [invoices, clients]);

  // List B: Today's Follow-ups (Due on or before today and not completed)
  const todaysFollowups = useMemo(() => {
    return followups
      .filter(f => f.date <= TODAY_STR && !f.completed)
      .map(f => {
        const client = clients.find(c => c.id === f.clientId);
        return { ...f, client };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [followups, clients]);

  // File search client lists
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                          c.phone.includes(clientSearchQuery) ||
                          (c.email && c.email.toLowerCase().includes(clientSearchQuery.toLowerCase())) ||
                          (c.notes && c.notes.toLowerCase().includes(clientSearchQuery.toLowerCase()));
      const matchStatus = clientStatusFilter === 'All' || c.status === clientStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, clientSearchQuery, clientStatusFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return { ...invoice, clientName: client ? client.name : 'Unknown Client' };
      })
      .filter(item => {
        return invoiceFilter === 'All' || (item.status as string) === invoiceFilter;
      })
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [invoices, clients, invoiceFilter]);

  // Currently Selected Client full profile
  const selectedClientDetails = useMemo(() => {
    if (!selectedClientId) return null;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return null;

    const clientInvoices = invoices.filter(i => i.clientId === selectedClientId);
    const clientFollowups = followups.filter(f => f.clientId === selectedClientId);

    return {
      client,
      invoices: clientInvoices,
      followups: clientFollowups
    };
  }, [selectedClientId, clients, invoices, followups]);

  // --- Handlers & Sync Helpers ---
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuickAdd()) return;

    const clientId = `c-${Date.now()}`;
    const newClientObj: Client = {
      id: clientId,
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
      notes: "Auto-logged from Quick Add view.",
      status: "Active",
      createdAt: TODAY_STR
    };

    // Update local state instantly (Optimistic Mode)
    setClients(prev => [newClientObj, ...prev]);

    // Construct objects
    let newInvoiceObj: Invoice | null = null;
    let newFollowUpObj: FollowUp | null = null;

    // If invoice amount is provided, log an invoice
    if (newInvoiceAmount && Number(newInvoiceAmount) > 0) {
      newInvoiceObj = {
        id: `i-${Date.now()}`,
        clientId: clientId,
        amount: Number(newInvoiceAmount),
        status: "Pending",
        dueDate: newFollowUpDate || "2026-05-28", // default to 1 week from now if not given
        description: newInvoiceDesc.trim() || "Service rendered"
      };
      setInvoices(prev => [newInvoiceObj!, ...prev]);
    }

    // If follow-up date is provided, log a follow-up
    if (newFollowUpDate) {
      newFollowUpObj = {
        id: `f-${Date.now()}`,
        clientId: clientId,
        date: newFollowUpDate,
        description: newFollowUpDesc.trim() || 'Invoice & service pickup follow up',
        completed: false
      };
      setFollowups(prev => [newFollowUpObj!, ...prev]);
    }

    // Background push to Supabase (Non-blocking)
    if (isSupabaseConfigured && supabase) {
      try {
        const userId = session?.user?.id;
        
        // 1. Insert Client with optional user_id linkage
        const clientData: any = {
          id: newClientObj.id,
          name: newClientObj.name,
          phone: newClientObj.phone,
          email: newClientObj.email,
          notes: newClientObj.notes,
          status: newClientObj.status,
          created_at: newClientObj.createdAt
        };
        if (userId) clientData.user_id = userId;
        await supabase.from('crm_clients').insert(clientData);

        // 2. Insert Invoice if available
        if (newInvoiceObj) {
          const invoiceData: any = {
            id: newInvoiceObj.id,
            client_id: newInvoiceObj.clientId,
            amount: newInvoiceObj.amount,
            status: newInvoiceObj.status,
            due_date: newInvoiceObj.dueDate,
            description: newInvoiceObj.description
          };
          if (userId) invoiceData.user_id = userId;
          await supabase.from('crm_invoices').insert(invoiceData);
        }

        // 3. Insert Followup if available
        if (newFollowUpObj) {
          const followupData: any = {
            id: newFollowUpObj.id,
            client_id: newFollowUpObj.clientId,
            date: newFollowUpObj.date,
            description: newFollowUpObj.description,
            completed: newFollowUpObj.completed
          };
          if (userId) followupData.user_id = userId;
          await supabase.from('crm_followups').insert(followupData);
        }
      } catch (err) {
        console.error("Supabase quickadd sync failed:", err);
      }
    }

    // Reset fields and close
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewInvoiceAmount('');
    setNewInvoiceDesc('Service rendering');
    setNewFollowUpDate('');
    setNewFollowUpDesc('Following up on service satisfaction');
    setFormErrors({});
    setIsQuickAddOpen(false);
  };

  const handleMarkPaymentStatus = (invoiceId: string, status: InvoiceStatus) => {
    // Local Update
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status };
      }
      return inv;
    }));

    // Save status to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('crm_invoices')
        .update({ status })
        .eq('id', invoiceId)
        .then(({ error }) => {
          if (error) console.error("Cloud status updates skipped:", error);
        });
    }
  };

  const handleToggleFollowupCompleted = (fId: string) => {
    let nextCompl = false;
    // Local Update
    setFollowups(prev => prev.map(f => {
      if (f.id === fId) {
        nextCompl = !f.completed;
        return { ...f, completed: nextCompl };
      }
      return f;
    }));

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('crm_followups')
        .update({ completed: nextCompl })
        .eq('id', fId)
        .then(({ error }) => {
          if (error) console.error("Cloud schedule updating failed:", error);
        });
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client? All connected invoices and tasks will be stored for audit but hidden.")) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      setSelectedClientId(null);

      // Cascade delete in Supabase
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('crm_clients')
          .delete()
          .eq('id', clientId)
          .then(({ error }) => {
            if (error) console.error("Cloud client deletion failed:", error);
          });
      }
    }
  };

  const handleAddInvoiceInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const amountNum = Number(inlineInvoiceAmount);
    if (!inlineInvoiceAmount || isNaN(amountNum) || amountNum < 0) {
      alert("Please input a valid positive amount");
      return;
    }

    const newInv: Invoice = {
      id: `i-${Date.now()}`,
      clientId: selectedClientId,
      amount: amountNum,
      status: "Pending",
      dueDate: inlineInvoiceDueDate || "2026-05-28",
      description: inlineInvoiceDesc.trim() || "Manual log fee"
    };

    // Local state
    setInvoices(prev => [newInv, ...prev]);
    setInlineInvoiceAmount('');
    setInlineInvoiceDesc('');
    setShowAddInvoiceInline(false);

    // Sync state
    if (isSupabaseConfigured && supabase) {
      const userId = session?.user?.id;
      const invoiceData: any = {
        id: newInv.id,
        client_id: newInv.clientId,
        amount: newInv.amount,
        status: newInv.status,
        due_date: newInv.dueDate,
        description: newInv.description
      };
      if (userId) invoiceData.user_id = userId;
      supabase.from('crm_invoices').insert(invoiceData).then(({ error }) => {
        if (error) console.error("Cloud invoice insert failed:", error);
      });
    }
  };

  const handleAddFollowupInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    if (!inlineFollowupDesc.trim()) {
      alert("Please describe the follow-up task");
      return;
    }

    const newF: FollowUp = {
      id: `f-${Date.now()}`,
      clientId: selectedClientId,
      date: inlineFollowupDate,
      description: inlineFollowupDesc.trim(),
      completed: false
    };

    // Local state
    setFollowups(prev => [newF, ...prev]);
    setInlineFollowupDesc('');
    setShowAddFollowupInline(false);

    // Sync state
    if (isSupabaseConfigured && supabase) {
      const userId = session?.user?.id;
      const followupData: any = {
        id: newF.id,
        client_id: newF.clientId,
        date: newF.date,
        description: newF.description,
        completed: newF.completed
      };
      if (userId) followupData.user_id = userId;
      supabase.from('crm_followups').insert(followupData).then(({ error }) => {
        if (error) console.error("Cloud followup insert failed:", error);
      });
    }
  };

  // --- Dynamic Messaging Template Triggers ---
  const triggerWhatsApp = (client: Client, invoice?: Invoice) => {
    // Substitute template values
    const amountText = invoice ? invoice.amount.toString() : '0.00';
    const dueDateText = invoice ? formatDate(invoice.dueDate) : 'N/A';
    
    const parsedText = solopreneur.whatsappTemplate
      .replace(/\{\{client_name\}\}/g, client.name)
      .replace(/\{\{amount\}\}/g, amountText)
      .replace(/\{\{due_date\}\}/g, dueDateText);

    // clean phone for link
    const cleanPhone = client.phone.replace(/[^\d+]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(parsedText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const triggerSMS = (client: Client, invoice?: Invoice) => {
    const amountText = invoice ? invoice.amount.toString() : '0.00';
    const dueDateText = invoice ? formatDate(invoice.dueDate) : 'N/A';

    const parsedText = solopreneur.smsTemplate
      .replace(/\{\{client_name\}\}/g, client.name)
      .replace(/\{\{amount\}\}/g, amountText)
      .replace(/\{\{due_date\}\}/g, dueDateText);

    const cleanPhone = client.phone.replace(/[^\d+]/g, '');
    const url = `sms:${cleanPhone}?&body=${encodeURIComponent(parsedText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Seed data trigger in case they delete everything
  const handleResetStorage = async () => {
    if (confirm("Reset application workspace? This will clear your current view and synchronize a clean state.")) {
      localStorage.clear();
      setSelectedClientId(null);
      setActiveTab('dashboard');

      if (!session) {
        // Safe Guest offline reset
        setSolopreneur(INITIAL_SOLOPRENEUR);
        setClients(INITIAL_CLIENTS);
        setInvoices(INITIAL_INVOICES);
        setFollowups(INITIAL_FOLLOWUPS);
        return;
      }

      // Clear only this logged in user's records from cloud database! Multi-user safe.
      if (isSupabaseConfigured && supabase) {
        try {
          const userId = session.user.id;
          setSyncMessage("Cleaning cloud tables...");
          await supabase.from('crm_followups').delete().eq('user_id', userId);
          await supabase.from('crm_invoices').delete().eq('user_id', userId);
          await supabase.from('crm_clients').delete().eq('user_id', userId);
          
          await supabase.from('crm_solopreneurs').upsert({
            id: `solo-${userId}`,
            user_id: userId,
            business_name: "Apex Craft & Repairs",
            whatsapp_template: INITIAL_SOLOPRENEUR.whatsappTemplate,
            sms_template: INITIAL_SOLOPRENEUR.smsTemplate
          });
          
          setSolopreneur({
            businessName: "Apex Craft & Repairs",
            whatsappTemplate: INITIAL_SOLOPRENEUR.whatsappTemplate,
            smsTemplate: INITIAL_SOLOPRENEUR.smsTemplate
          });
          setClients([]);
          setInvoices([]);
          setFollowups([]);

          setSyncMessage("Cloud tables reset successfully!");
        } catch (e) {
          console.warn("Cloud cleanup skipped:", e);
        }
      }
    }
  };

  return (
    <div id="app-root-container" className={`${darkMode ? 'dark' : ''} w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col`}>
      
      {/* Fully responsive content frame: occupies full width and height on desktop correctly, fluid adaptation on mobile screen */}
      <div id="phone-frame" className="relative flex-1 w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
        
        {/* Auth Screen Gate: Shown when Supabase is configured but user is not signed in and has not chosen mock guest mode */}
        {isSupabaseConfigured && !session && !exploreGuestDemo ? (
          <div id="auth-screen-gate" className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
            <div className="w-full max-w-sm space-y-6">
              
              {/* Core CRM Branded Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-150/10 text-indigo-600 dark:text-indigo-400 mb-2 shadow-xs">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  ApexCRM Cloud Workspace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Please register or sign in below with your email to access, synchronize, and update your personal CRM data.
                </p>
              </div>

              {/* Input Card Container */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
                <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
                  <button
                    id="signin-tab-btn"
                    type="button"
                    onClick={() => { setIsAuthSignUp(false); setAuthError(''); }}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all ${!isAuthSignUp ? 'border-indigo-500 text-indigo-600 font-bold dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-500'}`}
                  >
                    Sign In
                  </button>
                  <button
                    id="signup-tab-btn"
                    type="button"
                    onClick={() => { setIsAuthSignUp(true); setAuthError(''); }}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all ${isAuthSignUp ? 'border-indigo-500 text-indigo-600 font-bold dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-500'}`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={isAuthSignUp ? (async (e) => {
                  e.preventDefault();
                  if (!authEmail || !authPassword) {
                    setAuthError('Please fill in both email and password.');
                    return;
                  }
                  if (authPassword.length < 6) {
                    setAuthError('Password must be at least 6 characters.');
                    return;
                  }
                  try {
                    setIsLoadingFromSupabase(true);
                    setAuthError('');
                    const { error } = await supabase!.auth.signUp({
                      email: authEmail,
                      password: authPassword,
                    });
                    if (error) throw error;
                    alert('Registration successful! Check your email for verification if enabled, or sign in now.');
                    setIsAuthSignUp(false);
                    setAuthPassword('');
                  } catch (err: any) {
                    setAuthError(err.message || 'Error occurred during registration.');
                  } finally {
                    setIsLoadingFromSupabase(false);
                  }
                }) : (async (e) => {
                  e.preventDefault();
                  if (!authEmail || !authPassword) {
                    setAuthError('Please fill in both email and password.');
                    return;
                  }
                  try {
                    setIsLoadingFromSupabase(true);
                    setAuthError('');
                    const { error } = await supabase!.auth.signInWithPassword({
                      email: authEmail,
                      password: authPassword,
                    });
                    if (error) throw error;
                  } catch (err: any) {
                    setAuthError(err.message || 'Invalid email or password.');
                  } finally {
                    setIsLoadingFromSupabase(false);
                  }
                })} className="space-y-3.5">
                  {authError && (
                    <div id="auth-error-notif" className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] rounded-lg border border-rose-150/10 flex items-start gap-1.5 font-sans leading-normal">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      id="auth-email-input"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                    <input
                      id="auth-password-input"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={isLoadingFromSupabase}
                    className="mt-2 w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-350 text-white font-semibold py-2 px-3 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isLoadingFromSupabase ? "Communicating..." : (isAuthSignUp ? "Create Secure Account" : "Access CRM Workspace")}
                  </button>
                </form>
              </div>

              {/* Demo Mode Button */}
              <div className="text-center font-sans">
                <button
                  id="auth-demo-mode-btn"
                  type="button"
                  onClick={() => { setExploreGuestDemo(true); }}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
                >
                  Explore as Guest with Simulation Dataset &rarr;
                </button>
              </div>

            </div>
          </div>
        ) : (
          <>
            {/* Dismissable Demo Banner Infotip */}
            <AnimatePresence>
              {showWelcomeTip && (
                <motion.div 
                  id="feature-tip-alert"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 text-xs relative overflow-hidden shrink-0 shadow-md"
                >
                  <div className="flex gap-2.5 items-start pr-6">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-300 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Interactive Micro-CRM</p>
                      <p className="text-blue-100 leading-relaxed font-sans">
                        Tap metrics to check balance dues. Click client cards to fire dynamic SMS or WhatsApp templates with smart placeholders substituted in 3 seconds!
                      </p>
                    </div>
                  </div>
                  <button 
                    id="close-tip-btn"
                    onClick={() => setShowWelcomeTip(false)}
                    className="absolute top-2.5 right-2 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="Dismiss tip"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Toolbar Header - Hosts Custom Designed Logo & Top Right Login/Logout Buttons */}
            <header id="app-header" className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center shrink-0">
              {/* BEAUTIFUL CUSTOM DESIGNED BRAND LOGO AND MONOGRAM */}
              <div className="flex items-center gap-3 p-1">
                <div className="p-2 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-600 dark:from-indigo-600 dark:to-blue-700 rounded-xl shadow-md text-white flex items-center justify-center shrink-0">
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apex CRM Custom Brand Logo">
                    <path d="M12 2L2 21H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7L6 18H18L12 7Z" fill="currentColor" fillOpacity="0.2" />
                    <circle cx="12" cy="14" r="2.5" fill="#FFFFFF" className="dark:fill-slate-900" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-sans leading-none">
                    <span>ApexCRM</span>
                    <span className="text-[9px] font-bold text-white bg-indigo-600 dark:bg-indigo-500 px-1.5 py-0.5 rounded-full shadow-xs">PRO</span>
                  </h1>
                  <span className="text-[10.5px] font-semibold text-zinc-400 dark:text-slate-500 block mt-1 tracking-tight">{solopreneur.businessName}</span>
                </div>
              </div>

              {/* ACTION TOOLBAR & SIGN IN/OUT CONTRELS */}
              <div className="flex items-center gap-3">
                {/* Theme toggle slider */}
                <button
                  id="theme-toggle-btn"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
                >
                  {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Cloud Auth actions */}
                {isSupabaseConfigured && (
                  session ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[120px]" title={session.user.email}>
                        {session.user.email}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (supabase) {
                            await supabase.auth.signOut();
                            setSession(null);
                            setSolopreneur(INITIAL_SOLOPRENEUR);
                            setClients([]);
                            setInvoices([]);
                            setFollowups([]);
                          }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200/50 dark:border-slate-800 transition-colors cursor-pointer"
                        title="Log out of account"
                      >
                        <LogOut className="h-3 w-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setExploreGuestDemo(false); }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs transition-colors"
                      title="Access cloud storage"
                    >
                      <LogIn className="h-3 w-3" />
                      <span>Log In / Sign Up</span>
                    </button>
                  )
                )}

                {/* Quick reset/seed database info btn */}
                <button
                  id="reset-demo-btn"
                  onClick={handleResetStorage}
                  className="p-1.5 text-slate-400 hover:text-zinc-600 dark:text-slate-500 dark:hover:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Initialize workspace or clear data"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Supabase Sync Status Indicator Stripe */}
            <div id="supabase-sync-indicator" className="px-5 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between text-[10px] font-mono select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  supabaseStatus === 'syncing' ? 'bg-amber-400 animate-pulse' :
                  supabaseStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'
                }`}></span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {supabaseStatus === 'connected' ? 'Supabase Cloud Synced' :
                   supabaseStatus === 'syncing' ? 'Syncing...' :
                   supabaseStatus === 'error' ? 'Sync Offline (Error)' : 'Local Memory Only'}
                </span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] truncate max-w-[200px]">
                {syncMessage || (!isSupabaseConfigured ? 'Setup VITE_SUPABASE_* keys to connect!' : 'Local Storage active')}
              </span>
            </div>

            {/* Application Core Scroll Frame Viewport */}
            <main id="app-main-viewport" className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-slate-50 dark:bg-slate-950 pb-20">
              
              <AnimatePresence mode="wait">
                {/* VIEW A: CENTRAL DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    {/* 1. TOP SUMMARY METRIC METERS */}
                    <div id="dashboard-metric-grid" className="grid grid-cols-3 gap-3.5">
                      {/* Revenue metrics */}
                      <div 
                        id="total-revenue-stat"
                        onClick={() => { setActiveTab('invoices'); setInvoiceFilter('Paid'); }}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shadow-2xs"
                      >
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block leading-tight uppercase tracking-wider">Paid Recv</span>
                        <div className="flex items-baseline gap-0.5 mt-1.5">
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">${revenueThisMonth}</span>
                        </div>
                        <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1.5 block">Full Total</span>
                      </div>

                      {/* Overdue Payments stats click actions for quick filtration */}
                      <div 
                        id="overdue-payments-stat"
                        onClick={() => { setActiveTab('invoices'); setInvoiceFilter('Overdue'); }}
                        className={`cursor-pointer bg-red-50/40 dark:bg-red-950/10 p-4 rounded-2xl border transition-colors shadow-2xs ${overdueData.count > 0 ? 'border-red-200 dark:border-red-900/40 shadow-xs' : 'border-slate-200/50 dark:border-slate-800/80'}`}
                      >
                        <span className="text-[10px] text-red-650 dark:text-red-400 font-bold block leading-tight uppercase tracking-wider">Overdue</span>
                        <div className="flex items-baseline gap-0.5 mt-1.5">
                          <span className="text-base sm:text-lg font-extrabold text-red-650 dark:text-red-500 leading-none">${overdueData.amount}</span>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 mt-1.5">
                          {overdueData.count} pending
                        </span>
                      </div>

                      {/* Followups Stat */}
                      <div 
                        id="today-followups-stat"
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xs"
                      >
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block leading-tight uppercase tracking-wider">Tasks Today</span>
                        <div className="flex items-baseline gap-0.5 mt-1.5">
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">{followupsTodayCount}</span>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-1.5">
                          Incomplete
                        </span>
                      </div>
                    </div>

                    {/* TWO COLUMN RESPONSIVE GRID - SIDE-BY-SIDE ON DESKTOP AND FLUID STACKED ON MOBILE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                      
                      {/* 2. DYNAMIC LIST 1: URGENT PAYMENTS DUE */}
                      <div id="urgent-payments-deck" className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                            ⚠️ Overdue Invoices Balance
                          </h3>
                          <button 
                            type="button"
                            onClick={() => setActiveTab('invoices')}
                            className="text-[11px] text-indigo-600 hover:text-indigo-400 font-bold"
                          >
                            View all
                          </button>
                        </div>

                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {urgentPayments.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-6 rounded-2xl text-center">
                              <Check className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Zero Overdue Balances</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">All clients are fully clear!</p>
                            </div>
                          ) : (
                            urgentPayments.slice(0, 5).map((invoice) => (
                              <div 
                                key={invoice.id}
                                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 flex justify-between items-center transition-all cursor-pointer shadow-3xs"
                                onClick={() => invoice.clientId && setSelectedClientId(invoice.clientId)}
                              >
                                <div className="space-y-1">
                                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200">
                                    {invoice.client ? invoice.client.name : "Walk-in Customer"}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                    <span>Due {formatDate(invoice.dueDate)}</span>
                                    <span>•</span>
                                    <span className="text-red-500/80 italic">{invoice.description}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right flex items-center gap-2">
                                  <div>
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">${invoice.amount}</span>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      invoice.status === 'Overdue' 
                                        ? 'bg-red-100 dark:bg-red-950/50 text-red-600' 
                                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
                                    }`}>
                                      {invoice.status}
                                    </span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 3. DYNAMIC LIST 2: TODAY'S FOLLOW-UPS */}
                      <div id="today-followups-deck" className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                            📅 Pending Scheduling Items
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                            CRM Agenda
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {todaysFollowups.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-6 rounded-2xl text-center">
                              <UserCheck className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Schedule Fully Cleared</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Nothing else scheduled for today!</p>
                            </div>
                          ) : (
                            todaysFollowups.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex items-start gap-3 transition-all shadow-3xs"
                              >
                                <button
                                  id={`complete-task-${task.id}`}
                                  onClick={() => handleToggleFollowupCompleted(task.id)}
                                  className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-md border border-slate-350 dark:border-slate-700 flex items-center justify-center hover:bg-slate-150 dark:hover:bg-slate-800 text-transparent hover:text-slate-400 transition-all cursor-pointer"
                                  title="Complete task"
                                >
                                  <Check className="h-3 w-3" />
                                </button>

                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-baseline">
                                    <h4 
                                      className="text-xs font-extrabold text-slate-850 dark:text-slate-200 cursor-pointer hover:underline"
                                      onClick={() => task.clientId && setSelectedClientId(task.clientId)}
                                    >
                                      {task.client ? task.client.name : "Custom Request"}
                                    </h4>
                                    <span className="text-[8px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      Agenda
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-600 dark:text-slate-400 leading-relaxed">
                                    {task.description}
                                  </p>
                                  
                                  {/* Short reminder options directly accessible */}
                                  <div className="flex items-center gap-2 pt-1.5">
                                    {task.client && (
                                      <>
                                        <button
                                          onClick={() => task.client && triggerWhatsApp(task.client)}
                                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 hover:text-emerald-500 py-0.5 px-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 transition-all cursor-pointer hover:scale-105"
                                        >
                                          <MessageSquare className="h-2.5 w-2.5" /> WhatsApp
                                        </button>
                                        <button
                                          onClick={() => task.client && triggerSMS(task.client)}
                                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-600 hover:text-blue-500 py-0.5 px-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 transition-all cursor-pointer hover:scale-105"
                                        >
                                          <Phone className="h-2.5 w-2.5" /> SMS
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

            {/* VIEW B: CLIENT DIRECTORY */}
            {activeTab === 'clients' && (
              <motion.div
                key="clients-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Search / Filters block */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clients, phone, notes..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    {clientSearchQuery && (
                      <button
                        onClick={() => setClientSearchQuery('')}
                        className="absolute right-3 top-2.5 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        title="Clear search"
                      >
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {(['All', 'Active', 'Inactive'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setClientStatusFilter(status)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          clientStatusFilter === status
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {status} Clients
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directory list */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredClients.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-250/30">
                      <p className="text-xs font-bold text-slate-400">No client records found</p>
                      <button 
                        onClick={() => setIsQuickAddOpen(true)}
                        className="mt-3 inline-flex items-center gap-1 text-xs bg-indigo-600 text-white font-bold py-1.5 px-3 rounded-lg"
                      >
                        <Plus className="h-3 w-3" /> Log New Client
                      </button>
                    </div>
                  ) : (
                    filteredClients.map((client) => {
                      const outstandingInvoices = invoices.filter(i => i.clientId === client.id && i.status !== 'Paid');
                      const sumOwed = outstandingInvoices.reduce((sum, item) => sum + item.amount, 0);

                      return (
                        <div
                          key={client.id}
                          onClick={() => setSelectedClientId(client.id)}
                          className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 cursor-pointer flex justify-between items-center transition-all shadow-3xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                                {client.name}
                              </h4>
                              <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{client.phone} • {client.email || 'No email'}</p>
                            {client.notes && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate mt-1">
                                "{client.notes}"
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {sumOwed > 0 ? (
                              <div>
                                <span className="text-[11px] text-red-500 dark:text-red-400 font-bold block">${sumOwed} due</span>
                                <span className="text-[8px] font-mono text-slate-400">outstanding</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                Clear
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW C: DEALS / INVOICES STATUS LIST */}
            {activeTab === 'invoices' && (
              <motion.div
                key="invoices-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Filtration bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((filterStatus) => (
                    <button
                      key={filterStatus}
                      onClick={() => setInvoiceFilter(filterStatus)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                        invoiceFilter === filterStatus
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900'
                          : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {filterStatus === 'All' ? 'All Invoices' : `${filterStatus} (${invoices.filter(i => (filterStatus as string) === 'All' || (i.status as string) === (filterStatus as string)).length})`}
                    </button>
                  ))}
                </div>

                {/* Balance records list */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredInvoices.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl text-slate-400">
                      No invoices found
                    </div>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 flex justify-between items-center shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-950 dark:text-white">
                              {inv.clientName}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                              inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{inv.description}</p>
                          <p className="text-[9px] font-mono text-slate-400">Due {formatDate(inv.dueDate)}</p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">${inv.amount}</span>
                          
                          {/* Payment State Quick Toggles */}
                          <div className="flex flex-col gap-1">
                            {inv.status !== 'Paid' ? (
                              <button
                                id={`mark-paid-btn-${inv.id}`}
                                onClick={() => handleMarkPaymentStatus(inv.id, 'Paid')}
                                className="p-1 px-2 text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white rounded-md hover:scale-105 active:scale-95 transition-all"
                                title="Mark as paid"
                              >
                                Got Paid
                              </button>
                            ) : (
                              <button
                                id={`mark-pending-btn-${inv.id}`}
                                onClick={() => handleMarkPaymentStatus(inv.id, 'Pending')}
                                className="p-1 px-2 text-[9px] text-slate-400 hover:text-slate-600 rounded-md border border-slate-200 dark:border-slate-800"
                                title="Mark pending"
                              >
                                Re-open
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW D: SETTINGS & CUSTOM TEMPLATES */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Solopreneur info settings */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-150/40 pb-2">
                    <Building className="h-4.5 w-4.5 text-indigo-500" /> Business Profile
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Trading Business Name</label>
                    <input
                      type="text"
                      value={solopreneur.businessName}
                      onChange={(e) => setSolopreneur(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                {/* Message Custom templates customizable blocks */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-150/40 pb-2">
                    <MessageSquare className="h-4.5 w-4.5 text-emerald-500" /> Messaging Templates
                  </h3>

                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400 space-y-1">
                    <p className="font-bold">Placeholder Variables Guide:</p>
                    <ul className="list-disc pl-3.5 space-y-0.5">
                      <li><code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">{"{{client_name}}"}</code> - Replaced with client's full name</li>
                      <li><code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">{"{{amount}}"}</code> - Replaced with total outstanding deal amount</li>
                      <li><code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono">{"{{due_date}}"}</code> - Replaced with invoice due date</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">WhatsApp Default template</label>
                      <textarea
                        rows={3}
                        value={solopreneur.whatsappTemplate}
                        onChange={(e) => setSolopreneur(prev => ({ ...prev, whatsappTemplate: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">SMS Default template</label>
                      <textarea
                        rows={3}
                        value={solopreneur.smsTemplate}
                        onChange={(e) => setSolopreneur(prev => ({ ...prev, smsTemplate: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>



                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 leading-normal">Need to wipe local data and restart testing templates?</p>
                  <button
                    onClick={handleResetStorage}
                    className="shrink-0 text-[10px] bg-red-100 text-red-700 hover:bg-red-200 font-extrabold py-1 px-3 rounded-lg"
                  >
                    Reset Storage
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* PERSISTENT FLOATING QUICK '+' ACTION BUTTON (Opens Unified Quick Add Form Modal) */}
        <button
          id="quick-add-floating-btn"
          onClick={() => setIsQuickAddOpen(true)}
          className="absolute bottom-18 right-5 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 duration-100 group transition-all cursor-pointer z-20 hover:ring-3 hover:ring-indigo-400/40"
          title="Quick add client, deal and tasks"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Tab Navigation Menu Footer */}
        <nav id="app-footer-nav" className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-4 select-none z-10">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-tight transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Clock className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-tight transition-all duration-200 ${
              activeTab === 'clients'
                ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Clients</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-tight transition-all duration-200 ${
              activeTab === 'invoices'
                ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <DollarSign className="h-4.5 w-4.5" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-tight transition-all duration-200 ${
              activeTab === 'settings'
                ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* ======================================================== */}
        {/* MODAL 1: UNIFIED QUICK ADD FLOW overlay */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <motion.div
              id="quick-add-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-40 flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25 }}
                className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 max-h-[85%] overflow-y-auto px-5 pt-4 pb-8 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">Log client & business instantly</span>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      ⚡ Quick Add CRM Lead
                    </h2>
                  </div>
                  <button
                    id="close-quickadd-btn"
                    onClick={() => { setIsQuickAddOpen(false); setFormErrors({}); }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    title="Close"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleQuickAdd} className="space-y-4">
                  {/* Basic Client info */}
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client Context</p>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newClientName}
                        onChange={(e) => { setNewClientName(e.target.value); if(formErrors.name) setFormErrors(prev => ({...prev, name: undefined})) }}
                        className={`w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 text-slate-900 dark:text-white ${
                          formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-250 dark:border-slate-800 focus:ring-indigo-500'
                        }`}
                        required
                      />
                      {formErrors.name && <p className="text-[9px] text-red-500">{formErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Phone *</label>
                        <input
                          type="tel"
                          placeholder="+1555123456"
                          value={newClientPhone}
                          onChange={(e) => { setNewClientPhone(e.target.value); if(formErrors.phone) setFormErrors(prev => ({...prev, phone: undefined})) }}
                          className={`w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 text-slate-900 dark:text-white ${
                            formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-250 dark:border-slate-800 focus:ring-indigo-500'
                          }`}
                          required
                        />
                        {formErrors.phone && <p className="text-[9px] text-red-500">{formErrors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="j.doe@work.com"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial outstanding logs */}
                  <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deals & Invoice Owed (Optional)</p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 col-span-1">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Amount ($)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={newInvoiceAmount}
                          onChange={(e) => { setNewInvoiceAmount(e.target.value); if(formErrors.amount) setFormErrors(prev => ({...prev, amount: undefined})) }}
                          className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Invoice Description</label>
                        <input
                          type="text"
                          placeholder="Fitted pipes, algebra class fees..."
                          value={newInvoiceDesc}
                          onChange={(e) => setNewInvoiceDesc(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    {formErrors.amount && <p className="text-[9px] text-red-500">{formErrors.amount}</p>}
                  </div>

                  {/* Immediate followup scheduler */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Follow-up Scheduler (Optional)</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Follow-up Date</label>
                        <input
                          type="date"
                          value={newFollowUpDate}
                          onChange={(e) => setNewFollowUpDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block">Reminder Note</label>
                        <input
                          type="text"
                          placeholder="Call back for feedback"
                          value={newFollowUpDesc}
                          onChange={(e) => setNewFollowUpDesc(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="save-quick-add-btn"
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-3 block"
                  >
                    Save & Initialize Log Record
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* MODAL 2: CLIENT DETAILS & COMMUNICATIONS SHEET (SLIDEOVER) */}
        {/* ======================================================== */}
        <AnimatePresence>
          {selectedClientDetails && (
            <motion.div
              id="client-detail-sheet"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-slate-50 dark:bg-slate-950 z-35 flex flex-col"
            >
              {/* Profile Sheet Top Actions Header */}
              <div className="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800 flex justify-between items-center bg-slate-50/10">
                <button
                  id="close-client-sheet-btn"
                  onClick={() => { 
                    setSelectedClientId(null); 
                    setShowAddInvoiceInline(false); 
                    setShowAddFollowupInline(false); 
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" /> CRM Dashboard
                </button>
                
                <button
                  id="delete-client-btn"
                  onClick={() => handleDeleteClient(selectedClientDetails.client.id)}
                  className="p-1 px-2 hover:bg-red-50 rounded-lg text-red-500 max-sm:text-xs text-[11px] font-semibold"
                  title="Remove client profile"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* 1. Client Card details */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {selectedClientDetails.client.name}
                      </h2>
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 mt-1 block">
                        Client ID: {selectedClientDetails.client.id}
                      </span>
                    </div>
                    
                    {/* Status badge toggler */}
                    <button
                      onClick={() => {
                        const targetStatus = selectedClientDetails.client.status === 'Active' ? 'Inactive' : 'Active';
                        setClients(prev => prev.map(c => c.id === selectedClientDetails.client.id ? { ...c, status: targetStatus } : c));
                      }}
                      className={`text-[9px] font-bold py-0.5 px-2 rounded-full border transition-all ${
                        selectedClientDetails.client.status === 'Active' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                      title="Click to toggle status"
                    >
                      {selectedClientDetails.client.status} Status
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <p className="text-slate-600 dark:text-slate-400 font-mono">
                      📞 <strong className="text-slate-900 dark:text-slate-200 ml-1">{selectedClientDetails.client.phone}</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      ✉️ <span className="text-slate-900 dark:text-slate-200 ml-1">{selectedClientDetails.client.email || 'No email registered'}</span>
                    </p>
                  </div>

                  {/* Inline editable Notes block */}
                  <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150/40">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Personal Profile Notes</label>
                    <textarea
                      rows={2}
                      value={selectedClientDetails.client.notes}
                      onChange={(e) => {
                        const text = e.target.value;
                        setClients(prev => prev.map(c => c.id === selectedClientDetails.client.id ? { ...c, notes: text } : c));
                      }}
                      className="w-full bg-transparent border-none text-[11px] p-0 focus:ring-0 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none resize-none"
                      placeholder="Add custom Client details here (tutor subjects, handyman hours...)"
                    />
                  </div>
                </div>

                {/* 2. Direct Messaging Action block with Placeholder substitution */}
                <div className="bg-slate-900 text-white p-4.5 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-white/5 rounded-full pointer-events-none"></div>
                  
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-300 block tracking-wider">Instant Smart Follow-up</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">Quick Messaging Deep Links</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Launches communication apps passing dynamic templates with name, outstanding bills, and date details pre-filled.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      id="whatsapp-remind-btn"
                      onClick={() => {
                        const urgentInv = selectedClientDetails.invoices.find(i => i.status !== 'Paid');
                        triggerWhatsApp(selectedClientDetails.client, urgentInv);
                      }}
                      className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[11px] font-bold tracking-tight text-white hover:scale-102 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" /> Remind WhatsApp
                    </button>
                    
                    <button
                      id="sms-followup-btn"
                      onClick={() => {
                        const urgentInv = selectedClientDetails.invoices.find(i => i.status !== 'Paid');
                        triggerSMS(selectedClientDetails.client, urgentInv);
                      }}
                      className="flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[11px] font-bold tracking-tight text-white hover:scale-102 transition-all active:scale-95 cursor-pointer"
                    >
                      <Phone className="h-4 w-4" /> Follow Up SMS
                    </button>
                  </div>

                  {/* Summary of what will be sent */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono leading-normal text-slate-400 space-y-1">
                    <p className="font-semibold text-[8px] uppercase text-slate-500">Preview message text string:</p>
                    <p className="italic">
                      "{
                        solopreneur.whatsappTemplate
                          .replace(/\{\{client_name\}\}/g, selectedClientDetails.client.name)
                          .replace(/\{\{amount\}\}/g, (selectedClientDetails.invoices.find(i => i.status !== 'Paid')?.amount || 0).toString())
                          .replace(/\{\{due_date\}\}/g, formatDate(selectedClientDetails.invoices.find(i => i.status !== 'Paid')?.dueDate || TODAY_STR))
                      }"
                    </p>
                  </div>
                </div>

                {/* 3. Invoices Outstanding & History list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      💵 Financial Registry
                    </h3>
                    <button
                      onClick={() => setShowAddInvoiceInline(!showAddInvoiceInline)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full"
                    >
                      {showAddInvoiceInline ? "Cancel" : "+ Log Deal/Invoice"}
                    </button>
                  </div>

                  {/* Inline Invoice Add Form */}
                  <AnimatePresence>
                    {showAddInvoiceInline && (
                      <motion.form
                        onSubmit={handleAddInvoiceInline}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-white dark:bg-slate-900 border border-indigo-150/40 rounded-xl space-y-2.5"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-slate-500 block">Amount ($) *</label>
                            <input
                              type="number"
                              required
                              value={inlineInvoiceAmount}
                              onChange={(e) => setInlineInvoiceAmount(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded border border-slate-200"
                              placeholder="150"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-slate-500 block">Due Date</label>
                            <input
                              type="date"
                              required
                              value={inlineInvoiceDueDate}
                              onChange={(e) => setInlineInvoiceDueDate(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded border border-slate-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-slate-500 block">Description *</label>
                          <input
                            type="text"
                            required
                            value={inlineInvoiceDesc}
                            onChange={(e) => setInlineInvoiceDesc(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded border border-slate-200"
                            placeholder="Handyman repairs / Algebra session"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 text-white font-bold text-[10px] rounded uppercase tracking-wider"
                        >
                          Confirm & Add Balance
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Invoice list inside slide over */}
                  <div className="space-y-1.5">
                    {selectedClientDetails.invoices.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">No invoices log history</p>
                    ) : (
                      selectedClientDetails.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150/45 dark:border-slate-800/85 flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.description}</p>
                            <p className="text-[9px] text-slate-400 font-mono">Due {formatDate(inv.dueDate)}</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">${inv.amount}</p>
                              <span className={`text-[8px] font-bold uppercase ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {inv.status}
                              </span>
                            </div>
                            
                            {/* status changer toggler */}
                            <button
                              id={`toggle-details-paid-${inv.id}`}
                              onClick={() => {
                                const nextStat: InvoiceStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
                                handleMarkPaymentStatus(inv.id, nextStat);
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                              title="Toggle status"
                            >
                              <Check className={`h-3 w-3 ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-slate-300'}`} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Complete detailed Follow-up tasks */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      📅 Schedule & Follow-ups
                    </h3>
                    <button
                      onClick={() => setShowAddFollowupInline(!showAddFollowupInline)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full"
                    >
                      {showAddFollowupInline ? "Cancel" : "+ Schedule Call"}
                    </button>
                  </div>

                  {/* Inline Followup scheduler */}
                  <AnimatePresence>
                    {showAddFollowupInline && (
                      <motion.form
                        onSubmit={handleAddFollowupInline}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-white dark:bg-slate-900 border border-emerald-150/40 rounded-xl space-y-2.5"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-slate-500 block">Follow-up Target Date</label>
                          <input
                            type="date"
                            required
                            value={inlineFollowupDate}
                            onChange={(e) => setInlineFollowupDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded border border-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-slate-500 block">Task Description *</label>
                          <input
                            type="text"
                            required
                            value={inlineFollowupDesc}
                            onChange={(e) => setInlineFollowupDesc(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded border border-slate-200"
                            placeholder="Check faucet leaks/Send quotes"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 text-white font-bold text-[10px] rounded uppercase tracking-wider"
                        >
                          Confirm Schedule Task
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Followup checklists */}
                  <div className="space-y-1.5">
                    {selectedClientDetails.followups.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">No follow-ups logged</p>
                    ) : (
                      selectedClientDetails.followups.map((f) => (
                        <div
                          key={f.id}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150/45 dark:border-slate-800/85 flex items-start gap-2.5 text-xs"
                        >
                          <button
                            id={`details-toggle-f-${f.id}`}
                            onClick={() => handleToggleFollowupCompleted(f.id)}
                            className="mt-0.5 shrink-0 w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {f.completed ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : null}
                          </button>

                          <div className="flex-1">
                            <p className={`font-medium ${f.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {f.description}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{formatDate(f.date)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )}
  </div>
</div>
  );
}
