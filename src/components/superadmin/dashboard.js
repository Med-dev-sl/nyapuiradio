import React, { useEffect, useState, useCallback } from 'react';
import Sidebar, { navItems } from './sidebar';
import Modal from '../common/Modal';
import Loading from './loading';
import API_URL from '../../config';

// Program constants
const categories = [
  'News & Current Affairs',
  'Music & Entertainment',
  'Talk Shows',
  'Sports',
  'Education',
  'Health & Wellness',
  'Religion & Spirituality',
  'Community',
  'Politics',
  'Business & Finance',
  'Technology',
  'Culture & Arts',
  'Youth Programs',
  'Women\'s Programs',
  'Children\'s Programs',
  'Documentary',
  'Live Events',
  'Interviews',
  'Other'
];

const programDays = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const sidebarSections = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'broadcasts', label: 'Broadcasts' },
  { key: 'programs', label: 'Programs' },
  { key: 'news', label: 'News' },
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'program_videos', label: 'Program Videos' },
  { key: 'services', label: 'Services' },
  { key: 'assets', label: 'Assets' },
  { key: 'media', label: 'Media Library' },
  { key: 'audit', label: 'Audit Logs' },
  { key: 'staff', label: 'Staff Directory' },
  { key: 'donors', label: 'Donors' },
  { key: 'partners', label: 'Partners' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'social', label: 'Social Nexus' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'users', label: 'User Management' },
];

const Dashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [, setStations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetStats, setAssetStats] = useState({ total: 0, operational: 0, maintenance: 0, faulty: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('authToken'));
  
  const [modal, setModal] = useState({ 
    open: false, 
    type: 'info', 
    title: '', 
    message: '',
    onClose: () => {}
  });

  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Electronics',
    status: 'Operational',
    purchase_date: new Date().toISOString().split('T')[0],
    value: '',
    location: '',
    notes: '',
    image: ''
  });
  const [assetSearch, setAssetSearch] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] = useState('All');
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState(null);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    user_email: user?.user_email || '',
    bio: user?.bio || '',
    profile_picture: user?.profile_picture || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Media Library States
  const [folders, setFolders] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewerFile, setViewerFile] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [mediaStats, setMediaStats] = useState({ image: {count:0}, video: {count:0}, audio: {count:0}, document: {count:0} });
  const [mediaUploadDate, setMediaUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [donorSearch, setDonorSearch] = useState('');
  const [donorSortBy, setDonorSortBy] = useState('date'); // 'date' or 'amount'
  const [donorFilter, setDonorFilter] = useState('All'); // 'All', 'Recent', 'Large'
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', category: 'Daily', priority: 'Medium', status: 'Pending', due_date: new Date().toISOString().split('T')[0] });
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('All'); // All, Daily, Weekly
  const [taskSortBy, setTaskSortBy] = useState('due_date'); // due_date, priority
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [taskUserFilter, setTaskUserFilter] = useState('All');
  const [partners, setPartners] = useState([]);
  const [partnerForm, setPartnerForm] = useState({ name: '', logo: '', type: 'NGO', contact_person: '', email: '', phone: '', status: 'Active', agreement_date: new Date().toISOString().split('T')[0], notes: '' });
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('All'); // All, NGO, Corporate, Government, Media
  const [partnerSortBy, setPartnerSortBy] = useState('name'); // name, date
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState(null);
  const [analyticsSummary, setAnalyticsSummary] = useState({ donors: {}, partners: {}, assets: {}, tasks: {}, media: {} });
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialForm, setSocialForm] = useState({ content: '', image: '', platforms: ['Facebook', 'Instagram'] });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User Management States
  const [userForm, setUserForm] = useState({ 
    username: '', 
    password: '', 
    role: 'staff', 
    permissions: {}, 
    full_name: '', 
    user_email: '', 
    bio: '', 
    profile_picture: '' 
  });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentUserManagementId, setCurrentUserManagementId] = useState(null);
  const [userSearch, setUserSearch] = useState('');

  // Staff States
  const [staffList, setStaffList] = useState([]);
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    role: '',
    email: '',
    phone: '',
    image: '',
    bio: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    status: 'Active',
    joined_date: new Date().toISOString().split('T')[0]
  });
  const [staffSearch, setStaffSearch] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState('All');
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);

  // Programs States
  const [programs, setPrograms] = useState([]);
  const [programForm, setProgramForm] = useState({
    title: '',
    category: 'News & Current Affairs',
    description: '',
    host: '',
    days: [],
    start_time: '06:00',
    end_time: '07:00',
    status: 'Active',
    image: '',
    notes: ''
  });
  const [programSearch, setProgramSearch] = useState('');
  const [programCategoryFilter, setProgramCategoryFilter] = useState('All');
  const [programStatusFilter, setProgramStatusFilter] = useState('All');
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState(null);
  const [programView, setProgramView] = useState('grid'); // 'grid' | 'schedule'

  // Services States
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    image: '',
    terms_conditions: '',
    status: 'Active'
  });
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('All');
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // News States
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Local',
    headline: '',
    details: '',
    caption: '',
    photo: '',
    thumbnail: '',
    status: 'Draft'
  });
  const [newsSearch, setNewsSearch] = useState('');
  const [newsStatusFilter, setNewsStatusFilter] = useState('All');
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);

  // Podcasts States
  const [podcasts, setPodcasts] = useState([]);
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    video_url: '',
    status: 'Draft'
  });
  const [podcastSearch, setPodcastSearch] = useState('');
  const [podcastStatusFilter, setPodcastStatusFilter] = useState('All');
  const [isEditingPodcast, setIsEditingPodcast] = useState(false);
  const [currentPodcastId, setCurrentPodcastId] = useState(null);

  // Program Videos States
  const [programVideos, setProgramVideos] = useState([]);
  const [programVideoForm, setProgramVideoForm] = useState({
    program_id: '',
    title: '',
    description: '',
    thumbnail: '',
    video_url: '',
    status: 'Draft'
  });
  const [programVideoSearch, setProgramVideoSearch] = useState('');
  const [programVideoStatusFilter, setProgramVideoStatusFilter] = useState('All');
  const [isEditingProgramVideo, setIsEditingProgramVideo] = useState(false);
  const [currentProgramVideoId, setCurrentProgramVideoId] = useState(null);

  const canPerform = useCallback((section, action) => {
    if (user?.role === 'superuser') return true;
    const permissions = user?.permissions || {};
    return !!permissions[section]?.[action];
  }, [user]);

  const showError = (msg) => {
    setModal({
      open: true,
      type: 'error',
      title: 'Action Error',
      message: msg,
      onClose: () => setModal(prev => ({ ...prev, open: false }))
    });
  };

  const showSuccess = (msg, title = 'Success') => {
    setModal({
      open: true,
      type: 'success',
      title: title,
      message: msg,
      onClose: () => setModal(prev => ({ ...prev, open: false }))
    });
  };

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/spots`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        onLogout?.();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch stations (HTTP ${response.status})`);
      }

      const data = await response.json();
      setStations(data);
    } catch (err) {
      showError(err.message || 'Failed to load stations data.');
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/donors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        onLogout?.();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch donors (HTTP ${response.status})`);
      }

      const data = await response.json();
      setDonors(data);
    } catch (err) {
      showError(err.message || 'Failed to load donors data.');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      showError(err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAssetStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/assets/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssetStats(data);
      }
    } catch (err) { console.error(err); }
  }, [token]);


  const fetchSocialHistory = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/social/posts`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setSocialPosts(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchAnalyticsSummary = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setAnalyticsSummary(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchPartners = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/partners`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setPartners(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setSystemUsers(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchTasks = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setTasks(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/audit-logs`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setAuditLogs(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchFolders = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/media/folders`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setFolders(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchMediaStats = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/media/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setMediaStats(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchMediaFiles = useCallback(async () => {
    try {
      const url = `${API_URL}/api/media/files${currentFolderId ? `?folderId=${currentFolderId}` : ''}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setMediaFiles(await resp.json());
    } catch (err) { console.error(err); }
  }, [token, currentFolderId]);

  const fetchPrograms = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/programs`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setPrograms(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchServices = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/services`);
      if (resp.ok) setServices(await resp.json());
    } catch (err) { console.error(err); }
  }, []);

  const fetchServiceBookings = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/service-bookings`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setServiceBookings(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchStaff = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setStaffList(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchNews = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/news`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setNewsList(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchPodcasts = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/podcasts`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setPodcasts(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchProgramVideos = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/program-videos`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setProgramVideos(await resp.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.full_name.trim() || !staffForm.role.trim() || !staffForm.email.trim()) {
      showError('Full name, role, and email are required for staff.');
      return;
    }
    setSubmitting(true);

    try {
      const method = isEditingStaff ? 'PUT' : 'POST';
      const url = isEditingStaff ? `${API_URL}/api/staff/${currentStaffId}` : `${API_URL}/api/staff`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(staffForm)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save staff information');
      }

      setStaffForm({ full_name: '', role: '', email: '', phone: '', image: '', bio: '', status: 'Active', joined_date: new Date().toISOString().split('T')[0] });
      setIsEditingStaff(false);
      setCurrentStaffId(null);
      showSuccess('Staff profile saved successfully.', 'Staff Saved');
      fetchStaff();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStaffDelete = async (id) => {
    if (!window.confirm('Delete this staff profile? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/staff/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        showSuccess('Staff profile removed.', 'Staff Deleted');
        fetchStaff();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete staff');
      }
    } catch (err) {
      showError('Network error while deleting staff');
    }
  };

  const handleStaffImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Image exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setStaffForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.category.trim() || !newsForm.headline.trim()) {
      showError('Title, category, and headline are required for news.');
      return;
    }
    setSubmitting(true);
    try {
      const method = isEditingNews ? 'PUT' : 'POST';
      const url = isEditingNews ? `${API_URL}/api/news/${currentNewsId}` : `${API_URL}/api/news`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newsForm)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save news item');
      }

      setNewsForm({ title: '', category: 'Local', headline: '', details: '', caption: '', photo: '', thumbnail: '', status: 'Draft' });
      setIsEditingNews(false);
      setCurrentNewsId(null);
      showSuccess('News item saved successfully.', 'News Saved');
      fetchNews();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsDelete = async (id) => {
    if (!window.confirm('Delete this news item? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        showSuccess('News item removed.', 'News Deleted');
        fetchNews();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete news item');
      }
    } catch (err) {
      showError('Network error while deleting news item');
    }
  };

  const handleNewsImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Image exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewsForm(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePodcastSubmit = async (e) => {
    e.preventDefault();
    if (!podcastForm.title.trim()) {
      showError('Podcast title is required');
      return;
    }

    setSubmitting(true);
    try {
      const method = isEditingPodcast ? 'PUT' : 'POST';
      const url = isEditingPodcast ? `${API_URL}/api/podcasts/${currentPodcastId}` : `${API_URL}/api/podcasts`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(podcastForm)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save podcast');
      }

      setPodcastForm({ title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' });
      setIsEditingPodcast(false);
      setCurrentPodcastId(null);
      showSuccess('Podcast saved successfully', 'Podcast');
      fetchPodcasts();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePodcastDelete = async (id) => {
    if (!window.confirm('Delete this podcast episode? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/podcasts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        showSuccess('Podcast deleted', 'Podcast');
        fetchPodcasts();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete podcast');
      }
    } catch (err) {
      showError('Network error while deleting podcast');
    }
  };

  const handlePodcastThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Thumbnail exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPodcastForm(prev => ({ ...prev, thumbnail: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleProgramVideoSubmit = async (e) => {
    e.preventDefault();
    if (!programVideoForm.program_id || !programVideoForm.title.trim()) {
      showError('Program and video title are required');
      return;
    }

    setSubmitting(true);
    try {
      const method = isEditingProgramVideo ? 'PUT' : 'POST';
      const url = isEditingProgramVideo ? `${API_URL}/api/program-videos/${currentProgramVideoId}` : `${API_URL}/api/program-videos`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(programVideoForm)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save program video');
      }

      setProgramVideoForm({ program_id: '', title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' });
      setIsEditingProgramVideo(false);
      setCurrentProgramVideoId(null);
      showSuccess('Program video saved successfully', 'Program Video');
      fetchProgramVideos();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgramVideoDelete = async (id) => {
    if (!window.confirm('Delete this program video? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/program-videos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        showSuccess('Program video deleted', 'Program Video');
        fetchProgramVideos();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete program video');
      }
    } catch (err) {
      showError('Network error while deleting program video');
    }
  };

  const handleProgramVideoThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Thumbnail exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProgramVideoForm(prev => ({ ...prev, thumbnail: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.username.trim() || (!isEditingUser && !userForm.password.trim())) {
      showError('Username and password are required.');
      return;
    }

    if (userForm.username.length < 3) {
      showError('Username must be at least 3 characters long.');
      return;
    }

    if (!isEditingUser && userForm.password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (isEditingUser && userForm.password && userForm.password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const method = isEditingUser ? 'PUT' : 'POST';
      const url = isEditingUser ? `${API_URL}/api/users/${currentUserManagementId}` : `${API_URL}/api/users`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(userForm)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save user');
      }

      setUserForm({ username: '', password: '', role: 'staff', permissions: {}, full_name: '', user_email: '', bio: '', profile_picture: '' });
      setIsEditingUser(false);
      setCurrentUserManagementId(null);
      showSuccess(isEditingUser ? 'User account updated successfully.' : 'New user account created successfully.', 'User Management');
      fetchUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      const resp = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        showSuccess('User removed from system.', 'User Deleted');
        fetchUsers();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      showError('Network error while deleting user');
    }
  };

  const handleUserImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Profile picture exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setUserForm(prev => ({ ...prev, profile_picture: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const toggleUserPermission = (section, action) => {
    setUserForm(prev => {
      const newPerms = { ...prev.permissions };
      if (!newPerms[section]) newPerms[section] = { read: false, create: false, update: false, delete: false };
      newPerms[section][action] = !newPerms[section][action];
      return { ...prev, permissions: newPerms };
    });
  };

  useEffect(() => {
    fetchStations();
    fetchDonors();
    fetchAssets();
    fetchAssetStats();
    fetchFolders();
    fetchMediaFiles();
  }, [fetchStations, fetchDonors, fetchAssets, fetchAssetStats, fetchFolders, fetchMediaFiles]);

  useEffect(() => {
    if (activeSection === 'media') {
      fetchFolders();
      fetchMediaFiles();
      fetchMediaStats();
    }
    if (activeSection === 'audit') {
      fetchAuditLogs();
    }
    if (activeSection === 'tasks') {
      fetchTasks();
      fetchUsers();
    }
    if (activeSection === 'partners') {
      fetchPartners();
    }
    if (activeSection === 'analytics') {
      fetchAnalyticsSummary();
    }
    if (activeSection === 'social') {
      fetchSocialHistory();
    }
    if (activeSection === 'programs' || activeSection === 'program_videos') {
      fetchPrograms();
    }
    if (activeSection === 'services') {
      fetchServices();
      fetchServiceBookings();
    }
    if (activeSection === 'news') {
      fetchNews();
    }
    if (activeSection === 'podcasts') {
      fetchPodcasts();
    }
    if (activeSection === 'program_videos') {
      fetchProgramVideos();
    }
    if (activeSection === 'staff') {
      fetchStaff();
    }
    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection, currentFolderId, fetchFolders, fetchMediaFiles, fetchMediaStats, fetchAuditLogs, fetchTasks, fetchUsers, fetchPartners, fetchAnalyticsSummary, fetchSocialHistory, fetchPrograms, fetchServices, fetchServiceBookings, fetchStaff, fetchNews, fetchPodcasts, fetchProgramVideos]);


  useEffect(() => {
    if (isEditing) {
      setProfileForm({
        full_name: user?.full_name || '',
        user_email: user?.user_email || '',
        bio: user?.bio || '',
        profile_picture: user?.profile_picture || ''
      });
    }
  }, [isEditing, user]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const theme = stored ? stored === 'dark' : true;
    setIsDark(theme);
    document.documentElement.classList.toggle('dark', theme);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.category) {
      showError('Please provide a task title and category.');
      return;
    }
    setSubmitting(true);
    try {
      const url = isEditingTask ? `${API_URL}/api/tasks/${currentTaskId}` : `${API_URL}/api/tasks`;
      const method = isEditingTask ? 'PUT' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(taskForm)
      });
      if (!resp.ok) throw new Error(`Failed to ${isEditingTask ? 'update' : 'save'} task`);
      setTaskForm({ title: '', description: '', category: 'Daily', priority: 'Medium', status: 'Pending', due_date: new Date().toISOString().split('T')[0] });
      setIsEditingTask(false);
      setCurrentTaskId(null);
      showSuccess(`Task "${taskForm.title}" has been saved.`, isEditingTask ? 'Task Updated' : 'Task Created');
      fetchTasks();
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      const resp = await fetch(`${API_URL}/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      }
    } catch (err) { showError(err.message); }
  };

  const handleTaskDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const resp = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Task eliminated.', 'Deleted');
        fetchTasks();
      }
    } catch (err) { showError(err.message); }
  };

  const exportTasks = () => {
    const printWindow = window.open('', '_blank');
    const filteredTasks = tasks
      .filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()) || t.description?.toLowerCase().includes(taskSearch.toLowerCase()))
      .filter(t => taskFilter === 'All' || t.category === taskFilter)
      .filter(t => taskUserFilter === 'All' || t.creator_name === taskUserFilter)
      .sort((a, b) => {
        if (taskSortBy === 'due_date') return new Date(a.due_date) - new Date(b.due_date);
        return 0;
      });

    printWindow.document.write(`
      <html>
        <head>
          <title>Nyapui Radio - Task Registry</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; }
            .logo { width: 60px; height: 60px; background: #f97316; border-radius: 12px; }
            .title-group h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .title-group p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .status { font-weight: bold; text-transform: uppercase; font-size: 10px; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div class="title-group">
              <h1>NYAPUI RADIO 88.6FM</h1>
              <p>Official Task Coordination Registry</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <h2>Task Registry</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned By</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTasks.map(t => `
                <tr>
                  <td style="font-weight: bold;">${t.title}</td>
                  <td>${t.creator_name || 'System'}</td>
                  <td>${t.category}</td>
                  <td>${t.priority}</td>
                  <td class="status">${t.status}</td>
                  <td>${t.due_date || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nyapui Radio. Sierra Leone. Activity Coordination System.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    if (!partnerForm.name.trim()) {
      showError('Partner name is mandatory.');
      return;
    }
    setSubmitting(true);
    try {
      const url = isEditingPartner ? `${API_URL}/api/partners/${currentPartnerId}` : `${API_URL}/api/partners`;
      const method = isEditingPartner ? 'PUT' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(partnerForm)
      });
      if (!resp.ok) throw new Error('Failed to synchronize partner data');
      setPartnerForm({ name: '', logo: '', type: 'NGO', contact_person: '', email: '', phone: '', status: 'Active', agreement_date: new Date().toISOString().split('T')[0], notes: '' });
      setIsEditingPartner(false);
      setCurrentPartnerId(null);
      showSuccess(`Strategic partnership with ${partnerForm.name} has been ${isEditingPartner ? 'updated' : 'formalized'}.`, 'Success');
      fetchPartners();
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const handlePartnerDelete = async (id) => {
    if (!window.confirm('Dissolve this partnership record? This cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/partners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Partner record removed from registry.', 'Partner Deleted');
        fetchPartners();
      }
    } catch (err) { showError(err.message); }
  };

  const handlePartnerLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Logo exceeds size limit (512KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPartnerForm(prev => ({ ...prev, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const exportPartnersReport = () => {
    const printWindow = window.open('', '_blank');
    const filtered = partners
      .filter(p => (partnerFilter === 'All' || p.type === partnerFilter))
      .filter(p => p.name.toLowerCase().includes(partnerSearch.toLowerCase()))
      .sort((a, b) => {
        if (partnerSortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.agreement_date) - new Date(a.agreement_date);
      });

    printWindow.document.write(`
      <html>
        <head>
          <title>Nyapui Radio - Partnership Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; }
            .logo-placeholder { width: 60px; height: 60px; background: #f97316; border-radius: 12px; }
            .title-group h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .title-group p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 11px; }
            .badge { padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 9px; text-transform: uppercase; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder"></div>
            <div class="title-group">
              <h1>NYAPUI RADIO 88.6FM</h1>
              <p>Official Strategic Partnership Report</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <h2>Active Partners</h2>
          <table>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Agreement Date</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(p => `
                <tr>
                  <td style="font-weight: bold;">${p.name}</td>
                  <td>${p.type}</td>
                  <td>${p.contact_person || 'N/A'}<br/>${p.email || ''}</td>
                  <td><span class="badge ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">${p.status}</span></td>
                  <td>${p.agreement_date || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nyapui Radio. Sierra Leone. Organizational Development Unit.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportOverallStats = () => {
    const printWindow = window.open('', '_blank');
    const s = analyticsSummary;

    printWindow.document.write(`
      <html>
        <head>
          <title>Nyapui Radio - Performance Summary</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 5px solid #f97316; padding-bottom: 30px; margin-bottom: 40px; display: flex; align-items: center; gap: 30px; }
            .logo-placeholder { width: 80px; height: 80px; background: #f97316; border-radius: 16px; }
            .station-info h1 { margin: 0; color: #0f172a; font-size: 32px; letter-spacing: -0.02em; }
            .station-info p { margin: 5px 0 0; color: #64748b; font-size: 16px; font-weight: 500; }
            .report-meta { margin-bottom: 40px; padding: 20px; bg-slate-50; border-radius: 12px; font-size: 12px; color: #64748b; border: 1px solid #e2e8f0; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .stat-card { padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc; }
            .stat-card h3 { margin: 0 0 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
            .stat-value { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
            .stat-sub { font-size: 12px; color: #94a3b8; }
            .section-title { font-size: 18px; font-weight: 800; margin: 40px 0 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; color: #0f172a; }
            .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder"></div>
            <div class="station-info">
              <h1>NYAPUI RADIO 88.6FM</h1>
              <p>Institutional Performance & Analytics Report</p>
            </div>
          </div>
          
          <div class="report-meta">
            <strong>Reference:</strong> NYA-STAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}<br/>
            <strong>Generated By:</strong> ${user?.full_name || user?.username}<br/>
            <strong>Timestamp:</strong> ${new Date().toLocaleString()}
          </div>

          <div class="section-title">Global KPIs</div>
          <div class="grid">
            <div class="stat-card">
              <h3>Financial Footprint</h3>
              <div class="stat-value">SLe ${s.donors?.totalAmount?.toLocaleString() || 0}</div>
              <div class="stat-sub">Total Contributed via ${s.donors?.totalCount || 0} recorded donations</div>
            </div>
            <div class="stat-card">
              <h3>Asset Valuation</h3>
              <div class="stat-value">SLe ${s.assets?.totalValue?.toLocaleString() || 0}</div>
              <div class="stat-sub">${s.assets?.operationalCount || 0} / ${s.assets?.totalCount || 0} Items are operational</div>
            </div>
            <div class="stat-card">
              <h3>Institutional Partnerships</h3>
              <div class="stat-value">${s.partners?.total || 0} Partners</div>
              <div class="stat-sub">Spanning NGOs, Corporate and Gov agencies</div>
            </div>
            <div class="stat-card">
              <h3>Operational Efficiency</h3>
              <div class="stat-value">${s.tasks?.completionRate || 0}%</div>
              <div class="stat-sub">${s.tasks?.completed || 0} of ${s.tasks?.total || 0} strategic tasks finalized</div>
            </div>
          </div>

          <div class="section-title">Media Content Velocity</div>
          <div class="stat-card" style="margin-bottom: 40px;">
             <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3>Total Managed Media</h3>
                  <div class="stat-value">${s.media?.totalFiles || 0} Files</div>
                </div>
                <div style="text-align: right; color: #64748b; font-size: 12px;">
                  Managed via centralized digital archive
                </div>
             </div>
          </div>

          <div class="footer">
            <p>Confidential Institutional Document. &copy; ${new Date().getFullYear()} Nyapui Radio. Sierra Leone.</p>
            <p>Empowering Women and Youth through Strategic Communication.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleSocialPlatform = (p) => {
    setSocialForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(x => x !== p) 
        : [...prev.platforms, p]
    }));
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    if (!socialForm.content.trim()) return showError('Post content cannot be empty.');
    if (socialForm.platforms.length === 0) return showError('Select at least one platform.');

    setSubmitting(true);
    try {
      const resp = await fetch(`${API_URL}/api/social/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(socialForm)
      });
      if (resp.ok) {
        showSuccess(`Content synchronized across ${socialForm.platforms.join(', ')}.`, 'Broadcast Successful');
        setSocialForm({ content: '', image: '', platforms: ['Facebook', 'Instagram'] });
        fetchSocialHistory();
      } else {
        throw new Error('Global synchronization failed.');
      }
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const deleteDonor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this donor? This will permanently delete their contribution record.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/donors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Donor record has been deleted.', 'Donor Removed');
        await fetchDonors();
      }
    } catch (err) { showError(err.message); }
  };

  const addAsset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEditingAsset ? `${API_URL}/api/assets/${currentAssetId}` : `${API_URL}/api/assets`;
      const method = isEditingAsset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assetForm)
      });

      if (!response.ok) throw new Error(`Failed to ${isEditingAsset ? 'update' : 'record'} asset`);
      
      showSuccess(`Asset ${assetForm.name} has been successfully ${isEditingAsset ? 'updated' : 'registered'}.`, `Asset ${isEditingAsset ? 'Updated' : 'Registered'}`);
      setAssetForm({
        name: '',
        category: 'Electronics',
        status: 'Operational',
        purchase_date: new Date().toISOString().split('T')[0],
        value: '',
        location: '',
        notes: '',
        image: ''
      });
      setIsEditingAsset(false);
      setCurrentAssetId(null);
      await fetchAssets();
      await fetchAssetStats();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAsset = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/assets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete asset');
      showSuccess('Asset has been permanently removed.', 'Asset Deleted');
      await fetchAssets();
      await fetchAssetStats();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAssetImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showError('Image is too large. Please select a file under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssetForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportAssets = () => {
    const printWindow = window.open('', '_blank');
    const filteredAssets = assets
      .filter(a => (assetStatusFilter === 'All' || a.status === assetStatusFilter))
      .filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.asset_tag.toLowerCase().includes(assetSearch.toLowerCase()));

    printWindow.document.write(`
      <html>
        <head>
          <title>Nyapui Radio - Asset Registry</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; }
            .logo { width: 60px; height: 60px; background: #f97316; border-radius: 12px; }
            .title-group h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .title-group p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .tag { font-weight: bold; color: #f97316; }
            .status { font-weight: bold; font-size: 10px; text-transform: uppercase; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div class="title-group">
              <h1>NYAPUI RADIO 88.6FM</h1>
              <p>Official Assets & Equipment Registry Report</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <h2>Asset Heading</h2>
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Purchase Date</th>
                <th>Value (SLe)</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAssets.map(a => `
                <tr>
                  <td class="tag">${a.asset_tag}</td>
                  <td>${a.name}</td>
                  <td>${a.category}</td>
                  <td class="status">${a.status}</td>
                  <td>${a.purchase_date || 'N/A'}</td>
                  <td>SLe ${a.value?.toLocaleString() || '0'}</td>
                  <td>${a.location || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nyapui Radio. Sierra Leone. Standard Asset Management System.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportDonors = () => {
    const printWindow = window.open('', '_blank');
    const filteredDonors = donors
      .filter(d => d.name.toLowerCase().includes(donorSearch.toLowerCase()) || d.email?.toLowerCase().includes(donorSearch.toLowerCase()))
      .sort((a, b) => {
        if (donorSortBy === 'date') return new Date(b.date) - new Date(a.date);
        return b.amount - a.amount;
      });

    printWindow.document.write(`
      <html>
        <head>
          <title>Nyapui Radio - Donor Registry</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; }
            .logo { width: 60px; height: 60px; background: #f97316; border-radius: 12px; }
            .title-group h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .title-group p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .amount { font-weight: bold; color: #059669; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div class="title-group">
              <h1>NYAPUI RADIO 88.6FM</h1>
              <p>Official Donors & Contributions Report</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <h2>Donors</h2>
          <table>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Email</th>
                <th>Amount (SLe)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDonors.map(d => `
                <tr>
                  <td style="font-weight: bold;">${d.name}</td>
                  <td>${d.email || 'N/A'}</td>
                  <td class="amount">SLe ${d.amount?.toLocaleString()}</td>
                  <td>${new Date(d.date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nyapui Radio. Sierra Leone. Station Funding Registry.</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const createMediaFolder = async () => {
    if (!newFolderName.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_URL}/api/media/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newFolderName })
      });
      if (resp.ok) {
        showSuccess(`Folder "${newFolderName}" created.`, 'Success');
        setNewFolderName('');
        setIsCreatingFolder(false);
        fetchFolders();
      }
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const type = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' :
                     file.type.startsWith('audio/') ? 'audio' : 'document';
        
        const payload = {
          name: file.name,
          type,
          size: file.size,
          url: reader.result,
          folder_id: currentFolderId,
          upload_date: mediaUploadDate
        };

        const resp = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          showSuccess(`${file.name} uploaded successfully.`, 'Media Uploaded');
          fetchMediaFiles();
          fetchMediaStats();
        } else {
          showError('Failed to upload media. Check file size.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const deleteMediaFile = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const resp = await fetch(`${API_URL}/api/media/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('File removed.', 'Deleted');
        fetchMediaFiles();
      }
    } catch (err) { showError(err.message); }
  };

  const deleteMediaFolder = async (id) => {
    if (!window.confirm('Delete this folder and all its contents?')) return;
    try {
      const resp = await fetch(`${API_URL}/api/media/folders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Folder removed.', 'Deleted');
        if (currentFolderId === id) setCurrentFolderId(null);
        fetchFolders();
      }
    } catch (err) { showError(err.message); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (response.status === 401) {
        onLogout?.();
        return;
      }

      if (!response.ok) throw new Error('Failed to update profile');
      
      const data = await response.json();
      onUpdateProfile({ ...user, ...data.user });
      setIsEditing(false);
      showSuccess('Your personal profile has been updated successfully.', 'Profile Updated');
    } catch (err) {
      showError(err.message || 'An error occurred while updating your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showError('Image is too large. Please select a file under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Programs Handlers
  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    if (!programForm.title.trim() || !programForm.category || !programForm.days.length || !programForm.start_time || !programForm.end_time) {
      showError('Please provide a title, category, frequency (days), and schedule (start/end times).');
      return;
    }
    setSubmitting(true);
    try {
      const url = isEditingProgram ? `${API_URL}/api/programs/${currentProgramId}` : `${API_URL}/api/programs`;
      const method = isEditingProgram ? 'PUT' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(programForm)
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${isEditingProgram ? 'update' : 'save'} program`);
      }
      
      setProgramForm({
        title: '', category: 'News & Current Affairs', description: '', host: '', days: [],
        start_time: '06:00', end_time: '07:00', status: 'Active', image: '', notes: ''
      });
      setIsEditingProgram(false);
      setCurrentProgramId(null);
      showSuccess(`Program "${programForm.title}" has been successfully ${isEditingProgram ? 'updated' : 'registered'}.`, isEditingProgram ? 'Program Updated' : 'Program Created');
      fetchPrograms();
    } catch (err) { showError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleProgramDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this program from the schedule? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Program removed from the station schedule.', 'Program Deleted');
        fetchPrograms();
      }
    } catch (err) { showError(err.message); }
  };

  const toggleProgramDay = (day) => {
    setProgramForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleProgramImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Program image exceeds size limit (512KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProgramForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditingService ? 'PUT' : 'POST';
      const url = isEditingService ? `${API_URL}/api/services/${currentServiceId}` : `${API_URL}/api/services`;
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });
      if (resp.ok) {
        showSuccess(isEditingService ? 'Service updated successfully.' : 'Service created successfully.', 'Service Saved');
        setServiceForm({ name: '', description: '', image: '', terms_conditions: '', status: 'Active' });
        setIsEditingService(false);
        setCurrentServiceId(null);
        fetchServices();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        showError(errorData.error || 'Failed to save service');
      }
    } catch (err) {
      showError('Network error occurred');
    }
  };

  const handleServiceDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    try {
      const resp = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        showSuccess('Service deleted successfully.', 'Service Deleted');
        fetchServices();
      }
    } catch (err) { showError('Failed to delete service'); }
  };

  const handleServiceImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Service image exceeds size limit (512KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setServiceForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSocialImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) {
        showError('Image exceeds 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSocialForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleBookingStatusUpdate = async (id, status) => {
    try {
      const resp = await fetch(`${API_URL}/api/service-bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (resp.ok) {
        showSuccess('Booking status updated successfully.');
        fetchServiceBookings();
      }
    } catch (err) { showError('Failed to update booking status'); }
  };

  const liveListeners = 0; 
  const totalDonations = donors.reduce((sum, d) => sum + d.amount, 0); 

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      {(loading || submitting) && (
        <Loading message={loading ? "Synchronizing Station Data..." : "Finalizing New Station..."} />
      )}
      
      <Modal 
        {...modal}
        onClose={() => {
          modal.onClose();
          setModal(prev => ({ ...prev, open: false }));
        }}
      />

      {/* Fullscreen Media Viewer */}
      {viewerFile && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col p-8 animate-in fade-in duration-300"
          onClick={() => setViewerFile(null)}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary">
                    {viewerFile.type === 'image' ? 'image' : 
                     viewerFile.type === 'video' ? 'movie' : 
                     viewerFile.type === 'audio' ? 'music_note' : 'description'}
                 </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{viewerFile.name}</h3>
                <p className="text-slate-400 text-xs uppercase font-black tracking-widest">
                  {(viewerFile.size / (1024 * 1024)).toFixed(2)} MB • {viewerFile.type}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <a 
                href={viewerFile.url} 
                download={viewerFile.name}
                className="size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined">download</span>
              </a>
              <button 
                onClick={() => setViewerFile(null)}
                className="size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          
          <div 
            className="flex-1 rounded-3xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {viewerFile.type === 'image' ? (
              <img src={viewerFile.url} alt={viewerFile.name} className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500" />
            ) : viewerFile.type === 'video' ? (
              <video src={viewerFile.url} controls autoPlay className="max-w-full max-h-full" />
            ) : viewerFile.type === 'audio' ? (
              <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <div className="size-32 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-6xl text-emerald-500 animate-pulse">music_note</span>
                </div>
                <h4 className="text-white font-bold mb-8">{viewerFile.name}</h4>
                <audio src={viewerFile.url} controls autoPlay className="w-80" />
              </div>
            ) : (
              <div className="text-center text-white p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <span className={`material-symbols-outlined text-8xl mb-6 ${
                  viewerFile.name.toLowerCase().endsWith('.pdf') ? 'text-rose-400' :
                  viewerFile.name.toLowerCase().endsWith('.xls') || viewerFile.name.toLowerCase().endsWith('.xlsx') ? 'text-emerald-400' :
                  'text-indigo-400'
                }`}>
                  {
                    viewerFile.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' :
                    viewerFile.name.toLowerCase().endsWith('.xls') || viewerFile.name.toLowerCase().endsWith('.xlsx') ? 'table_view' :
                    'description'
                  }
                </span>
                <p className="text-xl font-bold mb-2">Document Preview Unavailable</p>
                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">This file type must be downloaded to be viewed on your local device.</p>
                <a 
                  href={viewerFile.url} 
                  download={viewerFile.name}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all inline-flex items-center gap-3"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          user={user} 
          active={activeSection} 
          onSelect={setActiveSection} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />


        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 md:h-16 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background-light dark:bg-background-dark z-10 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="relative w-full max-w-md group hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">search</span>
                <input
                  type="text"
                  className="w-full bg-primary/5 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                  placeholder="Search listeners..."
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl relative hidden xs:flex">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background-light dark:border-background-dark" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl"
                aria-label="Toggle dark/light mode"
              >
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <div className="bg-primary text-white px-3 md:px-4 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-2 tracking-widest uppercase shadow-lg shadow-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="hidden xs:inline">Live</span>
              </div>
              <div className="h-6 w-px bg-primary/10 mx-1 md:mx-2 hidden sm:block" />
              <div className="flex items-center gap-2 md:gap-3">
                <div className="size-8 rounded-full bg-primary/20 border border-primary/20 overflow-hidden flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-lg">person</span>
                  )}
                </div>
                <button
                  onClick={() => onLogout?.()}
                  className="px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
                <p className="text-slate-500 text-sm md:text-base">Welcome back, {user?.full_name || user?.username || 'manager'}. Here's your live station feed.</p>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button className="flex-1 md:flex-none px-4 py-2 text-xs md:text-sm border border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5">Reports</button>
                <button className="flex-1 md:flex-none px-4 py-2 text-xs md:text-sm bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">Go Live</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-bold flex items-center">+5% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
                </div>
                <p className="text-slate-500 text-sm font-medium">System Health</p>
                <h3 className="text-2xl font-bold mt-1">Optimal</h3>
              </div>
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-bold flex items-center">+5.4% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Estimated Reach</p>
                <h3 className="text-2xl font-bold mt-1">{liveListeners}</h3>
              </div>
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-bold flex items-center">+18% <span className="material-symbols-outlined text-xs">arrow_upward</span></span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Donations</p>
                <h3 className="text-2xl font-bold mt-1">${totalDonations}</h3>
              </div>
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-bold flex items-center">Value</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Assets Registry</p>
                <h3 className="text-2xl font-bold mt-1">SLe {assetStats.totalValue.toLocaleString()}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {activeSection === 'analytics' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black">Institutional Intelligence</h2>
                        <p className="text-sm text-slate-500">Cross-departmental performance metrics</p>
                      </div>
                      <button 
                        onClick={exportOverallStats}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        Export Stats
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-6xl">payments</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Inflow</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">SLe {analyticsSummary.donors?.totalAmount?.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          {analyticsSummary.donors?.totalCount} Contributions
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-6xl">inventory_2</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital Assets</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">SLe {analyticsSummary.assets?.totalValue?.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          {analyticsSummary.assets?.totalCount} Items Logged
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-6xl">handshake</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Allies</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{analyticsSummary.partners?.total}</h3>
                        <div className="mt-4 flex items-center gap-2 text-indigo-500 font-bold text-xs">
                          <span className="material-symbols-outlined text-sm">hub</span>
                          NGO & Corp Network
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-6xl">task_alt</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ops Velocity</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{analyticsSummary.tasks?.completionRate}%</h3>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
                          <span className="material-symbols-outlined text-sm">speed</span>
                          {analyticsSummary.tasks?.completed} Tasks Finalized
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm">
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined text-primary">pie_chart</span>
                           Partnership Diversity
                        </h4>
                        <div className="space-y-4">
                          {analyticsSummary.partners?.breakdown?.map((b, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500 uppercase tracking-tighter">{b.type}</span>
                                <span className="text-primary">{b.count} Partners</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                                  style={{ width: `${(b.count / analyticsSummary.partners.total * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-primary/10 shadow-sm">
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined text-emerald-500">database</span>
                           Content Distribution
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                             <span className="material-symbols-outlined text-emerald-500 text-sm">cloud_done</span>
                             <div className="text-2xl font-black mt-2">{analyticsSummary.media?.totalFiles}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Media Items</div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                             <span className="material-symbols-outlined text-indigo-500 text-sm">history_edu</span>
                             <div className="text-2xl font-black mt-2">{auditLogs.length}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Events (24h)</div>
                          </div>
                        </div>
                        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                           <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                             "The station's digital content footprint is expanding. Ensure regular media clean-up to maintain optimal system responsiveness."
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'dashboard' || activeSection === 'broadcasts' || activeSection === 'inventory' ? (
                <>
                  {/* Dashboard Overview Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Financial Footprint */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financial Footprint</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            SLe {analyticsSummary.donors?.totalAmount?.toLocaleString() || 0}
                          </h3>
                        </div>
                        <div className="size-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-600 text-xl">account_balance_wallet</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {analyticsSummary.donors?.totalCount || 0} recorded donations
                      </p>
                    </div>

                    {/* Asset Valuation */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Valuation</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            SLe {analyticsSummary.assets?.totalValue?.toLocaleString() || 0}
                          </h3>
                        </div>
                        <div className="size-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600 text-xl">inventory_2</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {analyticsSummary.assets?.operationalCount || 0} / {analyticsSummary.assets?.totalCount || 0} operational
                      </p>
                    </div>

                    {/* Institutional Partnerships */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Partnerships</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {analyticsSummary.partners?.total || 0}
                          </h3>
                        </div>
                        <div className="size-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-purple-600 text-xl">groups</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Active institutional partners
                      </p>
                    </div>

                    {/* Operational Efficiency */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Task Completion</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {analyticsSummary.tasks?.completionRate || 0}%
                          </h3>
                        </div>
                        <div className="size-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-600 text-xl">task_alt</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {analyticsSummary.tasks?.completed || 0} of {analyticsSummary.tasks?.total || 0} completed
                      </p>
                    </div>
                  </div>

                  {/* Additional Dashboard Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {/* Media Content */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Media Files</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {analyticsSummary.media?.totalFiles || 0}
                          </h3>
                        </div>
                        <div className="size-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-pink-600 text-xl">library_music</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Managed media content
                      </p>
                    </div>

                    {/* System Users */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Users</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {systemUsers.length}
                          </h3>
                        </div>
                        <div className="size-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-indigo-600 text-xl">people</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Active system accounts
                      </p>
                    </div>

                    {/* System Status */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Status</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Operational</h3>
                          </div>
                        </div>
                        <div className="size-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        All systems functioning normally
                      </p>
                    </div>
                  </div>

                  {/* Export Statistics Button */}
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={exportOverallStats}
                      className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Export Full Report
                    </button>
                  </div>
                </>
              ) : activeSection === 'services' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Services Header & Controls */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <span className="material-symbols-outlined text-[120px]">design_services</span>
                       </div>
                       <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div>
                             <h2 className="text-3xl font-black text-slate-900 dark:text-white">Service Offerings</h2>
                             <p className="text-sm text-slate-500 font-medium mt-1">Manage station services and customer bookings</p>
                          </div>
                          <div className="flex gap-3">
                             <button 
                                onClick={() => {
                                   setIsEditingService(false);
                                   setServiceForm({
                                      name: '', description: '', image: '', terms_conditions: '', status: 'Active'
                                   });
                                }}
                                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                             >
                                <span className="material-symbols-outlined text-sm">add</span>
                                New Service
                             </button>
                          </div>
                       </div>

                       <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                          <div className="relative flex-1 w-full">
                             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                             <input 
                                type="text" 
                                placeholder="Search services..."
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                          <div className="flex gap-3 w-full lg:w-auto">
                             <select 
                                value={serviceStatusFilter}
                                onChange={(e) => setServiceStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                             >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {services
                                .filter(s => (serviceStatusFilter === 'All' || s.status === serviceStatusFilter))
                                .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.description?.toLowerCase().includes(serviceSearch.toLowerCase()))
                                .map(s => (
                                   <div key={s.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all flex flex-col">
                                      <div className="flex items-start gap-4 h-full">
                                         <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                                            {s.image ? (
                                               <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                               <span className="material-symbols-outlined text-primary/30 text-3xl">design_services</span>
                                            )}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                               <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{s.name}</h3>
                                               <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 ${
                                                  s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                               }`}>{s.status}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Service Offering</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                                         </div>
                                      </div>
                                      <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                         <div className="flex items-center gap-2 text-primary">
                                            <span className="material-symbols-outlined text-xs">info</span>
                                            <span className="text-xs font-black">Terms Available</span>
                                         </div>
                                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                               onClick={() => {
                                                  setServiceForm(s);
                                                  setIsEditingService(true);
                                                  setCurrentServiceId(s.id);
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                               }}
                                               className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                               <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button 
                                               onClick={() => handleServiceDelete(s.id)}
                                               className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                               <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             {services.length === 0 && (
                                <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center">
                                   <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 font-thin">design_services</span>
                                   <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No services found</p>
                                </div>
                             )}
                          </div>
                       </div>

                       <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <h2 className="text-xl font-black">{isEditingService ? 'Edit Service' : 'Create Service'}</h2>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure service details</p>
                             </div>
                             {isEditingService && (
                                <button 
                                   onClick={() => {
                                      setIsEditingService(false);
                                      setCurrentServiceId(null);
                                      setServiceForm({ name: '', description: '', image: '', terms_conditions: '', status: 'Active' });
                                   }}
                                   className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline"
                                >
                                   Cancel
                                </button>
                             )}
                          </div>

                          <form className="space-y-6" onSubmit={handleServiceSubmit}>
                             <div className="flex justify-center">
                                <div 
                                   className="relative group size-28 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden hover:border-primary/40 cursor-pointer transition-all bg-slate-50 dark:bg-slate-900"
                                   onClick={() => document.getElementById('service-image').click()}
                                >
                                   {serviceForm.image ? (
                                      <img src={serviceForm.image} alt="Preview" className="w-full h-full object-cover" />
                                   ) : (
                                      <>
                                         <span className="material-symbols-outlined text-3xl text-primary/30">add_a_photo</span>
                                         <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest text-center px-2">Service Image</p>
                                      </>
                                   )}
                                   <input id="service-image" type="file" hidden accept="image/*" onChange={handleServiceImageUpload} />
                                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl">
                                      <span className="material-symbols-outlined text-white">upload</span>
                                   </div>
                                </div>
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Service Name</label>
                                <input 
                                   type="text" required
                                   value={serviceForm.name}
                                   onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                   placeholder="e.g. Advertising Services"
                                />
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Description</label>
                                <textarea 
                                   value={serviceForm.description}
                                   onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none"
                                   rows="3"
                                   placeholder="Describe the service offering..."
                                />
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Terms & Conditions</label>
                                <textarea 
                                   value={serviceForm.terms_conditions}
                                   onChange={(e) => setServiceForm(prev => ({ ...prev, terms_conditions: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none"
                                   rows="4"
                                   placeholder="Service terms and conditions..."
                                />
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Status</label>
                                <select 
                                   value={serviceForm.status}
                                   onChange={(e) => setServiceForm(prev => ({ ...prev, status: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                >
                                   <option value="Active">Active</option>
                                   <option value="Inactive">Inactive</option>
                                </select>
                             </div>

                             <button 
                                type="submit"
                                className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
                             >
                                {isEditingService ? 'Update Service' : 'Create Service'}
                             </button>
                          </form>
                       </div>
                    </div>

                    {/* Service Bookings Section */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm">
                       <div className="flex justify-between items-center mb-6">
                          <div>
                             <h3 className="text-xl font-black">Service Bookings</h3>
                             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Customer service requests</p>
                          </div>
                          <select 
                             value={bookingStatusFilter}
                             onChange={(e) => setBookingStatusFilter(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                             <option value="All">All Statuses</option>
                             <option value="Pending">Pending</option>
                             <option value="Confirmed">Confirmed</option>
                             <option value="Completed">Completed</option>
                             <option value="Cancelled">Cancelled</option>
                          </select>
                       </div>

                       <div className="space-y-4">
                          {serviceBookings
                             .filter(b => bookingStatusFilter === 'All' || b.status === bookingStatusFilter)
                             .map(b => (
                             <div key={b.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-primary/5">
                                <div className="flex justify-between items-start mb-3">
                                   <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white">{b.customer_name}</h4>
                                      <p className="text-xs text-slate-500">{b.service_name}</p>
                                   </div>
                                   <select 
                                      value={b.status}
                                      onChange={(e) => handleBookingStatusUpdate(b.id, e.target.value)}
                                      className="bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20"
                                   >
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Cancelled">Cancelled</option>
                                   </select>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                   <p><strong>Email:</strong> {b.customer_email}</p>
                                   {b.customer_phone && <p><strong>Phone:</strong> {b.customer_phone}</p>}
                                   {b.booking_date && <p><strong>Preferred Date:</strong> {new Date(b.booking_date).toLocaleDateString()}</p>}
                                   {b.details && <p><strong>Details:</strong> {b.details}</p>}
                                </div>
                             </div>
                          ))}
                          {serviceBookings.length === 0 && (
                             <div className="py-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">event_note</span>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No bookings yet</p>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'news' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">article</span>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">News Management</h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">Manage Local and International news stories</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setIsEditingNews(false);
                              setNewsForm({ title: '', category: 'Local', headline: '', details: '', caption: '', photo: '', thumbnail: '', status: 'Draft' });
                            }}
                            className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            New News
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                        <div className="relative flex-1 w-full">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search news..."
                            value={newsSearch}
                            onChange={(e) => setNewsSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                          />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                          <select
                            value={newsStatusFilter}
                            onChange={(e) => setNewsStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                          </select>
                          <select
                            value={newsForm.category}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value }))}
                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="Local">Local</option>
                            <option value="International">International</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newsList
                            .filter(n => newsStatusFilter === 'All' || n.status === newsStatusFilter)
                            .filter(n => n.title.toLowerCase().includes(newsSearch.toLowerCase()) || n.headline.toLowerCase().includes(newsSearch.toLowerCase()) || n.details?.toLowerCase().includes(newsSearch.toLowerCase()))
                            .map(n => (
                              <div key={n.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all flex flex-col">
                                <div className="flex items-start gap-4 h-full">
                                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                                    {n.thumbnail ? <img src={n.thumbnail} alt={n.title} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/30 text-3xl">photo</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{n.title}</h3>
                                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 ${n.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-400/10 text-slate-600'}`}>{n.status}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{n.category} News</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{n.headline}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">{n.caption || 'No caption'}</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setNewsForm(n); setIsEditingNews(true); setCurrentNewsId(n.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button onClick={() => handleNewsDelete(n.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {newsList.length === 0 && <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4 font-thin">article</span><p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No news items found</p></div>}
                        </div>
                      </div>

                      <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2 className="text-xl font-black">{isEditingNews ? 'Edit News' : 'Create News'}</h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Publish local / international news</p>
                          </div>
                          {isEditingNews && <button onClick={() => { setIsEditingNews(false); setCurrentNewsId(null); setNewsForm({ title: '', category: 'Local', headline: '', details: '', caption: '', photo: '', thumbnail: '', status: 'Draft' }); }} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline">Cancel</button>}
                        </div>

                        <form className="space-y-6" onSubmit={handleNewsSubmit}>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Headline</label>
                            <input type="text" required value={newsForm.headline} onChange={(e) => setNewsForm(prev => ({ ...prev, headline: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Short headline" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Title</label>
                            <input type="text" required value={newsForm.title} onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Full news title" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Category</label>
                            <select value={newsForm.category} onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                              <option value="Local">Local</option>
                              <option value="International">International</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Details</label>
                            <textarea value={newsForm.details} onChange={(e) => setNewsForm(prev => ({ ...prev, details: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none" rows="4" placeholder="Full article or summary details" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Caption</label>
                            <input type="text" value={newsForm.caption} onChange={(e) => setNewsForm(prev => ({ ...prev, caption: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Caption / quote" />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Main Photo</label>
                              <div className="relative group size-24 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900" onClick={() => document.getElementById('news-photo').click()}>
                                {newsForm.photo ? <img src={newsForm.photo} alt="News" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-sm">Click to upload photo</span>}
                                <input id="news-photo" type="file" accept="image/*" hidden onChange={(e) => handleNewsImageUpload(e, 'photo')} />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Thumbnail</label>
                              <div className="relative group size-24 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900" onClick={() => document.getElementById('news-thumbnail').click()}>
                                {newsForm.thumbnail ? <img src={newsForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-sm">Click to upload thumbnail</span>}
                                <input id="news-thumbnail" type="file" accept="image/*" hidden onChange={(e) => handleNewsImageUpload(e, 'thumbnail')} />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Status</label>
                            <select value={newsForm.status} onChange={(e) => setNewsForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>

                          <button type="submit" className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">{isEditingNews ? 'Update News' : 'Publish News'}</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'podcasts' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">podcasts</span>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Podcast Videos</h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">Manage podcast episodes (thumbnail + video link)</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setIsEditingPodcast(false);
                              setCurrentPodcastId(null);
                              setPodcastForm({ title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' });
                            }}
                            className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Podcast
                          </button>
                        </div>
                      </div>
                      <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                        <div className="relative flex-1 w-full">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search podcasts..."
                            value={podcastSearch}
                            onChange={(e) => setPodcastSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                          />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                          <select
                            value={podcastStatusFilter}
                            onChange={(e) => setPodcastStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {podcasts.filter(p => podcastStatusFilter === 'All' || p.status === podcastStatusFilter)
                            .filter(p => p.title.toLowerCase().includes(podcastSearch.toLowerCase()) || p.description?.toLowerCase().includes(podcastSearch.toLowerCase()))
                            .map(p => (
                              <div key={p.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all">
                                <div className="flex items-start gap-4">
                                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 overflow-hidden">
                                    {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover"/> : <span className="material-symbols-outlined text-primary/30 text-3xl">photo</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.title}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{p.video_url ? 'Has Video Link' : 'No Video'}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{p.description || 'No description available.'}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">{p.status}</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setPodcastForm(p); setIsEditingPodcast(true); setCurrentPodcastId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button onClick={() => handlePodcastDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {podcasts.length === 0 && <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4">podcasts</span><p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No podcast episodes found</p></div>}
                        </div>
                      </div>

                      <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2 className="text-xl font-black">{isEditingPodcast ? 'Edit Podcast' : 'Create Podcast'}</h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Add podcast title, description, and video link</p>
                          </div>
                          {isEditingPodcast && <button onClick={() => { setIsEditingPodcast(false); setCurrentPodcastId(null); setPodcastForm({ title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' }); }} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline">Cancel</button>}
                        </div>

                        <form className="space-y-4" onSubmit={handlePodcastSubmit}>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Title</label>
                            <input type="text" required value={podcastForm.title} onChange={(e) => setPodcastForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Episode headline" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Description</label>
                            <textarea value={podcastForm.description} onChange={(e) => setPodcastForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none" rows="3" placeholder="Episode summary" />
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Thumbnail</label>
                              <div onClick={() => document.getElementById('podcast-thumbnail').click()} className="relative group size-24 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900">
                                {podcastForm.thumbnail ? <img src={podcastForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-sm">Choose thumbnail</span>}
                                <input id="podcast-thumbnail" type="file" accept="image/*" hidden onChange={handlePodcastThumbnailUpload} />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Video URL</label>
                              <input type="url" value={podcastForm.video_url} onChange={(e) => setPodcastForm(prev => ({ ...prev, video_url: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="https://" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Status</label>
                            <select value={podcastForm.status} onChange={(e) => setPodcastForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">{isEditingPodcast ? 'Update Podcast' : 'Publish Podcast'}</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'program_videos' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">videocam</span>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Program Video Uploads</h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">Upload video content per program with thumbnail and description</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setIsEditingProgramVideo(false);
                              setCurrentProgramVideoId(null);
                              setProgramVideoForm({ program_id: '', title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' });
                            }}
                            className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Program Video
                          </button>
                        </div>
                      </div>
                      <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                        <div className="relative flex-1 w-full">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search program videos..."
                            value={programVideoSearch}
                            onChange={(e) => setProgramVideoSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                          />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                          <select
                            value={programVideoStatusFilter}
                            onChange={(e) => setProgramVideoStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {programVideos.filter(v => programVideoStatusFilter === 'All' || v.status === programVideoStatusFilter)
                            .filter(v => v.title.toLowerCase().includes(programVideoSearch.toLowerCase()) || v.description?.toLowerCase().includes(programVideoSearch.toLowerCase()) || v.program_title?.toLowerCase().includes(programVideoSearch.toLowerCase()))
                            .map(v => (
                              <div key={v.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all">
                                <div className="flex items-start gap-4">
                                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 overflow-hidden">
                                    {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/30 text-3xl">photo</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{v.title}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Program: {v.program_title || 'Unknown'}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{v.description || 'No description.'}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">{v.status}</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setProgramVideoForm({ program_id: v.program_id, title: v.title, description: v.description, thumbnail: v.thumbnail, video_url: v.video_url, status: v.status }); setIsEditingProgramVideo(true); setCurrentProgramVideoId(v.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button onClick={() => handleProgramVideoDelete(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {programVideos.length === 0 && <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4">videocam</span><p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No program videos found</p></div>}
                        </div>
                      </div>

                      <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h2 className="text-xl font-black">{isEditingProgramVideo ? 'Edit Program Video' : 'Add Program Video'}</h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Assign video to a program</p>
                          </div>
                          {isEditingProgramVideo && <button onClick={() => { setIsEditingProgramVideo(false); setCurrentProgramVideoId(null); setProgramVideoForm({ program_id: '', title: '', description: '', thumbnail: '', video_url: '', status: 'Draft' }); }} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline">Cancel</button>}
                        </div>

                        <form className="space-y-4" onSubmit={handleProgramVideoSubmit}>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Program</label>
                            <select value={programVideoForm.program_id} onChange={(e) => setProgramVideoForm(prev => ({ ...prev, program_id: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                              <option value="">Select Program</option>
                              {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Video Title</label>
                            <input type="text" required value={programVideoForm.title} onChange={(e) => setProgramVideoForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="Video headline" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Description</label>
                            <textarea value={programVideoForm.description} onChange={(e) => setProgramVideoForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none" rows="3" placeholder="Short description" />
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Thumbnail</label>
                              <div onClick={() => document.getElementById('program-video-thumbnail').click()} className="relative group size-24 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900">
                                {programVideoForm.thumbnail ? <img src={programVideoForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-sm">Choose thumbnail</span>}
                                <input id="program-video-thumbnail" type="file" accept="image/*" hidden onChange={handleProgramVideoThumbnailUpload} />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Video URL</label>
                              <input type="url" value={programVideoForm.video_url} onChange={(e) => setProgramVideoForm(prev => ({ ...prev, video_url: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="https://" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Status</label>
                            <select value={programVideoForm.status} onChange={(e) => setProgramVideoForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">{isEditingProgramVideo ? 'Update Program Video' : 'Save Program Video'}</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'staff' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">badge</span>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Staff Directory</h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">Manage staff profiles and full contact details</p>
                        </div>
                        <div className="flex gap-3">
                          {canPerform('staff', 'create') && (
                            <button
                              onClick={() => {
                                setIsEditingStaff(false);
                                setStaffForm({
                                  full_name: '', role: '', email: '', phone: '', image: '', bio: '', status: 'Active', joined_date: new Date().toISOString().split('T')[0]
                                });
                              }}
                              className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              New Staff
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                        <div className="relative flex-1 w-full">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input
                            type="text"
                            placeholder="Search staff..."
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                          />
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                          <select
                            value={staffStatusFilter}
                            onChange={(e) => setStaffStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {staffList
                            .filter(s => staffStatusFilter === 'All' || s.status === staffStatusFilter)
                            .filter(s => s.full_name.toLowerCase().includes(staffSearch.toLowerCase()) || s.role.toLowerCase().includes(staffSearch.toLowerCase()) || s.email.toLowerCase().includes(staffSearch.toLowerCase()))
                            .map(s => (
                              <div key={s.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all flex flex-col">
                                <div className="flex items-start gap-4 h-full">
                                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                                    {s.image ? <img src={s.image} alt={s.full_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/30 text-3xl">person</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{s.full_name}</h3>
                                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{s.status}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{s.role}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{s.bio||'No bio available.'}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{s.email} {s.phone ? `• ${s.phone}` : ''}</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                  <div className="text-[10px] font-black text-slate-500">Joined: {s.joined_date?.slice(0,10)}</div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canPerform('staff', 'update') && (
                                      <button onClick={() => { setStaffForm(s); setIsEditingStaff(true); setCurrentStaffId(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    )}
                                    {canPerform('staff', 'delete') && (
                                      <button onClick={() => handleStaffDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          {staffList.length === 0 && <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4 font-thin">badge</span><p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No staff members found</p></div>}
                        </div>
                      </div>

                      {(isEditingStaff ? canPerform('staff', 'update') : canPerform('staff', 'create')) ? (
                        <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <h2 className="text-xl font-black">{isEditingStaff ? 'Edit Staff Profile' : 'Create Staff Profile'}</h2>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Full staff detail capture</p>
                            </div>
                            {isEditingStaff && <button onClick={() => { setIsEditingStaff(false); setCurrentStaffId(null); setStaffForm({ full_name: '', role: '', email: '', phone: '', image: '', bio: '', status: 'Active', joined_date: new Date().toISOString().split('T')[0] }); }} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline">Cancel</button>}
                          </div>

                          <form className="space-y-6" onSubmit={handleStaffSubmit}>
                            <div className="flex justify-center">
                              <div className="relative group size-28 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden hover:border-primary/40 cursor-pointer transition-all bg-slate-50 dark:bg-slate-900" onClick={() => document.getElementById('staff-image').click()}>
                                {staffForm.image ? <img src={staffForm.image} alt="Profile" className="w-full h-full object-cover" /> : <><span className="material-symbols-outlined text-3xl text-primary/30">add_a_photo</span><p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest text-center px-2">Staff Image</p></>}
                                <input id="staff-image" type="file" hidden accept="image/*" onChange={handleStaffImageUpload} />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"><span className="material-symbols-outlined text-white">upload</span></div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Full Name</label>
                              <input type="text" required value={staffForm.full_name} onChange={(e) => setStaffForm(prev => ({ ...prev, full_name: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. Jane Doe" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Role</label>
                                <input type="text" required value={staffForm.role} onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. Program Manager" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Email</label>
                                <input type="email" required value={staffForm.email} onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="name@company.com" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Phone</label>
                                <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="+123456789" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Joined Date</label>
                                <input type="date" value={staffForm.joined_date} onChange={(e) => setStaffForm(prev => ({ ...prev, joined_date: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Bio</label>
                              <textarea value={staffForm.bio} onChange={(e) => setStaffForm(prev => ({ ...prev, bio: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold resize-none" rows="3" placeholder="Short staff biography..." />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Status</label>
                              <select value={staffForm.status} onChange={(e) => setStaffForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">
                              {isEditingStaff ? 'Update Staff profile' : 'Add Staff profile'}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-col bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-primary/10 p-10 shadow-sm items-center justify-center text-center h-full">
                          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">lock</span>
                          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">You do not have permission to {isEditingStaff ? 'edit' : 'create'} staff profiles.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeSection === 'assets' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Controls Bar */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex flex-1 gap-4 w-full">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input 
                            type="text" 
                            placeholder="Search by ID or name..."
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <select 
                          value={assetStatusFilter}
                          onChange={(e) => setAssetStatusFilter(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Operational">Operational</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Faulty">Faulty</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={exportAssets}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                          Export PDF
                        </button>
                        <button 
                          onClick={() => {
                            // Simple CSV export for "Excel" requirement
                            const headers = "Asset ID,Name,Category,Status,Value(SLe),Location\n";
                            const rows = assets.map(a => `${a.asset_tag},${a.name},${a.category},${a.status},${a.value},${a.location}`).join("\n");
                            const blob = new Blob([headers + rows], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">table_view</span>
                          Excel/CSV
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl font-bold">Station Assets</h2>
                            <p className="text-xs text-slate-500 mt-1">{assets.length} items in registry</p>
                          </div>
                          <button onClick={fetchAssets} className="p-2 hover:bg-primary/5 rounded-full text-primary transition-all">
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </button>
                        </div>

                        {loading ? (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-separate border-spacing-y-3">
                              <thead>
                                <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                  <th className="px-4 py-2">Preview</th>
                                  <th className="px-4 py-2">Asset Details</th>
                                  <th className="px-4 py-2">Valuation</th>
                                  <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {assets
                                  .filter(a => (assetStatusFilter === 'All' || a.status === assetStatusFilter))
                                  .filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.asset_tag.toLowerCase().includes(assetSearch.toLowerCase()))
                                  .map((a) => (
                                  <tr key={a.id} className="bg-primary/5 dark:bg-slate-800/20 rounded-2xl group">
                                    <td className="px-4 py-4 first:rounded-l-2xl">
                                      <div className="size-12 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden border border-primary/10">
                                        {a.image ? (
                                          <img src={a.image} className="w-full h-full object-cover" alt={a.name} />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined">image</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-primary tracking-tighter">{a.asset_tag}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                            a.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-600' :
                                            a.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-red-500/10 text-red-600'
                                          }`}>
                                            {a.status}
                                          </span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{a.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-black">{a.category} • {a.location}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="font-black text-slate-900 dark:text-slate-100">SLe {a.value?.toLocaleString()}</div>
                                      <div className="text-[10px] text-slate-500">Recorded: {a.purchase_date}</div>
                                    </td>
                                    <td className="px-4 py-4 last:rounded-r-2xl text-right">
                                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => {
                                            setAssetForm(a);
                                            setIsEditingAsset(true);
                                            setCurrentAssetId(a.id);
                                          }}
                                          className="p-2 hover:bg-primary/10 text-primary rounded-lg"
                                        >
                                          <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button 
                                          onClick={() => deleteAsset(a.id)}
                                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                                        >
                                          <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-6">
                           <h2 className="text-xl font-bold">{isEditingAsset ? 'Edit Asset' : 'Register New Asset'}</h2>
                           {isEditingAsset && (
                             <button 
                               onClick={() => {
                                 setIsEditingAsset(false);
                                 setAssetForm({
                                   name: '', category: 'Electronics', status: 'Operational',
                                   purchase_date: new Date().toISOString().split('T')[0],
                                   value: '', location: '', notes: '', image: ''
                                 });
                               }}
                               className="text-xs text-red-500 font-bold hover:underline"
                             >
                               Cancel
                             </button>
                           )}
                        </div>
                        
                        <form className="space-y-4" onSubmit={addAsset}>
                          <div className="relative group mx-auto size-32 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden hover:border-primary transition-all cursor-pointer">
                            {assetForm.image ? (
                              <img src={assetForm.image} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-primary/40 text-3xl">add_a_photo</span>
                                <span className="text-[10px] font-bold text-slate-400 mt-2">Upload Photo</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleAssetImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Asset Name</label>
                            <input
                              type="text"
                              required
                              value={assetForm.name}
                              onChange={(e) => setAssetForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                              placeholder="e.g., Studio Microphone A1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Category</label>
                              <select
                                value={assetForm.category}
                                onChange={(e) => setAssetForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-xs font-bold"
                              >
                                <option>Electronics</option>
                                <option>Furniture</option>
                                <option>Transmitter</option>
                                <option>Studio Gear</option>
                                <option>Vehicles</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Initial State</label>
                              <select
                                value={assetForm.status}
                                onChange={(e) => setAssetForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-xs font-bold"
                              >
                                <option>Operational</option>
                                <option>Maintenance</option>
                                <option>Faulty</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Purchase Date</label>
                              <input
                                type="date"
                                value={assetForm.purchase_date}
                                onChange={(e) => setAssetForm(p => ({ ...p, purchase_date: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Value (SLe)</label>
                              <input
                                type="number"
                                value={assetForm.value}
                                onChange={(e) => setAssetForm(p => ({ ...p, value: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-sm font-medium"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Location</label>
                            <input
                              type="text"
                              value={assetForm.location}
                              onChange={(e) => setAssetForm(p => ({ ...p, location: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 text-sm font-medium"
                              placeholder="e.g., Studio Desk 1"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-4 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 ${isEditingAsset ? 'bg-amber-500 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}
                          >
                            {submitting ? 'Processing...' : isEditingAsset ? 'Update Asset' : 'Register Asset'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'media' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Media Header & Controls */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="text-primary font-bold cursor-pointer hover:underline"
                              onClick={() => setCurrentFolderId(null)}
                            >
                              Media Root
                            </span>
                            {currentFolderId && (
                              <>
                                <span className="text-slate-400">/</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {folders.find(f => f.id === currentFolderId)?.name}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">Manage station assets, recordings, and documentation</p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setIsCreatingFolder(true)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">create_new_folder</span>
                            New Folder
                          </button>
                          <label className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-sm">upload_file</span>
                            Upload Media
                            <input type="file" className="hidden" onChange={handleMediaUpload} />
                          </label>
                        </div>
                      </div>

                      {/* Media Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                          { label: 'Images', type: 'image', icon: 'image', color: 'text-primary' },
                          { label: 'Videos', type: 'video', icon: 'movie', color: 'text-rose-500' },
                          { label: 'Audio', type: 'audio', icon: 'music_note', color: 'text-emerald-500' },
                          { label: 'Documents', type: 'document', icon: 'description', color: 'text-indigo-500' }
                        ].map((stat) => (
                          <div key={stat.type} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-primary/5">
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                              <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                <p className="text-lg font-bold">{mediaStats[stat.type]?.count || 0}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex flex-col md:flex-row gap-4 items-center mb-4">
                        <div className="flex-1 w-full flex gap-3">
                          <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">event</span>
                            <input 
                              type="date" 
                              value={mediaUploadDate}
                              onChange={(e) => setMediaUploadDate(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 font-bold"
                            />
                          </div>
                          <div className="flex-1 text-[10px] text-slate-500 flex flex-col justify-center leading-tight">
                            <span className="font-bold uppercase tracking-widest text-primary">Upload Date</span>
                            <span>Setting this helps track broadcast/creation dates accurately.</span>
                          </div>
                        </div>
                      </div>

                      {/* Search & Filters */}
                      <div className="mt-2 flex flex-col md:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                        <div className="relative flex-1 w-full">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                          <input 
                            type="text" 
                            placeholder="Search library..."
                            value={mediaSearch}
                            onChange={(e) => setMediaSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                          {['All', 'image', 'video', 'audio', 'document'].map(type => (
                            <button
                              key={type}
                              onClick={() => setMediaTypeFilter(type)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                mediaTypeFilter === type 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary/5 hover:text-primary'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Folders & Files Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* Create Folder Popup (Inline) */}
                      {isCreatingFolder && (
                        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-4 flex flex-col gap-3">
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && createMediaFolder()}
                            className="bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-xs"
                          />
                          <div className="flex gap-2">
                            <button onClick={createMediaFolder} className="flex-1 py-1 bg-primary text-white rounded-lg text-[10px] font-bold">Create</button>
                            <button onClick={() => setIsCreatingFolder(false)} className="px-2 py-1 text-slate-400 text-[10px] font-bold">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Display Folders (Only at root or according to parent if we had nested, but we have simple folders for now) */}
                      {!currentFolderId && folders.map(folder => (
                        <div 
                          key={folder.id}
                          className="group relative bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                          onClick={() => setCurrentFolderId(folder.id)}
                        >
                          <span className="material-symbols-outlined text-amber-500 text-4xl">folder</span>
                          <span className="text-[11px] font-bold text-center truncate w-full">{folder.name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteMediaFolder(folder.id); }}
                            className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}

                      {/* Display Files */}
                      {mediaFiles
                        .filter(f => (mediaTypeFilter === 'All' || f.type === mediaTypeFilter))
                        .filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                        .map(file => (
                        <div 
                          key={file.id}
                          className="group relative bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:scale-[1.02] transition-all shadow-sm"
                        >
                          <div className="size-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                            {file.type === 'image' ? (
                              <img src={file.url} className="w-full h-full object-cover" alt={file.name} />
                            ) : file.type === 'video' ? (
                              <span className="material-symbols-outlined text-3xl text-primary">movie</span>
                            ) : file.type === 'audio' ? (
                              <span className="material-symbols-outlined text-3xl text-emerald-500">music_note</span>
                            ) : (
                              <span className={`material-symbols-outlined text-3xl ${
                                file.name.toLowerCase().endsWith('.pdf') ? 'text-rose-500' :
                                file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.csv') ? 'text-emerald-500' :
                                file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? 'text-primary' :
                                'text-indigo-500'
                              }`}>
                                {
                                  file.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' :
                                  file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.csv') ? 'table_view' :
                                  file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? 'description' :
                                  'draft'
                                }
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-center truncate w-full">{file.name}</span>
                          
                          {/* File Actions */}
                          <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => setViewerFile(file)}
                              className="p-2 bg-white text-primary rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                              title="View"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <a 
                              href={file.url} 
                              download={file.name}
                              className="p-2 bg-white text-primary rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                              title="Download"
                            >
                              <span className="material-symbols-outlined text-lg">download</span>
                            </a>
                            <button 
                              onClick={() => deleteMediaFile(file.id)}
                              className="p-2 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {mediaFiles.length === 0 && !isCreatingFolder && !folders.length && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                          <span className="material-symbols-outlined text-5xl mb-4">cloud_off</span>
                          <p className="font-bold">This directory is empty.</p>
                          <p className="text-xs">Upload some files to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeSection === 'audit' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold">System Audit Logs</h2>
                        <p className="text-xs text-slate-500">History of all actions performed on the platform</p>
                      </div>
                      <button onClick={fetchAuditLogs} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-lg">refresh</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <th className="px-4 py-3 font-black uppercase tracking-widest">Timestamp</th>
                            <th className="px-4 py-3 font-black uppercase tracking-widest">Team Member</th>
                            <th className="px-4 py-3 font-black uppercase tracking-widest">Action</th>
                            <th className="px-4 py-3 font-black uppercase tracking-widest">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-medium">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="size-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold uppercase">
                                    {log.full_name?.substring(0, 2) || log.username?.substring(0, 2) || '??'}
                                  </div>
                                  <span className="font-bold">{log.full_name || log.username}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                  log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                                  log.action.includes('CREATE') || log.action.includes('UPLOAD') ? 'bg-emerald-500/10 text-emerald-500' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                  {log.action.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-slate-600 dark:text-slate-400 leading-normal italic">
                                "{log.details}"
                              </td>
                            </tr>
                          ))}
                          {auditLogs.length === 0 && (
                            <tr>
                              <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                No activity logs found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : activeSection === 'tasks' ? (
                <>
                  <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Activity Coordinator</h2>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily & Weekly Operations</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportTasks} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all" title="Export PDF">
                          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                        </button>
                        <button onClick={exportTasks} className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500/20 transition-all" title="Export Excel">
                          <span className="material-symbols-outlined text-lg">table_view</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                      <div className="relative md:col-span-2">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                          type="text" 
                          placeholder="Search tasks..."
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <select 
                        value={taskFilter}
                        onChange={(e) => setTaskFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 text-slate-600"
                      >
                        <option value="All">All Categories</option>
                        <option value="Daily">Daily Tasks</option>
                        <option value="Weekly">Weekly Tasks</option>
                      </select>
                      <select 
                        value={taskUserFilter}
                        onChange={(e) => setTaskUserFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 text-slate-600"
                      >
                        <option value="All">All Members</option>
                        {systemUsers.map(u => (
                          <option key={u.id} value={u.username}>{u.full_name || u.username}</option>
                        ))}
                      </select>
                      <select 
                        value={taskSortBy}
                        onChange={(e) => setTaskSortBy(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 text-slate-600"
                      >
                        <option value="due_date">Sort by Deadline</option>
                        <option value="priority">Sort by Priority</option>
                      </select>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {tasks
                        .filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()) || t.description?.toLowerCase().includes(taskSearch.toLowerCase()))
                        .filter(t => taskFilter === 'All' || t.category === taskFilter)
                        .filter(t => taskUserFilter === 'All' || t.creator_name === taskUserFilter)
                        .sort((a, b) => {
                          if (taskSortBy === 'due_date') return new Date(a.due_date) - new Date(b.due_date);
                          return 0;
                        })
                        .map((t) => (
                        <div key={t.id} className="group flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                          <div className={`mt-1 size-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            t.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 hover:border-primary'
                          }`} onClick={() => handleToggleTaskStatus(t)}>
                            {t.status === 'Completed' && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-bold text-sm ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {t.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                  t.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                                  t.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                                  'bg-slate-500/10 text-slate-500'
                                }`}>
                                  {t.priority}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                  {canPerform('tasks', 'update') && (
                                    <button onClick={() => {
                                      setIsEditingTask(true);
                                      setCurrentTaskId(t.id);
                                      setTaskForm({ 
                                        title: t.title, 
                                        description: t.description || '', 
                                        category: t.category, 
                                        priority: t.priority, 
                                        status: t.status, 
                                        due_date: t.due_date 
                                      });
                                    }} className="p-1 text-primary hover:bg-primary/10 rounded-md">
                                      <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                  )}
                                  {canPerform('tasks', 'delete') && (
                                    <button onClick={() => handleTaskDelete(t.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-md">
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">{t.description}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-tight">
                                <span className="material-symbols-outlined text-[12px]">person</span>
                                {t.creator_name || 'System'}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-tight">
                                <span className="material-symbols-outlined text-[12px]">category</span>
                                {t.category}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="py-20 text-center">
                          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">task</span>
                          <p className="text-slate-400 text-sm italic font-bold">No tasks assigned for today.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(isEditingTask ? canPerform('tasks', 'update') : canPerform('tasks', 'create')) ? (
                    <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm h-fit">
                      <h2 className="text-xl font-bold mb-4">{isEditingTask ? 'Edit Coordination Task' : 'New Strategic Task'}</h2>
                      <form className="space-y-4" onSubmit={handleTaskSubmit}>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                          <input
                            type="text"
                            required
                            value={taskForm.title}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. Daily Equipment Check"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                            <select
                              value={taskForm.category}
                              onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="Daily">Daily</option>
                              <option value="Weekly">Weekly</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                            <select
                              value={taskForm.priority}
                              onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                          <input
                            type="date"
                            required
                            value={taskForm.due_date}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                          <textarea
                            rows="3"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                            placeholder="Describe the objective..."
                          ></textarea>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {submitting ? 'Syncing...' : isEditingTask ? 'Update Task' : 'Launch Task'}
                          </button>
                          {isEditingTask && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingTask(false);
                                setCurrentTaskId(null);
                                setTaskForm({ title: '', description: '', category: 'Daily', priority: 'Medium', status: 'Pending', due_date: new Date().toISOString().split('T')[0] });
                              }}
                              className="px-4 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/10 p-10 shadow-sm items-center justify-center text-center h-full">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">You do not have permission to {isEditingTask ? 'edit' : 'create'} tasks.</p>
                    </div>
                  )}
                </>
              ) : activeSection === 'donors' ? (
                <>
                  <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">volunteer_activism</span>
                        </div>
                        <h2 className="text-xl font-bold">Recent Donors</h2>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={exportDonors}
                          className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 text-xs"
                        >
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                          Export PDF
                        </button>
                        <button 
                          onClick={exportDonors}
                          className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-xs"
                        >
                          <span className="material-symbols-outlined text-sm">table_view</span>
                          Excel Report
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="md:col-span-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                          type="text" 
                          placeholder="Search donors..."
                          value={donorSearch}
                          onChange={(e) => setDonorSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <select 
                          value={donorSortBy}
                          onChange={(e) => setDonorSortBy(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 appearance-none text-slate-600"
                        >
                          <option value="date">Sort by Date</option>
                          <option value="amount">Sort by Amount</option>
                        </select>
                        <select 
                          value={donorFilter}
                          onChange={(e) => setDonorFilter(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 appearance-none text-slate-600"
                        >
                          <option value="All">All Tiers</option>
                          <option value="Large">SLe 1,000+</option>
                          <option value="Recent">Last 30 Days</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-500 font-bold italic uppercase tracking-widest">Loading Records...</p>
                      </div>
                    ) : donors.length === 0 ? (
                      <p className="text-slate-500 py-10 text-center italic">No donations recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-primary/5 text-slate-500 dark:text-slate-400">
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Donor</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Amount</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Date</th>
                              <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donors
                              .filter(d => d.name.toLowerCase().includes(donorSearch.toLowerCase()) || d.email?.toLowerCase().includes(donorSearch.toLowerCase()))
                              .filter(d => {
                                if (donorFilter === 'All') return true;
                                if (donorFilter === 'Large') return d.amount >= 1000;
                                if (donorFilter === 'Recent') return (new Date() - new Date(d.date)) / (1000 * 3600 * 24) <= 30;
                                return true;
                              })
                              .sort((a, b) => {
                                if (donorSortBy === 'date') return new Date(b.date) - new Date(a.date);
                                return b.amount - a.amount;
                              })
                              .map((d) => (
                              <tr key={d.id} className="border-t border-primary/5 hover:bg-primary/5 group transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-900 dark:text-white capitalize">{d.name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium lowercase tracking-tight">{d.email || 'no-email@registry.com'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-black">
                                    SLe {d.amount?.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[11px] text-slate-500 font-bold">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                    {canPerform('donors', 'update') && (
                                      <button 
                                        onClick={() => {
                                          // Edit donor functionality would go here
                                        }}
                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Edit Record"
                                      >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                      </button>
                                    )}
                                    {canPerform('donors', 'delete') && (
                                      <button 
                                        onClick={() => deleteDonor(d.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove Donor"
                                      >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : activeSection === 'partners' ? (
                <>
                  <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">handshake</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Partners Portal</h2>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Strategic Relationships</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportPartnersReport} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 text-xs">
                          <span className="material-symbols-outlined text-sm">description</span>
                          Partnership Report
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                          type="text" 
                          placeholder="Search partners..."
                          value={partnerSearch}
                          onChange={(e) => setPartnerSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <select 
                        value={partnerFilter}
                        onChange={(e) => setPartnerFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 text-slate-600"
                      >
                        <option value="All">All Categories</option>
                        <option value="NGO">NGOs</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Government">Government</option>
                        <option value="Media">Media Partners</option>
                      </select>
                      <select 
                        value={partnerSortBy}
                        onChange={(e) => setPartnerSortBy(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 text-slate-600"
                      >
                        <option value="name">Sort A-Z</option>
                        <option value="date">Newest First</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {partners
                        .filter(p => (partnerFilter === 'All' || p.type === partnerFilter))
                        .filter(p => p.name.toLowerCase().includes(partnerSearch.toLowerCase()))
                        .sort((a, b) => {
                          if (partnerSortBy === 'name') return a.name.localeCompare(b.name);
                          return new Date(b.agreement_date) - new Date(a.agreement_date);
                        })
                        .map((p) => (
                        <div key={p.id} className="group relative flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                          <div className="size-14 rounded-xl bg-white dark:bg-slate-800 border border-primary/5 flex items-center justify-center overflow-hidden">
                            {p.logo ? (
                              <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="material-symbols-outlined text-primary/30 text-2xl">business</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${
                                p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                              }`}>{p.status}</span>
                              <span className="text-[10px] text-slate-400 font-medium">• {p.type}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 font-medium">{p.contact_person || 'No contact set'}</div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                            {canPerform('partners', 'update') && (
                              <button onClick={() => {
                                setIsEditingPartner(true);
                                setCurrentPartnerId(p.id);
                                setPartnerForm({ ...p, notes: p.notes || '' });
                              }} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            )}
                            {canPerform('partners', 'delete') && (
                              <button onClick={() => handlePartnerDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {partners.length === 0 && (
                      <div className="py-20 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 flex justify-center">diversity_3</span>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No partners established yet.</p>
                      </div>
                    )}
                  </div>

                  {(isEditingPartner ? canPerform('partners', 'update') : canPerform('partners', 'create')) ? (
                    <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm h-fit">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">{isEditingPartner ? 'Edit Profile' : 'New Partnership'}</h2>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-sm">{isEditingPartner ? 'edit_note' : 'add_link'}</span>
                        </div>
                      </div>
                      
                      <form className="space-y-4" onSubmit={handlePartnerSubmit}>
                        <div className="flex justify-center mb-6">
                          <div className="relative group cursor-pointer" onClick={() => document.getElementById('partner-logo').click()}>
                            <div className="size-24 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/40">
                              {partnerForm.logo ? (
                                <img src={partnerForm.logo} alt="Preview" className="w-full h-full object-contain" />
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                                  <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-tighter">Identity Logo</p>
                                </>
                              )}
                            </div>
                            <input id="partner-logo" type="file" hidden accept="image/*" onChange={handlePartnerLogoUpload} />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                              <span className="material-symbols-outlined text-white">upload</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Legal Entity Name</label>
                          <input
                            type="text"
                            required
                            value={partnerForm.name}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. UN Women Sierra Leone"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                            <select
                              value={partnerForm.type}
                              onChange={(e) => setPartnerForm(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="NGO">Non-Governmental</option>
                              <option value="Corporate">Corporate / Private</option>
                              <option value="Government">Government / Agency</option>
                              <option value="Media">Media / Broadcast</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                            <select
                              value={partnerForm.status}
                              onChange={(e) => setPartnerForm(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="Active">Operational</option>
                              <option value="Pending">On-Boarding</option>
                              <option value="Inactive">Paused</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contact Primary</label>
                          <input
                            type="text"
                            value={partnerForm.contact_person}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, contact_person: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            placeholder="Focal Point Name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="email"
                            value={partnerForm.email}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                            placeholder="official@email.com"
                          />
                          <input
                            type="tel"
                            value={partnerForm.phone}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                            placeholder="+232 Phone Number"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Agreement Date</label>
                          <input
                            type="date"
                            value={partnerForm.agreement_date}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, agreement_date: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {submitting ? 'Syncing...' : isEditingPartner ? 'Update Partnership' : 'Seal Partnership'}
                          </button>
                          {isEditingPartner && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingPartner(false);
                                setCurrentPartnerId(null);
                                setPartnerForm({ name: '', logo: '', type: 'NGO', contact_person: '', email: '', phone: '', status: 'Active', agreement_date: new Date().toISOString().split('T')[0], notes: '' });
                              }}
                              className="px-4 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/10 p-10 shadow-sm items-center justify-center text-center h-full">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">You do not have permission to {isEditingPartner ? 'edit' : 'create'} partnerships.</p>
                    </div>
                  )}
                </>
              ) : activeSection === 'social' ? (
                <>
                  <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-4 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                       <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-2xl">share_reviews</span>
                       </div>
                       <div>
                          <h2 className="text-2xl font-black">Social Nexus</h2>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Omni-Channel Sync</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Broadcast Registry</h3>
                       <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {socialPosts.length === 0 && (
                            <div className="py-20 text-center">
                               <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">public_off</span>
                               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No social synchronizations recorded.</p>
                            </div>
                          )}
                          {socialPosts.map((post) => (
                            <div key={post.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all group">
                               <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                     <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                     </div>
                                     <div>
                                        <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{post.full_name || post.username}</div>
                                        <div className="text-[9px] text-slate-400 font-bold">{new Date(post.created_at).toLocaleString()}</div>
                                     </div>
                                  </div>
                                  <div className="flex gap-1">
                                     {post.platforms.map(p => (
                                        <span key={p} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-primary/10 rounded text-[8px] font-black text-primary uppercase tracking-tight">{p}</span>
                                     ))}
                                  </div>
                               </div>
                               <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{post.content}</p>
                               {post.image && (
                                 <div className="mt-4 rounded-xl overflow-hidden border border-primary/5 max-h-40">
                                    <img src={post.image} alt="Broadcast Attachment" className="w-full h-full object-cover" />
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  {canPerform('social', 'create') ? (
                    <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                       <div className="flex items-center justify-between mb-8">
                          <h2 className="text-xl font-bold">Omni-Poster</h2>
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined text-sm">sync_alt</span>
                          </div>
                       </div>

                       <form className="space-y-6" onSubmit={handleSocialSubmit}>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Platforms</label>
                             <div className="grid grid-cols-2 gap-2">
                                {['Facebook', 'Instagram', 'X / Twitter', 'LinkedIn'].map(p => {
                                   const isSelected = socialForm.platforms.includes(p);
                                   return (
                                      <button 
                                         key={p}
                                         type="button"
                                         onClick={() => toggleSocialPlatform(p)}
                                         className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                            isSelected 
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                            : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-500 hover:border-primary/20'
                                         }`}
                                      >
                                         {p}
                                         {isSelected && <span className="material-symbols-outlined text-[10px]">check_circle</span>}
                                      </button>
                                   );
                                })}
                             </div>
                          </div>

                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Content Blueprint</label>
                             <textarea 
                                required
                                value={socialForm.content}
                                onChange={(e) => setSocialForm(prev => ({ ...prev, content: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 resize-none"
                                rows="5"
                                placeholder="What's happening across the nexus?"
                             ></textarea>
                          </div>

                          <div className="flex flex-col gap-4">
                             <div className="relative group size-20 rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden hover:border-primary/40 cursor-pointer transition-all" onClick={() => document.getElementById('social-img').click()}>
                                {socialForm.image ? (
                                   <img src={socialForm.image} alt="Upload" className="w-full h-full object-cover" />
                                ) : (
                                   <span className="material-symbols-outlined text-slate-300">add_a_photo</span>
                                )}
                                <input id="social-img" type="file" hidden accept="image/*" onChange={handleSocialImageUpload} />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="material-symbols-outlined text-white">upload</span></div>
                             </div>

                             <button 
                                type="submit" 
                                disabled={submitting || socialForm.platforms.length === 0}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                             >
                                {submitting ? 'Broadcasting...' : 'Ignite Sync'}
                             </button>
                          </div>
                       </form>
                    </div>
                  ) : (
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/10 p-10 shadow-sm items-center justify-center text-center h-full sticky top-8">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">You do not have permission to post to social media.</p>
                    </div>
                  )}
                </>
              ) : activeSection === 'programs' ? (
                <>
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Programs Header & Controls */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <span className="material-symbols-outlined text-[120px]">calendar_month</span>
                       </div>
                       <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div>
                             <h2 className="text-3xl font-black text-slate-900 dark:text-white">Broadcast Programs</h2>
                             <p className="text-sm text-slate-500 font-medium mt-1">Schedule and manage the station's daily transmission flow</p>
                          </div>
                          <div className="flex gap-3">
                             <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button 
                                   onClick={() => setProgramView('grid')}
                                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${programView === 'grid' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}
                                >
                                   Registry
                                </button>
                                <button 
                                   onClick={() => setProgramView('schedule')}
                                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${programView === 'schedule' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}
                                >
                                   Schedule
                                </button>
                             </div>
                             <button 
                                onClick={() => {
                                   setIsEditingProgram(false);
                                   setProgramForm({
                                      title: '', category: 'News & Current Affairs', description: '', host: '', days: [],
                                      start_time: '06:00', end_time: '07:00', status: 'Active', image: '', notes: ''
                                   });
                                   // We'll show the form in a side-panel or similar. For now let's use the layout we have.
                                }}
                                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                             >
                                <span className="material-symbols-outlined text-sm">add</span>
                                New Program
                             </button>
                          </div>
                       </div>

                       <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center border-t border-primary/5 pt-6">
                          <div className="relative flex-1 w-full">
                             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                             <input 
                                type="text" 
                                placeholder="Search by title, host or description..."
                                value={programSearch}
                                onChange={(e) => setProgramSearch(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                          <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                             <select 
                                value={programCategoryFilter}
                                onChange={(e) => setProgramCategoryFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                             >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                             <select 
                                value={programStatusFilter}
                                onChange={(e) => setProgramStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                             >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="On Break">On Break</option>
                                <option value="Discontinued">Discontinued</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 space-y-4">
                          {programView === 'grid' ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programs
                                   .filter(p => (programCategoryFilter === 'All' || p.category === programCategoryFilter))
                                   .filter(p => (programStatusFilter === 'All' || p.status === programStatusFilter))
                                   .filter(p => p.title.toLowerCase().includes(programSearch.toLowerCase()) || p.host?.toLowerCase().includes(programSearch.toLowerCase()))
                                   .map(p => (
                                      <div key={p.id} className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-5 shadow-sm group hover:border-primary/30 transition-all flex flex-col">
                                         <div className="flex items-start gap-4 h-full">
                                            <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                                               {p.image ? (
                                                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                               ) : (
                                                  <span className="material-symbols-outlined text-primary/30 text-3xl">radio</span>
                                               )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                               <div className="flex justify-between items-start">
                                                  <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{p.title}</h3>
                                                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 ${
                                                     p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 
                                                     p.status === 'On Break' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                                                  }`}>{p.status}</span>
                                               </div>
                                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{p.category} • {p.host || 'Various Hosts'}</p>
                                               <div className="mt-3 flex flex-wrap gap-1">
                                                  {p.days.slice(0, 3).map(day => (
                                                     <span key={day} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-[8px] font-bold text-slate-600 capitalize">{day.substring(0,3)}</span>
                                                  ))}
                                                  {p.days.length > 3 && <span className="text-[8px] font-bold text-slate-400 self-center">+{p.days.length - 3}</span>}
                                               </div>
                                            </div>
                                         </div>
                                         <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary">
                                               <span className="material-symbols-outlined text-xs">schedule</span>
                                               <span className="text-xs font-black">{p.start_time} - {p.end_time}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <button 
                                                  onClick={() => {
                                                     setProgramForm(p);
                                                     setIsEditingProgram(true);
                                                     setCurrentProgramId(p.id);
                                                     window.scrollTo({ top: 0, behavior: 'smooth' });
                                                  }}
                                                  className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                               >
                                                  <span className="material-symbols-outlined text-sm">edit</span>
                                               </button>
                                               <button 
                                                  onClick={() => handleProgramDelete(p.id)}
                                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                               >
                                                  <span className="material-symbols-outlined text-sm">delete</span>
                                               </button>
                                            </div>
                                         </div>
                                      </div>
                                   ))}
                                {programs.length === 0 && (
                                   <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center">
                                      <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 font-thin">calendar_today</span>
                                      <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">No programs found in system</p>
                                   </div>
                                )}
                             </div>
                          ) : (
                             <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm overflow-hidden min-h-[500px]">
                                <h3 className="text-xl font-black mb-6">Program Schedule Mapping</h3>
                                <div className="space-y-6">
                                   {programDays.map(day => {
                                      const dayPrograms = programs.filter(p => p.days.includes(day)).sort((a,b) => a.start_time.localeCompare(b.start_time));
                                      return (
                                         <div key={day} className="flex gap-4">
                                            <div className="w-24 flex-shrink-0">
                                               <span className="text-xs font-black uppercase tracking-widest text-primary">{day}</span>
                                            </div>
                                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                               {dayPrograms.map(p => (
                                                  <div key={`${day}-${p.id}`} className="flex-shrink-0 w-48 p-3 bg-primary/5 dark:bg-slate-800 rounded-2xl border border-primary/10 group relative">
                                                     <div className="text-[9px] font-black text-primary mb-1">{p.start_time} - {p.end_time}</div>
                                                     <div className="text-xs font-bold text-slate-900 dark:text-white truncate mb-0.5">{p.title}</div>
                                                     <div className="text-[8px] font-bold text-slate-500 uppercase truncate">{p.host || 'Various'}</div>
                                                     <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                                                        <button onClick={() => { setProgramForm(p); setIsEditingProgram(true); setCurrentProgramId(p.id); }} className="size-8 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                     </div>
                                                  </div>
                                               ))}
                                               {dayPrograms.length === 0 && (
                                                  <div className="flex-1 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Off Air / Music Stream</span>
                                                  </div>
                                               )}
                                            </div>
                                         </div>
                                      );
                                   })}
                                </div>
                             </div>
                          )}
                       </div>

                       <div className="flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-primary/10 p-6 shadow-sm h-fit sticky top-8">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <h2 className="text-xl font-black">{isEditingProgram ? 'Edit Transmission' : 'Schedule Blueprint'}</h2>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure broadcast parameters</p>
                             </div>
                             {isEditingProgram && (
                                <button 
                                   onClick={() => {
                                      setIsEditingProgram(false);
                                      setCurrentProgramId(null);
                                      setProgramForm({
                                         title: '', category: 'News & Current Affairs', description: '', host: '', days: [],
                                         start_time: '06:00', end_time: '07:00', status: 'Active', image: '', notes: ''
                                      });
                                   }}
                                   className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline"
                                >
                                   Cancel
                                </button>
                             )}
                          </div>

                          <form className="space-y-6" onSubmit={handleProgramSubmit}>
                             {/* Program Branding */}
                             <div className="flex justify-center">
                                <div 
                                   className="relative group size-28 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden hover:border-primary/40 cursor-pointer transition-all bg-slate-50 dark:bg-slate-900"
                                   onClick={() => document.getElementById('program-image').click()}
                                >
                                   {programForm.image ? (
                                      <img src={programForm.image} alt="Preview" className="w-full h-full object-cover" />
                                   ) : (
                                      <>
                                         <span className="material-symbols-outlined text-3xl text-primary/30">add_a_photo</span>
                                         <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest text-center px-2">Program Badge</p>
                                      </>
                                   )}
                                   <input id="program-image" type="file" hidden accept="image/*" onChange={handleProgramImageUpload} />
                                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="material-symbols-outlined text-white">upload</span>
                                   </div>
                                </div>
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Program Title</label>
                                <input 
                                   type="text" required
                                   value={programForm.title}
                                   onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                   placeholder="e.g. Nyapui Morning Vibes"
                                />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Category</label>
                                   <select 
                                      value={programForm.category}
                                      onChange={(e) => setProgramForm(prev => ({ ...prev, category: e.target.value }))}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-primary/20"
                                   >
                                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                   </select>
                                </div>
                                <div>
                                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Primary Host</label>
                                   <input 
                                      type="text"
                                      value={programForm.host}
                                      onChange={(e) => setProgramForm(prev => ({ ...prev, host: e.target.value }))}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                      placeholder="Name"
                                   />
                                </div>
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Air Frequency (Days)</label>
                                <div className="flex flex-wrap gap-2">
                                   {programDays.map(day => {
                                      const isSelected = programForm.days.includes(day);
                                      return (
                                         <button 
                                            key={day} type="button"
                                            onClick={() => toggleProgramDay(day)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                               isSelected ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-primary/5 hover:text-primary'
                                            }`}
                                         >
                                            {day.substring(0, 3)}
                                         </button>
                                      );
                                   })}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Starts At</label>
                                   <input 
                                      type="time" required
                                      value={programForm.start_time}
                                      onChange={(e) => setProgramForm(prev => ({ ...prev, start_time: e.target.value }))}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-black"
                                   />
                                </div>
                                <div>
                                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Concludes At</label>
                                   <input 
                                      type="time" required
                                      value={programForm.end_time}
                                      onChange={(e) => setProgramForm(prev => ({ ...prev, end_time: e.target.value }))}
                                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-black"
                                   />
                                </div>
                             </div>

                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Program Status</label>
                                <select 
                                   value={programForm.status}
                                   onChange={(e) => setProgramForm(prev => ({ ...prev, status: e.target.value }))}
                                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-primary/20"
                                >
                                   <option value="Active">Active / On Air</option>
                                   <option value="On Break">On Seasonal Break</option>
                                   <option value="Discontinued">Archive / Discontinued</option>
                                </select>
                             </div>

                             <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                             >
                                {submitting ? 'Updating System...' : isEditingProgram ? 'Update Program Profile' : 'Lock Transmission Schedule'}
                             </button>
                          </form>
                       </div>
                    </div>
                  </div>
                </>
               ) : activeSection === 'users' ? (
                <>
                  <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 shadow-sm overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="p-8 border-b border-primary/5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
                          <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary scale-125">manage_accounts</span>
                              System Access Control
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Manage user accounts and specify sidebar access permissions.</p>
                          </div>
                          <button 
                             onClick={() => {
                               setIsEditingUser(false);
                               setCurrentUserManagementId(null);
                               setUserForm({ username: '', password: '', role: 'staff', permissions: {}, full_name: '', user_email: '', bio: '', profile_picture: '' });
                             }}
                             className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                          >
                             <span className="material-symbols-outlined text-sm">person_add</span>
                             Create New User
                          </button>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                          {/* User List Sidebar */}
                          <div className="lg:col-span-4 border-r border-primary/5 bg-slate-50/50 dark:bg-slate-900/20 max-h-[700px] overflow-y-auto custom-scrollbar">
                             <div className="p-4 border-b border-primary/5 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                                <div className="relative">
                                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                  <input 
                                     type="text" placeholder="Search users..."
                                     value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                     className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary/20 transition-all"
                                  />
                                </div>
                             </div>
                             <div className="divide-y divide-primary/5">
                                {systemUsers.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                                   <button 
                                      key={u.id}
                                      onClick={() => {
                                         setIsEditingUser(true);
                                         setCurrentUserManagementId(u.id);
                                         setUserForm({ ...u, password: '' });
                                      }}
                                      className={`w-full p-4 text-left flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-slate-800 group ${currentUserManagementId === u.id ? 'bg-white dark:bg-slate-800 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                   >
                                      <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shadow-inner font-bold">
                                         {u.profile_picture ? <img src={u.profile_picture} alt="User profile" className="w-full h-full object-cover" /> : u.username.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{u.full_name || u.username}</p>
                                         <div className="flex items-center gap-2 mt-0.5">
                                           <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${u.role === 'superuser' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                             {u.role}
                                           </span>
                                           <span className="text-[10px] text-slate-400 truncate">@{u.username}</span>
                                         </div>
                                      </div>
                                      <div onClick={(e) => { e.stopPropagation(); handleUserDelete(u.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                         <span className="material-symbols-outlined text-sm">delete</span>
                                      </div>
                                   </button>
                                ))}
                             </div>
                          </div>

                          {/* Detail / Form Container */}
                          <div className="lg:col-span-8 p-10 max-h-[700px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900/40">
                             <form onSubmit={handleUserSubmit} className="space-y-10">
                                <section>
                                  <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-3xl border border-primary/10 mb-8">
                                     <div className="relative group cursor-pointer size-28 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                                        {userForm.profile_picture ? <img src={userForm.profile_picture} alt="User profile" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/40 text-4xl">add_a_photo</span>}
                                        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white">upload</span></div>
                                        <input type="file" accept="image/*" onChange={handleUserImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                     </div>
                                     <div>
                                        <h4 className="text-xl font-bold">User Identity</h4>
                                        <p className="text-sm text-slate-500">Provide personal and account details for this user.</p>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                                     <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Account Username</label>
                                        <input type="text" required value={userForm.username} onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. jdoe" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{isEditingUser ? 'New Password (Optional)' : 'Security Password'}</label>
                                        <input type="password" required={!isEditingUser} value={userForm.password} onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="••••••••" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Official Full Name</label>
                                        <input type="text" value={userForm.full_name} onChange={(e) => setUserForm(p => ({ ...p, full_name: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 font-bold" placeholder="e.g. John Doe" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Role</label>
                                        <select value={userForm.role} onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 font-black cursor-pointer">
                                           <option value="staff">Station Staff</option>
                                           <option value="manager">Station Manager</option>
                                           <option value="superuser">Super Administrator</option>
                                        </select>
                                     </div>
                                  </div>
                                </section>

                                <section className="pt-10 border-t border-primary/10">
                                   <div className="flex items-center justify-between mb-8">
                                      <div>
                                         <h4 className="text-xl font-bold">Access Permissions</h4>
                                         <p className="text-sm text-slate-500">Fine-tune exactly what parts of the system this user can interact with.</p>
                                      </div>
                                      {userForm.role === 'superuser' && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase rounded-xl border border-amber-500/20 shadow-sm animate-pulse">
                                          <span className="material-symbols-outlined text-sm">security</span>
                                          Full Access Granted
                                        </div>
                                      )}
                                   </div>

                                   {userForm.role !== 'superuser' && (
                                      <div className="bg-slate-50 dark:bg-slate-900 border border-primary/5 rounded-[2rem] overflow-hidden shadow-sm">
                                         <div className="grid grid-cols-12 gap-2 p-5 bg-slate-100 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            <div className="col-span-4 pl-2">System Section</div>
                                            <div className="col-span-2 text-center">Read</div>
                                            <div className="col-span-2 text-center">Create</div>
                                            <div className="col-span-2 text-center">Update</div>
                                            <div className="col-span-2 text-center">Delete</div>
                                         </div>
                                         <div className="divide-y divide-primary/5">
                                            {sidebarSections.map(section => (
                                               <div key={section.key} className="grid grid-cols-12 gap-2 p-5 items-center hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                                                  <div className="col-span-4 flex items-center gap-3 pl-2">
                                                     <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                       <span className="material-symbols-outlined text-sm text-primary/60">{navItems.find(n => n.key === section.key)?.icon}</span>
                                                     </div>
                                                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{section.label}</span>
                                                  </div>
                                                  {['read', 'create', 'update', 'delete'].map(action => (
                                                     <div key={action} className="col-span-2 flex justify-center">
                                                        <button 
                                                           type="button"
                                                           onClick={() => toggleUserPermission(section.key, action)}
                                                           className={`size-7 rounded-xl flex items-center justify-center transition-all ${userForm.permissions[section.key]?.[action] ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-200 dark:bg-slate-700 text-transparent hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                                        >
                                                           <span className="material-symbols-outlined text-xs font-black">check</span>
                                                        </button>
                                                     </div>
                                                  ))}
                                               </div>
                                            ))}
                                         </div>
                                      </div>
                                   )}
                                </section>

                                <button type="submit" disabled={submitting} className="w-full py-5 bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 mt-4">
                                   {submitting ? 'Authenticating System Changes...' : isEditingUser ? 'Commit User Profile Changes' : 'Initialize New Access Profile'}
                                </button>
                             </form>
                          </div>
                       </div>
                    </div>
                  </div>
                </>
              ) : activeSection === 'settings' ? (

                <>
                  <div className="lg:col-span-1 flex flex-col items-center bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-8 shadow-sm h-fit">
                    <div className="relative group overflow-hidden rounded-3xl size-32 bg-primary/10 border-2 border-primary/20">
                      {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-primary/40">person</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-bold">{user?.full_name || user?.username}</h3>
                      <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1">{user?.role}</p>
                    </div>
                    
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-8 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="lg:col-span-2 bg-white dark:bg-slate-800/40 rounded-2xl border border-primary/10 p-8 shadow-sm">
                    {!isEditing ? (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">badge</span>
                            Profile Overview
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                              <p className="text-slate-900 dark:text-slate-100 font-medium">{user?.full_name || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                              <p className="text-slate-900 dark:text-slate-100 font-medium">{user?.user_email || 'Not set'}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Professional Bio</p>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                {user?.bio || 'You haven\'t added a bio yet. Click edit to tell the team about yourself.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_edit</span>
                            Edit Personal Details
                          </h2>
                          <button 
                            onClick={() => {
                              setIsEditing(false);
                              setProfileForm({
                                full_name: user?.full_name || '',
                                user_email: user?.user_email || '',
                                bio: user?.bio || '',
                                profile_picture: user?.profile_picture || ''
                              });
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>

                        <form className="space-y-6" onSubmit={updateProfile}>
                          <div className="flex items-center gap-6 mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="relative group cursor-pointer size-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center">
                              {profileForm.profile_picture ? (
                                <img src={profileForm.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-primary/40">add_a_photo</span>
                              )}
                              <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-xs">upload</span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold mb-1">Update Profile Picture</p>
                              <p className="text-xs text-slate-500">Recommended size: 400x400 JPG/PNG (Max 1MB)</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Full Name</label>
                              <input
                                type="text"
                                value={profileForm.full_name}
                                onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="Your official name"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={profileForm.user_email}
                                onChange={(e) => setProfileForm(p => ({ ...p, user_email: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="admin@nyapuiradio.sl"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Professional Bio</label>
                              <textarea
                                rows="4"
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm"
                                placeholder="Short description about your role and responsibilities..."
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-4 pt-4">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                              {submitting ? 'Updating...' : 'Save Changes'}
                              <span className="material-symbols-outlined text-sm">save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                setProfileForm({
                                  full_name: user?.full_name || '',
                                  user_email: user?.user_email || '',
                                  bio: user?.bio || '',
                                  profile_picture: user?.profile_picture || ''
                                });
                              }}
                              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="lg:col-span-3 py-20 text-center">
                  <p className="text-slate-500">Feature coming soon: {activeSection}</p>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

