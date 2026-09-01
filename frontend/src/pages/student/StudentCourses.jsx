import React, { useState, useEffect } from 'react';
import { Book, PlayCircle, Lock, Folder, FolderOpen, ChevronRight, FileText, Image as ImageIcon, Video, FileArchive, File as FileIcon, ArrowLeft, Layout, Code, FileSignature, LayoutGrid, FileQuestion, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const StudentCourses = () => {
  const [streams, setStreams] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState('course');
  const [viewingCourse, setViewingCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:8000/api/v1/streams/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStreams(res.data);
      } catch (error) {
        console.error("Failed to fetch streams", error);
      }
    };
    fetchStreams();
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

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Book size={32} color="var(--accent-primary)" />
            Mes Cours
          </h1>
          <p className="page-subtitle">Consultez vos documents, rapports et ressources pédagogiques.</p>
        </div>
      </div>

      {!activeModule ? (
        <div className="modules-overview">
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600' }}>Mes Modules d'Étude</h2>
          
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
                      Ouvrir <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="module-detail fade-in">
          <button 
            className="btn btn-secondary" 
            style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => { setActiveModule(null); setActiveTab('course'); }}
          >
            <ArrowLeft size={18} /> Retour aux modules
          </button>
          
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(to right, var(--bg-secondary), rgba(59,130,246,0.05))' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{activeModule.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Explorez les documents, ateliers et examens de ce module.</p>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '32px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  borderBottom: activeTab === tab.id ? '3px solid var(--accent-hover)' : '3px solid transparent'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {!hasAnyResources(activeModule, activeTab) ? (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FolderOpen size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>Aucun document de type <strong>{TABS.find(t => t.id === activeTab).label}</strong> dans ce module.</p>
              </div>
            ) : (
              activeModule.chapters?.map((chapter) => {
                const resources = getFilteredResources(chapter, activeTab);
                if (resources.length === 0) return null;

                return (
                  <div key={chapter.id} style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Folder size={20} color="var(--warning)" />
                      {chapter.title}
                    </h3>
                    
                    <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {resources.map((course) => (
                        <div key={course.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px' }}>
                              {renderResourceIcon(course.mime_type)}
                            </div>
                            <h4 style={{ fontSize: '1rem', wordBreak: 'break-word', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>{course.title}</h4>
                          </div>
                          
                          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} onClick={() => setViewingCourse(course)}>
                              Ouvrir
                            </button>
                            {chapter.question_banks && chapter.question_banks.length > 0 ? (
                              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/student/quiz/${chapter.question_banks[0].id}`)}>
                                <PlayCircle size={16} />
                                Lancer QCM
                              </button>
                            ) : (
                              <button className="btn" style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }} disabled>
                                Pas de QCM
                              </button>
                            )}
                          </div>
                          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Lock size={12} /> Vue sécurisée
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

export default StudentCourses;
