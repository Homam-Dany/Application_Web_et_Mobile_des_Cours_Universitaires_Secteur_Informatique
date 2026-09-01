import React, { useState, useEffect } from 'react';
import { Book, CheckCircle, BrainCircuit, UploadCloud, Users, FileText, Database, Plus, Trash2, RefreshCw, ChevronRight, Layout, FolderOpen, Folder, PlayCircle, Lock, Image as ImageIcon, Video, FileArchive, File as FileIcon, ArrowLeft, Code, FileSignature, LayoutGrid, FileQuestion, BarChart2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('dashboard'); // 'dashboard' or 'content'
  
  // Dashboard states
  const [stats, setStats] = useState({ total_students: 0, total_resources: 0, total_qcm: 0, struggling_students: [] });
  const [resourceDistribution, setResourceDistribution] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  // Content states
  const [streams, setStreams] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [activeResourceTab, setActiveResourceTab] = useState('course');
  const [viewingCourse, setViewingCourse] = useState(null);

  // Users states
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Streams
        const streamsRes = await axios.get('http://localhost:8000/api/v1/streams/', { headers });
        setStreams(streamsRes.data);
        
        // Fetch Real Admin Stats
        const statsRes = await axios.get('http://localhost:8000/api/v1/admin/stats/', { headers });
        const data = statsRes.data;
        
        setStats({
            total_students: data.total_students,
            total_resources: data.total_resources,
            total_qcm: data.total_qcm,
            struggling_students: data.struggling_students || []
        });
        setResourceDistribution(data.resource_distribution);
        setActivityData(data.activity_data);

        // Fetch Users
        const usersRes = await axios.get('http://localhost:8000/api/v1/users/admin/users/', { headers });
        setUsersList(usersRes.data);

      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const allModules = streams.flatMap(stream => stream.modules || []);

  const TABS = [
    { id: 'course', label: 'Cours', icon: <Book size={18} /> },
    { id: 'workshop', label: 'Ateliers & TP', icon: <Code size={18} /> },
    { id: 'exam', label: 'CC & Examens', icon: <FileQuestion size={18} /> },
    { id: 'report', label: 'Rapports', icon: <FileSignature size={18} /> },
    { id: 'other', label: 'Autres', icon: <LayoutGrid size={18} /> },
  ];

  const renderResourceIcon = (mime_type) => {
    if (!mime_type) return <FileIcon size={24} color="var(--accent-primary)" />;
    if (mime_type.includes('image')) return <ImageIcon size={24} color="var(--accent-primary)" />;
    if (mime_type.includes('video')) return <Video size={24} color="var(--accent-primary)" />;
    if (mime_type.includes('zip') || mime_type.includes('rar')) return <FileArchive size={24} color="var(--accent-primary)" />;
    if (mime_type.includes('pdf') || mime_type.includes('document')) return <FileText size={24} color="var(--accent-primary)" />;
    return <FileIcon size={24} color="var(--accent-primary)" />;
  };

  const getFilteredResources = (chapter, type) => {
    return chapter.resources?.filter(r => r.resource_type === type) || [];
  };

  const hasAnyResources = (module, type) => {
    return module.chapters?.some(chapter => getFilteredResources(chapter, type).length > 0);
  };

  const handleManualUpload = () => {
    // In a real implementation, this would open a file picker or modal
    alert("Fonctionnalité d'ajout manuel (Google Drive ou Local) bientôt disponible. Cette action permettra de téléverser des documents directement dans ce dossier.");
  };

  const handleGenerateQCM = async (courseId) => {
    try {
        const token = localStorage.getItem('access_token');
        await axios.post(`http://localhost:8000/api/v1/resources/${courseId}/generate_qcm/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("La génération par l'IA a été lancée en arrière-plan ! Vous retrouverez les questions dans l'onglet 'Validation IA' d'ici quelques secondes.");
    } catch (e) {
        alert("Erreur lors du lancement de la génération.");
        console.error(e);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={32} color="var(--accent-primary)" />
            Centre de Contrôle (Admin)
          </h1>
          <p className="page-subtitle">Bienvenue {user?.first_name}, gérez la plateforme et suivez l'activité.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => alert("Synchronisation complète de Google Drive lancée en arrière-plan !")}>
            <RefreshCw size={18} /> Sync Drive
          </button>
        </div>
      </div>

      {/* Main Admin Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button 
          className={`btn ${activeMainTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveMainTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }}
        >
          <BarChart2 size={20} /> Statistiques
        </button>
        <button 
          className={`btn ${activeMainTab === 'content' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveMainTab('content')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }}
        >
          <FolderOpen size={20} /> Gestion Documentaire
        </button>
        <button 
          className={`btn ${activeMainTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveMainTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }}
        >
          <Users size={20} /> Utilisateurs
        </button>
      </div>

      {/* ======================================================== */}
      {/* ==================== DASHBOARD TAB ===================== */}
      {/* ======================================================== */}
      {activeMainTab === 'dashboard' && (
        <div className="fade-in">
          {/* KPIs */}
          <div className="grid-cards" style={{ marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <FileText size={24} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Ressources</h3>
              </div>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{stats.total_resources}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Fichiers indexés sur la plateforme</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <Users size={24} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Étudiants</h3>
              </div>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{stats.total_students}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Inscrits actifs</p>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(245,158,11,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <BrainCircuit size={24} color="var(--warning)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>QCM Générés</h3>
              </div>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{stats.total_qcm}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Générés par l'Intelligence Artificielle</p>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '24px' }}>Activité (Derniers jours)</h3>
              <div style={{ flex: 1, paddingBottom: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="upload" name="Uploads (Drive)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="qcm" name="QCM Générés" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '24px' }}>Répartition des Ressources</h3>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {resourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Struggling Students Alert */}
          {stats.struggling_students?.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <AlertCircle size={24} color="var(--danger)" />
                <h3 style={{ margin: 0, color: 'var(--danger)' }}>Étudiants en difficulté (Moyenne &lt; 10/20)</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {stats.struggling_students.map(student => (
                  <div key={student.id} style={{ background: 'rgba(239,68,68,0.1)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{student.first_name} {student.last_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                      {student.avg_score}/20
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* ===================== CONTENT TAB ====================== */}
      {/* ======================================================== */}
      {activeMainTab === 'content' && (
        <div className="fade-in">
          {!activeModule ? (
            // --- VUE GRILLE DES MODULES ---
            <div className="modules-overview">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Modules & Cours</h2>
              </div>
              
              {allModules.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucun module disponible pour le moment.
                </div>
              ) : (
                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {allModules.map((module) => (
                    <div 
                      key={module.id} 
                      className="glass-panel hover-lift" 
                      style={{ 
                        padding: '24px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onClick={() => setActiveModule(module)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ 
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(147,51,234,0.2) 100%)', 
                          padding: '16px', 
                          borderRadius: '16px',
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                        }}>
                          <Layout size={28} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', lineHeight: '1.4', margin: 0 }}>{module.name}</h3>
                      </div>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <span>{module.chapters?.reduce((acc, chap) => acc + (chap.resources?.length || 0), 0)} documents</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: '500' }}>
                          Gérer <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // --- VUE DÉTAILLÉE D'UN MODULE (ADMIN) ---
            <div className="module-detail fade-in">
              <button 
                className="btn btn-secondary" 
                style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => { setActiveModule(null); setActiveResourceTab('course'); }}
              >
                <ArrowLeft size={18} /> Retour aux modules
              </button>
              
              <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(to right, var(--bg-secondary), rgba(59,130,246,0.05))' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{activeModule.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>Gérez les documents et QCM pour ce module.</p>
              </div>

              {/* TABS NAVIGATION */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '32px', 
                overflowX: 'auto', 
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-color)',
                alignItems: 'center'
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResourceTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: activeResourceTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                      color: activeResourceTab === tab.id ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '8px 8px 0 0',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      borderBottom: activeResourceTab === tab.id ? '3px solid var(--accent-hover)' : '3px solid transparent'
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
                <div style={{ flex: 1 }}></div>
                <button className="btn btn-primary" onClick={handleManualUpload} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} /> Ajouter Fichier
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="tab-content">
                {!hasAnyResources(activeModule, activeResourceTab) ? (
                  <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FolderOpen size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                    <p style={{ marginBottom: '24px' }}>Aucun document de type <strong>{TABS.find(t => t.id === activeResourceTab).label}</strong> dans ce module.</p>
                    <button className="btn btn-secondary" onClick={handleManualUpload}>
                      <UploadCloud size={18} style={{ marginRight: '8px' }} />
                      Importer un premier document
                    </button>
                  </div>
                ) : (
                  activeModule.chapters?.map((chapter) => {
                    const resources = getFilteredResources(chapter, activeResourceTab);
                    if (resources.length === 0) return null;

                    return (
                      <div key={chapter.id} style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Folder size={20} color="var(--warning)" />
                          {chapter.title}
                          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '12px' }}>({resources.length} fichiers)</span>
                        </h3>
                        
                        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                          {resources.map((course) => (
                            <div key={course.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px' }}>
                                  {renderResourceIcon(course.mime_type)}
                                </div>
                                <h4 style={{ fontSize: '1rem', wordBreak: 'break-word', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>{course.title}</h4>
                              </div>
                              
                              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setViewingCourse(course)}>
                                  Ouvrir
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} title="Générer QCM par IA" onClick={() => handleGenerateQCM(course.id)}>
                                  <BrainCircuit size={16} />
                                  QCM
                                </button>
                                <button className="btn" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} title="Supprimer">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Secure Viewer Modal */}
      {viewingCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setViewingCourse(null)}>
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', maxWidth: '1200px', height: '90vh', 
              display: 'flex', flexDirection: 'column', 
              background: 'var(--bg-primary)', padding: '0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderResourceIcon(viewingCourse.mime_type)}
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{viewingCourse.title}</h2>
              </div>
              <button className="btn btn-secondary" style={{ borderRadius: '20px', padding: '8px 20px' }} onClick={() => setViewingCourse(null)}>Fermer</button>
            </div>
            
            <div style={{ flex: 1, width: '100%', background: '#e2e8f0', position: 'relative' }}>
              {viewingCourse.drive_file_id ? (
                <iframe 
                  src={`https://drive.google.com/file/d/${viewingCourse.drive_file_id}/preview`} 
                  style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
                  title={viewingCourse.title}
                  allow="autoplay"
                ></iframe>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Erreur : Fichier introuvable.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================= USERS TAB ======================== */}
      {/* ======================================================== */}
      {activeMainTab === 'users' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestion des Utilisateurs</h2>
          </div>
          
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Nom</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Date d'inscription</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Statut</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{u.first_name} {u.last_name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {u.is_active ? (
                        <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Actif
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={14} /> Inactif
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        className={`btn ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('access_token');
                            await axios.patch(`http://localhost:8000/api/v1/users/admin/users/${u.id}/`, 
                              { is_active: !u.is_active },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setUsersList(usersList.map(user => user.id === u.id ? { ...user, is_active: !u.is_active } : user));
                          } catch (e) {
                            alert("Erreur lors de la modification du statut.");
                          }
                        }}
                      >
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
                {usersList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucun étudiant trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: rgba(59,130,246,0.5) !important;
        }
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
