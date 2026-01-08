import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Clapperboard, Film, Image as ImageIcon, Wand2, Edit3, Camera, Sparkles, X,
  Lightbulb, Palette, Music, Aperture, RefreshCw, MessageSquare, Loader2, Plus,
  Trash2, FolderOpen, LogOut, Layers, Type as TypeIcon, Mic, Maximize2, Move,
  Settings2, ChevronLeft, Video, ArrowRight, FileDown, Printer, ChevronDown, User as UserIcon,
  MoreVertical, Share, Info, Compass, Heart
} from 'lucide-react';
import { View, Shot, DPNotes, Project, Language, Sequence } from './types';
import { STYLES_LIST, SHOT_TYPES, ANGLES, AXES, MOVEMENTS } from './constants';
import { generateShotList, generateDirectorNotes, generateShotImage } from './services/geminiService';
import { auth, db, googleProvider } from './firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  User
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const translations = {
  fr: {
    projects: "Projets",
    sequence: "Séquence",
    sequences: "Séquences",
    script: "Script",
    breakdown: "Découpage",
    storyboard: "Storyboard",
    settings: "Compte",
    logout: "Déconnexion",
    newProject: "Nouveau Projet",
    welcome: "Bienvenue au Studio",
    createProject: "Lancer",
    cancel: "Annuler",
    save: "Enregistrer",
    update: "Mettre à jour",
    add: "Ajouter",
    delete: "Supprimer",
    edit: "Modifier",
    style: "Style visuel",
    customStylePlaceholder: "Décrivez votre vision artistique...",
    shotType: "Type de plan",
    angle: "Angle",
    axis: "Axe",
    movement: "Mouvement",
    sound: "Ambiance sonore",
    dialogue: "Dialogue",
    description: "Description",
    generate: "Générer le découpage",
    myProjects: "Mes projets",
    noProjects: "Aucune production.",
    startHere: "Commencer",
    newProduction: "Nouveau projet",
    vision: "Décrivez votre vision artistique...",
    addSequence: "Séquence",
    deleteSequence: "Supprimer",
    noShots: "Votre découpage est vide.",
    noShotsGuide: "Analysez votre script avec l'IA ou ajoutez vos plans manuellement.",
    minOneSequence: "Dernière séquence gardée.",
    export: "Exporter",
    selectSequence: "Séquence",
    selectFormat: "Format d'exportation",
    generating: "Analyse du script...",
    authTitle: "ShotLab AI",
    authSubtitle: "Studio de pré-production intelligent",
    enterName: "Votre Nom",
    enter: "Entrer",
    generateViaScript: "Générer via Script",
    addManually: "Ajouter manuellement",
    allSequences: "Toutes les séquences",
    printExport: "Lancer l'exportation",
    vip: "Devenir VIP",
    navigation: "Menu de navigation",
    storyboardEmpty: "Storyboard vide",
    storyboardEmptyGuide: "Générez d'abord un découpage technique pour visualiser vos plans.",
    authError: "Erreur d'authentification",
    logoutConfirm: "Voulez-vous vraiment vous déconnecter ?",
    trash: "Corbeille",
    trashEmpty: "La corbeille est vide",
    restore: "Restaurer",
    permanentDelete: "Supprimer définitivement",
    moveToTrash: "Projet envoyé à la corbeille",
    restored: "Projet restauré",
    permanentlyDeleted: "Projet supprimé définitivement",
    heroTitle: "Studio de préproduction ",
    heroSubtitle: "Transformez vos scripts en decoupage et storyboards professionnels en un clic.",
    getStarted: "Commencer",
    creditsRemaining: "Crédits disponibles",
    activateVip: "Entrer un code VIP",
    vipCodePlaceholder: "Votre code...",
    accountType: "Type de compte",
    standard: "Standard",
    vipAccount: "Membre VIP",
    invalidCode: "Code invalide",
    vipSuccess: "Compte VIP activé !",
    insufficientCredits: "Crédits insuffisants (7 requis)",
    insufficientCreditsImage: "Crédits insuffisants (1 requis)",
  },
  en: {
    projects: "Projects",
    sequence: "Sequence",
    sequences: "Sequences",
    script: "Script",
    breakdown: "Shotlist",
    storyboard: "Storyboard",
    settings: "Account",
    logout: "Logout",
    newProject: "New Project",
    welcome: "Welcome to Studio",
    createProject: "Create",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    add: "Add",
    delete: "Delete",
    edit: "Edit",
    style: "Visual Style",
    customStylePlaceholder: "Style (e.g. B&W Cinematic...)",
    shotType: "Shot Type",
    angle: "Angle",
    axis: "Axis",
    movement: "Movement",
    sound: "Soundscape",
    dialogue: "Dialogue",
    description: "Description",
    generate: "Generate Shotlist",
    myProjects: "Productions",
    noProjects: "No productions.",
    startHere: "Start a journey",
    newProduction: "New Production",
    vision: "Describe your vision...",
    addSequence: "Sequence",
    deleteSequence: "Delete",
    noShots: "Your shotlist is empty.",
    noShotsGuide: "Analyze your script with AI or add shots manually.",
    minOneSequence: "One sequence minimum.",
    export: "Export PDF",
    selectSequence: "Sequence",
    selectFormat: "Format",
    generating: "Analyzing script...",
    authTitle: "ShotLab AI",
    authSubtitle: "Intelligent pre-production studio",
    enterName: "Your Name",
    enter: "Enter",
    generateViaScript: "Generate via Script",
    addManually: "Add manually",
    allSequences: "All sequences",
    printExport: "Start Export",
    vip: "Become VIP",
    navigation: "Navigation Menu",
    storyboardEmpty: "Storyboard Empty",
    storyboardEmptyGuide: "Generate a technical breakdown first to visualize your shots.",
    authError: "Authentication error",
    logoutConfirm: "Are you sure you want to log out?",
    trash: "Trash",
    trashEmpty: "Trash is empty",
    restore: "Restore",
    permanentDelete: "Delete permanently",
    moveToTrash: "Project moved to trash",
    restored: "Project restored",
    permanentlyDeleted: "Project permanently deleted",
    heroTitle: "Intelligent Pre-production ",
    heroSubtitle: "Transform your scripts into professional breakdowns and storyboards in one click. Manage your productions, optimize your shots, and realize your vision.",
    getStarted: "Start Journey",
    creditsRemaining: "Available Credits",
    activateVip: "Enter VIP code",
    vipCodePlaceholder: "Your code...",
    accountType: "Account Type",
    standard: "Standard",
    vipAccount: "VIP Member",
    invalidCode: "Invalid code",
    vipSuccess: "VIP account activated!",
    insufficientCredits: "Insufficient credits (7 required)",
    insufficientCreditsImage: "Insufficient credits (1 required)",
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon, loading = false }: any) => {
  const baseStyles = "relative flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none tracking-tight min-h-[42px]";
  const variants: any = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-400/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    magic: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-500/20 text-white border border-white/10",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : (
        <>
          {Icon && <Icon size={18} className="mr-2" />}
          {children}
        </>
      )}
    </button>
  );
};

const Logo = ({ size = 'md', className = '' }: { size?: 'md' | 'lg', className?: string }) => (
  <div className={`flex items-center gap-3 ${size === 'lg' ? 'scale-125' : ''} ${className}`}>
    <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shrink-0">
      <Clapperboard size={18} className="text-white" />
    </div>
    <h1 className="font-black text-xl md:text-2xl tracking-tighter shrink-0">
      <span className="text-white">Shot</span>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 inline-block">Lab</span>
    </h1>
  </div>
);

const Badge = ({ children, icon: Icon, color = 'blue' }: any) => {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    neutral: "bg-white/5 text-neutral-400 border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${colors[color]}`}>
      {Icon && <Icon size={10} className="mr-1" />}
      {children}
    </span>
  );
};

const DebouncedText = ({ value, onChange, placeholder, className }: { value: string, onChange: (val: string) => void, placeholder: string, className?: string }) => {
  const [localValue, setLocalValue] = useState(value);
  const isFocused = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newVal);
    }, 1000);
  };

  const handleBlur = () => {
    isFocused.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(localValue);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className || "flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 font-mono text-base md:text-lg resize-none focus:outline-none custom-scrollbar leading-relaxed"}
      placeholder={placeholder}
    />
  );
};

const DebouncedInput = ({ value, onChange, placeholder, className }: { value: string, onChange: (val: string) => void, placeholder: string, className?: string }) => {
  const [localValue, setLocalValue] = useState(value);
  const isFocused = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newVal);
    }, 1000);
  };

  const handleBlur = () => {
    isFocused.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange(localValue);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ credits: number, isVip: boolean, customPresets?: { id: string, label: string, vision: string }[] } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [language, setLanguage] = useState<Language>('fr');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPitch, setNewProjectPitch] = useState('');
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeProjectMenuId, setActiveProjectMenuId] = useState<string | null>(null);
  const [editingShotIndex, setEditingShotIndex] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<'breakdown' | 'storyboard'>('breakdown');
  const [exportSeqId, setExportSeqId] = useState<string>('');
  const [manualShot, setManualShot] = useState<Partial<Shot>>({
    shotType: '', angle: 'Niveau regard', axis: 'Face', movement: 'Fixe', description: '', sound: '', dialogue: '', visualPrompt: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };
    window.addEventListener('pwaUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('pwaUpdateAvailable', handleUpdate);
  }, []);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentView(View.DASHBOARD);
        // Sync Profile
        const profileRef = doc(db, "users", currentUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as { credits: number, isVip: boolean, customPresets?: { id: string, label: string, vision: string }[] });
          } else {
            const initialProfile = { credits: 20, isVip: false, customPresets: [] };
            await setDoc(profileRef, initialProfile);
          }
        });
        return () => unsubscribeProfile();
      } else {
        setCurrentView(View.HOME);
        setProfile(null);
        setProjects([]);
        setCurrentProject(null);
        setActiveSequenceId(null);
        localStorage.removeItem('shotlab_current_project_id');
        localStorage.removeItem('shotlab_active_sequence_id');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "projects"),
      where("ownerId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Project[];

      // Sort client-side to avoid needing a composite index
      const sortedProjects = projectsData.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(sortedProjects);

      // Restore current project if ID is saved
      const savedProjectId = localStorage.getItem('shotlab_current_project_id');
      if (savedProjectId) {
        const project = sortedProjects.find(p => p.id === savedProjectId);
        if (project) {
          setCurrentProject(project);
          const savedSeqId = localStorage.getItem('shotlab_active_sequence_id');
          if (savedSeqId && project.sequences.some(s => s.id === savedSeqId)) {
            setActiveSequenceId(savedSeqId);
          } else {
            setActiveSequenceId(project.sequences[0].id);
          }
        }
      }
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getActiveSequence = () => {
    if (!currentProject || !activeSequenceId) return null;
    return currentProject.sequences.find(s => s.id === activeSequenceId) || currentProject.sequences[0];
  };

  const updateProjectData = async (data: Partial<Project>) => {
    if (!currentProject || !user) return;
    try {
      const projectRef = doc(db, "projects", currentProject.id);
      await updateDoc(projectRef, { ...data, updatedAt: Date.now() });
      setCurrentProject(prev => prev ? { ...prev, ...data, updatedAt: Date.now() } : null);
    } catch (e) {
      showNotification("Erreur de sauvegarde", "error");
    }
  };

  const updateSequenceData = async (data: Partial<Sequence>) => {
    if (!currentProject || !activeSequenceId) return;
    const updatedSequences = currentProject.sequences.map(s => s.id === activeSequenceId ? { ...s, ...data } : s);
    await updateProjectData({ sequences: updatedSequences });
  };

  const deductCredits = async (amount: number) => {
    if (!user || !profile) return false;
    if (profile.isVip) return true;
    if (profile.credits < amount) return false;

    try {
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, { credits: profile.credits - amount });
      return true;
    } catch (e) {
      console.error("Error deducting credits:", e);
      return false;
    }
  };

  const [vipCode, setVipCode] = useState('');
  const handleActivateVip = async () => {
    if (!user || !profile) return;
    if (vipCode.trim().toUpperCase() === 'XTRASHOT02S7@') {
      try {
        const profileRef = doc(db, "users", user.uid);
        await updateDoc(profileRef, { isVip: true });
        showNotification(t.vipSuccess, "success");
        setVipCode('');
      } catch (e) {
        showNotification("Erreur lors de l'activation VIP", "error");
      }
    } else {
      showNotification(t.invalidCode, "error");
    }
  };



  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('shotlab_current_project_id', currentProject.id);
    } else {
      localStorage.removeItem('shotlab_current_project_id');
    }
  }, [currentProject]);

  useEffect(() => {
    if (activeSequenceId) {
      localStorage.setItem('shotlab_active_sequence_id', activeSequenceId);
    } else {
      localStorage.removeItem('shotlab_active_sequence_id');
    }
  }, [activeSequenceId]);

  useEffect(() => {
    if (isExportModalOpen && activeSequenceId) {
      setExportSeqId(activeSequenceId);
    }
  }, [isExportModalOpen, activeSequenceId]);

  const handleGenerateBreakdown = async () => {
    const sequence = getActiveSequence();
    if (!sequence || !sequence.script.trim()) return;

    const hasCredits = await deductCredits(7);
    if (!hasCredits) {
      showNotification(t.insufficientCredits, "error");
      return;
    }

    setIsAnalyzing(true);
    const keptActiveSeqId = activeSequenceId;
    try {
      const styleToUse = currentProject?.style === 'Custom' ? currentProject.customStyle || 'Standard' : currentProject?.style || 'Standard';
      const result = await generateShotList(sequence.script, styleToUse);
      const notes = await generateDirectorNotes(sequence.script);
      const updatedSequences = currentProject!.sequences.map(s => s.id === activeSequenceId ? { ...s, shots: result, dpNotes: notes } : s);
      await updateProjectData({ sequences: updatedSequences });
      if (keptActiveSeqId) setActiveSequenceId(keptActiveSeqId);
      setCurrentView(View.BREAKDOWN);
      showNotification("Découpage généré !");
    } catch (e) {
      showNotification("Erreur de génération", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (shotIndex: number) => {
    const seq = getActiveSequence();
    if (!seq || !currentProject) return;

    const hasCredits = await deductCredits(1);
    if (!hasCredits) {
      showNotification(t.insufficientCreditsImage, "error");
      return;
    }

    const shot = seq.shots[shotIndex];
    const key = `${seq.id}-${shotIndex}`;
    setGeneratingImages(prev => ({ ...prev, [key]: true }));
    try {
      const styleToUse = currentProject.style === 'Custom' ? currentProject.customStyle || 'Cinematic' : currentProject.style;
      const prompt = shot.visualPrompt || `${shot.shotType}, ${shot.angle}, ${shot.description}`;
      const imageUrl = await generateShotImage(prompt, styleToUse);
      if (imageUrl) {
        const updatedShots = [...seq.shots];
        updatedShots[shotIndex] = { ...shot, imageUrl };
        updateSequenceData({ shots: updatedShots });
      }
    } finally {
      setGeneratingImages(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveManualShot = () => {
    const seq = getActiveSequence();
    if (!seq) return;
    let updatedShots = [...seq.shots];
    if (editingShotIndex !== null) {
      updatedShots[editingShotIndex] = { ...updatedShots[editingShotIndex], ...manualShot } as Shot;
    } else {
      const newShotId = updatedShots.length > 0 ? Math.max(...updatedShots.map(s => s.id)) + 1 : 1;
      updatedShots.push({
        ...manualShot,
        id: newShotId,
        visualPrompt: manualShot.visualPrompt || `${manualShot.shotType}, ${manualShot.angle}, ${manualShot.axis}, ${manualShot.movement}, ${manualShot.description}`
      } as Shot);
    }
    updateSequenceData({ shots: updatedShots });
    setIsManualModalOpen(false);
    setEditingShotIndex(null);
    setManualShot({ shotType: '', angle: 'Niveau regard', axis: 'Face', movement: 'Fixe', description: '', sound: '', dialogue: '', visualPrompt: '' });
  };



  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      showNotification(t.authError, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProjects([]);
      setCurrentProject(null);
      setCurrentView(View.HOME);
    } catch (e) {
      showNotification("Erreur lors de la déconnexion", "error");
    }
  };

  const handleSavePreset = async () => {
    if (!user || !profile || !currentProject?.customStyle) return;
    const name = prompt(language === 'fr' ? "Nom du preset :" : "Preset name:");
    if (!name) return;

    const newPreset = {
      id: Math.random().toString(36).substr(2, 9),
      label: name,
      vision: currentProject.customStyle
    };

    try {
      const profileRef = doc(db, "users", user.uid);
      const updatedPresets = [...(profile.customPresets || []), newPreset];
      await updateDoc(profileRef, { customPresets: updatedPresets });
      showNotification(language === 'fr' ? "Preset sauvegardé !" : "Preset saved!");
    } catch (e) {
      showNotification("Erreur de sauvegarde", "error");
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!user || !profile) return;
    try {
      const profileRef = doc(db, "users", user.uid);
      const updatedPresets = (profile.customPresets || []).filter(p => p.id !== id);
      await updateDoc(profileRef, { customPresets: updatedPresets });
      showNotification(language === 'fr' ? "Preset supprimé" : "Preset deleted");
    } catch (e) {
      showNotification("Erreur de suppression", "error");
    }
  };

  const chunk = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const handlePdfExport = async () => {
    if (!exportRef.current || !currentProject) return;
    setIsExporting(true);
    showNotification("Génération du PDF...", "success");

    try {
      // 1. Setup Clone Container
      const originalContainer = exportRef.current;
      const cloneContainer = originalContainer.cloneNode(true) as HTMLElement;
      cloneContainer.style.position = 'absolute';
      cloneContainer.style.top = '0';
      cloneContainer.style.left = '0';
      cloneContainer.style.width = '210mm'; // A4 Width
      cloneContainer.style.zIndex = '-9999';
      document.body.appendChild(cloneContainer);

      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render and images

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = Array.from(cloneContainer.querySelectorAll('.pdf-page')) as HTMLElement[];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794, // 210mm in px at 96 DPI
          height: 1123, // 297mm in px at 96 DPI
          windowWidth: 794,
          windowHeight: 1123
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(`ShotLab_${currentProject.name}_${exportFormat}.pdf`);
      showNotification("PDF téléchargé !");

      document.body.removeChild(cloneContainer);

    } catch (e) {
      console.error(e);

      showNotification("Erreur d'exportation", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const renderSidebar = () => (
    <div className="hidden md:flex w-64 bg-[#08080a] border-r border-white/5 flex-col z-20 no-print">
      <div className="h-24 flex items-center px-6"><Logo /></div>
      <nav className="flex-1 px-4 space-y-2">
        {[
          { id: View.DASHBOARD, icon: Layers, label: t.projects },
          { id: View.SCRIPT, icon: Edit3, label: t.script, disabled: !currentProject },
          { id: View.BREAKDOWN, icon: Film, label: t.breakdown, disabled: !currentProject },
          { id: View.STORYBOARD, icon: ImageIcon, label: t.storyboard, disabled: !currentProject },
        ].map(item => (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${item.disabled ? 'opacity-20' : 'hover:bg-white/5'} ${currentView === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-neutral-500'}`}
          >
            <item.icon size={20} className="mr-3" />
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}

        {currentProject && (
          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full flex items-center p-3 rounded-xl text-blue-400 hover:bg-blue-600/10 transition-all border border-transparent hover:border-blue-500/20"
            >
              <Printer size={20} className="mr-3" />
              <span className="font-bold text-sm tracking-tight">{t.export}</span>
            </button>
          </div>
        )}
      </nav>
      <div className="p-6 border-t border-white/5 space-y-4">
        {profile && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{profile.isVip ? "Status VIP" : t.creditsRemaining}</span>
              {profile.isVip ? (
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">ILLIMITÉ</span>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-white leading-none">{profile.credits}</span>
                  <span className="text-[10px] font-bold text-neutral-600 mb-0.5">/ 20</span>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setCurrentView(View.ACCOUNT)}
          className={`flex items-center gap-3 transition-colors text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border ${currentView === View.ACCOUNT
            ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
            : 'text-neutral-500 hover:text-white border-transparent hover:bg-white/5'
            }`}
        >
          <UserIcon size={16} /> {t.settings}
        </button>
      </div>
    </div>
  );

  const renderAccountPage = () => (
    <div className="h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto custom-scrollbar pb-24 p-3 md:p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-3">{t.settings}</h2>
          <p className="text-neutral-500 font-medium text-sm">Gérez vos crédits, votre abonnement et vos préférences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6 md:space-y-8">
          <div className="bg-[#0c0c0e] border border-white/5 p-5 md:p-10 rounded-3xl md:rounded-[3rem] space-y-8 md:space-y-10 shadow-3xl">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-2xl shadow-blue-600/20 shrink-0">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-black text-white truncate">{user?.displayName || user?.email}</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                  {profile?.isVip ? (
                    <span className="text-purple-400 italic">★ {t.vipAccount}</span>
                  ) : (
                    <span>{t.standard}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {!profile?.isVip ? (
                <div className="bg-blue-600/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-blue-500/20">
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 md:mb-3">{t.creditsRemaining}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black text-white">{profile?.credits || 0}</span>
                    <span className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest">Crédits</span>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-600/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-purple-500/20">
                  <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-2 md:mb-3">Statut de compte</p>
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-purple-400 md:size-6" />
                    <span className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">Illimité</span>
                  </div>
                </div>
              )}

              <div className="bg-white/5 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2 md:mb-3">Langue / Language</p>
                <div className="flex gap-2">
                  <button onClick={() => setLanguage('fr')} className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all ${language === 'fr' ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-neutral-500'}`}>FR</button>
                  <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all ${language === 'en' ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-neutral-500'}`}>EN</button>
                </div>
              </div>
            </div>

            {!profile?.isVip && (
              <div className="space-y-8">
                <div className="bg-white/5 h-[1px]" />
                <div className="space-y-4 md:space-y-6">
                  <a
                    href="https://sanslimites.gumroad.com/l/shotlab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 md:gap-4 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-purple-500/30 transition-all font-black text-sm md:text-base border border-white/10 group"
                  >
                    <Sparkles size={18} className="group-hover:scale-110 transition-transform md:size-[22px]" />
                    {t.vip}
                  </a>

                  <div className="space-y-3 pt-2 md:pt-4">
                    <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.activateVip}</label>
                    <div className="flex gap-2 md:gap-3">
                      <input
                        type="password"
                        value={vipCode}
                        onChange={e => setVipCode(e.target.value)}
                        placeholder={t.vipCodePlaceholder}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold focus:border-purple-500 outline-none transition-all placeholder:text-neutral-700 w-full"
                      />
                      <button
                        onClick={handleActivateVip}
                        className="px-6 md:px-8 bg-purple-600 text-white rounded-xl md:rounded-2xl text-sm md:text-base font-black hover:bg-purple-500 transition-all active:scale-95 shadow-xl shadow-purple-900/10 shrink-0"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-white/5">
              <Button onClick={() => setCurrentView(View.TRASH)} variant="secondary" icon={Trash2} className="w-full py-4 md:py-6 rounded-2xl md:rounded-[2rem] text-sm md:text-base font-black">
                {t.trash}
              </Button>
            </div>
          </div>

          {/* User Presets Management */}
          {profile?.customPresets && profile.customPresets.length > 0 && (
            <div className="bg-[#0c0c0e] border border-white/5 p-5 md:p-10 rounded-3xl md:rounded-[3rem] space-y-6 md:shadow-3xl">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">
                <Aperture size={12} /> Mes Presets
              </div>
              <div className="grid grid-cols-1 gap-3">
                {profile.customPresets.map(preset => (
                  <div key={preset.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div>
                      <h4 className="text-sm font-black text-white">{preset.label}</h4>
                      <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[200px] md:max-w-md">{preset.vision}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(language === 'fr' ? 'Supprimer ce preset ?' : 'Delete this preset?')) {
                          handleDeletePreset(preset.id);
                        }
                      }}
                      className="text-neutral-600 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-blue-600/5 border border-blue-500/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] space-y-6 md:space-y-8 h-full flex flex-col justify-between">
            <div className="space-y-6 md:space-y-8">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-600/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-400">
                <Info size={24} className="md:size-[40px]" />
              </div>
              <div>
                <h4 className="text-xl md:text-3xl font-black mb-3 md:mb-4">Besoin d'assistance ?</h4>
                <p className="text-sm md:text-lg text-neutral-400 leading-relaxed font-medium">
                  Notre équipe est là pour vous accompagner dans vos projets de préproduction.
                </p>
              </div>
              <div className="pt-2 md:pt-4">
                <a
                  href="https://wa.me/message/4BTEJPMTE725F1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto bg-white/5 border border-white/10 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-white font-black text-xs md:text-sm flex items-center justify-center md:inline-flex gap-3 hover:bg-white/10 transition-all font-black"
                >
                  Contacter le support <ArrowRight size={16} md:size={18} />
                </a>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 flex flex-col items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
              >
                <LogOut size={14} /> {t.logout}
              </button>
              <div className="flex flex-col items-center gap-1 opacity-50">
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">ShotLab Studio</span>
                <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">v1.1.5 Méliès</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrashPage = () => (
    <div className="h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto custom-scrollbar pb-24 p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-3 text-red-500/80">{t.trash}</h2>
          <p className="text-neutral-500 font-medium text-sm">Restaurez vos projets ou supprimez-les définitivement.</p>
        </div>
        {projects.filter(p => p.isDeleted).length > 0 && (
          <Button onClick={() => {
            setConfirmationModal({
              isOpen: true,
              title: "Vider la corbeille ?",
              message: "Cette action est irréversible. Tous les projets de la corbeille seront supprimés définitivement.",
              onConfirm: async () => {
                const deletedProjects = projects.filter(p => p.isDeleted);
                for (const p of deletedProjects) {
                  await deleteDoc(doc(db, "projects", p.id));
                }
                setConfirmationModal(null);
                showNotification("Corbeille vider", "success");
              }
            });
          }} variant="danger" icon={Trash2} className="px-5 py-2 text-xs rounded-xl">Vider la corbeille</Button>
        )}
      </div>

      {projects.filter(p => p.isDeleted).length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-neutral-600 space-y-4">
          <Trash2 size={48} className="opacity-20" />
          <p className="font-bold text-lg">{t.trashEmpty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => p.isDeleted).map(project => (
            <div key={project.id} className="p-6 bg-[#0c0c0e] border border-red-500/10 rounded-3xl hover:border-red-500/30 transition-all group flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black text-neutral-400 group-hover:text-red-400 transition-colors truncate">{project.name}</h4>
                <div className="flex gap-2">
                  <button onClick={async () => {
                    await updateDoc(doc(db, "projects", project.id), { isDeleted: false, deletedAt: null });
                    showNotification(t.restored, "success");
                  }} className="text-neutral-600 hover:text-green-400 transition-colors p-1" title={t.restore}>
                    <RefreshCw size={18} />
                  </button>
                  <button onClick={() => {
                    setConfirmationModal({
                      isOpen: true,
                      title: t.permanentDelete + " ?",
                      message: "Cette action est irréversible.",
                      onConfirm: async () => {
                        await deleteDoc(doc(db, "projects", project.id));
                        setConfirmationModal(null);
                        showNotification(t.permanentlyDeleted, "success");
                      }
                    });
                  }} className="text-neutral-600 hover:text-red-500 transition-colors p-1" title={t.permanentDelete}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                <span>Supprimé le {new Date(project.deletedAt!).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex w-full bg-[#050505] text-white selection:bg-blue-500/30 print:h-auto print:overflow-visible print:bg-white print:text-black ${user ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {user && renderSidebar()}

      <div className={`flex-1 flex flex-col relative print:h-auto print:overflow-visible ${user ? 'h-full overflow-hidden' : 'w-full'}`}>
        {!user ? (
          <div className="w-full min-h-screen flex flex-col bg-[#050505] relative overflow-x-hidden">
            <div className="relative flex-1 flex flex-col items-center py-12 md:py-24 lg:py-32 p-6 md:p-12 lg:p-20">
              {/* Decorative Background Elements - Larger and softer */}
              <div className="absolute -top-[20%] -left-[20%] w-[100vw] h-[100vw] bg-blue-600/10 rounded-full blur-[15vw] md:blur-[20vw] animate-pulse-slow no-print pointer-events-none" />
              <div className="absolute -bottom-[20%] -right-[20%] w-[100vw] h-[100vw] bg-purple-600/5 rounded-full blur-[15vw] md:blur-[20vw] animate-pulse-slow no-print pointer-events-none" style={{ animationDelay: '2s' }} />

              <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-12 md:space-y-20 animate-in fade-in zoom-in-95 duration-1000">
                <div className="flex flex-col items-center">
                  <div className="mb-8 md:mb-14 transition-transform duration-700 hover:scale-105">
                    <Logo size="lg" />
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[1] mb-6 md:mb-10 max-w-4xl">
                    <span className="text-white">
                      {t.heroTitle}
                    </span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-600">
                      {language === 'fr' ? "intelligent" : "Studio"}
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl lg:text-2xl text-neutral-400 max-w-3xl font-medium leading-relaxed opacity-70 px-4">
                    {t.heroSubtitle}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 w-[85%] max-w-[260px] md:max-w-xs">
                  <button
                    onClick={handleGoogleSignIn}
                    className="group relative w-full py-4 sm:py-5 md:py-6 bg-white text-black rounded-[1rem] sm:rounded-[1.2rem] md:rounded-[1.5rem] font-black text-base sm:text-lg md:text-xl flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] active:scale-95 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Sparkles size={18} className="text-blue-600 group-hover:rotate-12 transition-transform sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="relative z-10">{t.getStarted}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>

                  <div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-neutral-600 opacity-40">
                    <div className="w-12 md:w-20 h-[1px] bg-neutral-800" />
                    ShotLab Studio
                    <div className="w-12 md:w-20 h-[1px] bg-neutral-800" />
                  </div>
                </div>

                <div className="pt-10 sm:pt-14 md:pt-20 flex flex-wrap justify-center gap-8 md:gap-16">
                  <div className="flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Clapperboard size={18} className="text-blue-400 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black tracking-widest text-neutral-500 uppercase">SHOTLIST</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '0.1s' }}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Film size={18} className="text-purple-400 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black tracking-widest text-neutral-500 uppercase">STORYBOARD</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '0.2s' }}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Layers size={18} className="text-indigo-400 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black tracking-widest text-neutral-500 uppercase">UNLIMITED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col p-4 md:p-8 overflow-hidden print:h-auto print:overflow-visible print:p-0">
            {/* Header Mobile UI */}
            <div className="flex justify-between items-center mb-6 no-print md:hidden px-2">
              <Logo />
            </div>

            {/* Mobile Fixed FAB Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-[130] transition-all duration-500 active:scale-90 border backdrop-blur-md ${isMobileMenuOpen
                ? 'bg-white/10 border-white/20 text-white rotate-90'
                : 'bg-blue-600/80 border-blue-400/30 text-white hover:bg-blue-600'
                }`}
            >
              {isMobileMenuOpen ? <X size={28} /> : <MoreVertical size={28} />}
            </button>

            {/* Mobile Glassmorphism Menu List */}
            {isMobileMenuOpen && user && (
              <div className="md:hidden fixed inset-0 z-[120] flex items-end justify-end p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                <div
                  className="w-full max-w-[280px] mb-20 bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl animate-in slide-in-from-bottom-10 slide-in-from-right-10 duration-500 ease-out flex flex-col max-h-[75vh]"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="mb-6 px-2 shrink-0">
                    <Logo />
                  </div>
                  <nav className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2 pb-4">
                    {[
                      { id: View.DASHBOARD, icon: Layers, label: t.projects },
                      { id: View.SCRIPT, icon: Edit3, label: t.script, disabled: !currentProject },
                      { id: View.BREAKDOWN, icon: Film, label: t.breakdown, disabled: !currentProject },
                      { id: View.STORYBOARD, icon: ImageIcon, label: t.storyboard, disabled: !currentProject },
                    ].map(item => (
                      <button
                        key={item.id}
                        disabled={item.disabled}
                        onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl text-sm font-black tracking-tight transition-all ${currentView === item.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-neutral-400 hover:bg-white/5 border border-transparent hover:border-white/5'
                          } ${item.disabled ? 'opacity-20' : ''}`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    ))}

                    {currentProject && (
                      <button
                        onClick={() => { setIsExportModalOpen(true); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl text-sm font-black tracking-tight text-blue-400 border border-blue-500/10 mt-2 hover:bg-blue-500/5 transition-all"
                      >
                        <Printer size={18} />
                        {t.export}
                      </button>
                    )}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
                    <button
                      onClick={() => { setCurrentView(View.ACCOUNT); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl text-sm font-black tracking-tight transition-all ${currentView === View.ACCOUNT
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                      <UserIcon size={18} /> {t.settings}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentView === View.DASHBOARD && (
              <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-3">{t.myProjects}</h2>
                    <p className="text-neutral-500 font-medium text-sm">En route pour une nouvelle création, <span className="text-blue-400 font-bold">{user?.displayName || user?.email?.split('@')[0]}</span> ?</p>
                  </div>
                  <Button onClick={() => setIsNewProjectModalOpen(true)} variant="magic" icon={Plus} className="px-5 py-2 text-xs rounded-xl shadow-none">Nouvelle Production</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10">
                  {projects.filter(p => !p.isDeleted).map(project => (
                    <div key={project.id} onClick={() => { setCurrentProject(project); setActiveSequenceId(project.sequences[0].id); setCurrentView(View.SCRIPT); }} className="p-7 bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col min-h-[220px] relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="text-xl md:text-2xl font-black group-hover:text-blue-400 transition-colors truncate mb-1">{project.name}</h4>
                          {project.pitch && (
                            <p className="text-neutral-500 text-xs font-semibold line-clamp-2 leading-relaxed mb-4">
                              {project.pitch}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setActiveProjectMenuId(activeProjectMenuId === project.id ? null : project.id);
                            }}
                            className="text-neutral-600 hover:text-white transition-colors p-2 bg-white/5 rounded-xl border border-white/5"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeProjectMenuId === project.id && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditingProject(project);
                                  setIsEditProjectModalOpen(true);
                                  setActiveProjectMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-black text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-left"
                              >
                                <Edit3 size={14} /> Modifier
                              </button>
                              <div className="h-px bg-white/5 my-1" />
                              <button
                                onClick={async e => {
                                  e.stopPropagation();
                                  setConfirmationModal({
                                    isOpen: true,
                                    title: "Supprimer ce projet ?",
                                    message: "Le projet sera déplacé dans la corbeille.",
                                    onConfirm: async () => {
                                      await updateDoc(doc(db, "projects", project.id), { isDeleted: true, deletedAt: Date.now() });
                                      setConfirmationModal(null);
                                      showNotification(t.moveToTrash);
                                    }
                                  });
                                  setActiveProjectMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-black text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all text-left"
                              >
                                <Trash2 size={14} /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto relative z-10 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-600">
                        <div className="flex flex-col gap-1.5">
                          <span className="opacity-60">{new Date(project.updatedAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500/70">{project.sequences.length} {project.sequences.length > 1 ? t.sequences : t.sequence}</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-800" />
                            <span className="text-neutral-400">{project.sequences.reduce((acc, s) => acc + s.shots.length, 0)} Plans</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-neutral-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                          <FolderOpen size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Project Modal */}
            {isEditProjectModalOpen && editingProject && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl no-print">
                <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 p-8 rounded-[2rem] space-y-8 shadow-3xl">
                  <h3 className="text-3xl font-black tracking-tight">Modifier</h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <input
                        type="text"
                        defaultValue={editingProject.name}
                        id="edit-project-name"
                        placeholder="Titre du film"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:border-blue-500 transition-all"
                      />
                      <textarea
                        defaultValue={editingProject.pitch || ''}
                        id="edit-project-pitch"
                        placeholder="Pitch du film (optionnel)"
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={() => { setIsEditProjectModalOpen(false); setEditingProject(null); }} variant="secondary" className="flex-1 py-4 rounded-2xl">{t.cancel}</Button>
                      <Button onClick={async () => {
                        const name = (document.getElementById('edit-project-name') as HTMLInputElement).value;
                        const pitch = (document.getElementById('edit-project-pitch') as HTMLTextAreaElement).value;
                        if (!name.trim()) return;
                        try {
                          await updateDoc(doc(db, "projects", editingProject.id), { name, pitch, updatedAt: Date.now() });
                          setIsEditProjectModalOpen(false);
                          setEditingProject(null);
                          showNotification("Projet mis à jour");
                        } catch (e) {
                          showNotification("Erreur de mise à jour", "error");
                        }
                      }} variant="magic" className="flex-1 py-4 rounded-2xl">Enregistrer</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === View.ACCOUNT && renderAccountPage()}
            {currentView === View.TRASH && renderTrashPage()}

            {currentView !== View.DASHBOARD && currentView !== View.ACCOUNT && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Project Toolbar */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3 w-full xl:w-auto">
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-neutral-400 border border-white/10 shrink-0"><ChevronLeft size={20} /></button>
                    <h2 className="text-lg md:text-3xl font-black tracking-tight truncate max-w-[200px] md:max-w-xl">{currentProject?.name}</h2>
                  </div>
                </div>

                {/* Sequence Navigation UI */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar no-print mb-6">
                  {currentProject?.sequences.map(seq => (
                    <div key={seq.id} className="relative group shrink-0">
                      <button
                        onClick={() => setActiveSequenceId(seq.id)}
                        className={`h-11 px-6 rounded-xl border transition-all flex items-center gap-3 ${activeSequenceId === seq.id
                          ? 'bg-white/10 border-blue-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/20'
                          }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.sequence} {seq.number}</span>
                        <div className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${activeSequenceId === seq.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-600'}`}>
                          {seq.shots.length}
                        </div>
                      </button>

                      {currentProject.sequences.length > 1 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setConfirmationModal({
                              isOpen: true,
                              title: `${t.deleteSequence} ?`,
                              message: "Cette action est irréversible. La séquence sera définitivement supprimée.",
                              onConfirm: async () => {
                                const updated = currentProject.sequences.filter(s => s.id !== seq.id)
                                  .map((s, idx) => ({ ...s, number: idx + 1 }));
                                await updateProjectData({ sequences: updated });
                                if (activeSequenceId === seq.id) {
                                  setActiveSequenceId(updated[0].id);
                                }
                                setConfirmationModal(null);
                                showNotification("Séquence supprimée");
                              }
                            });
                          }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => {
                    const n = currentProject!.sequences.length + 1;
                    const ns = { id: Math.random().toString(36).substr(2, 9), number: n, title: `Seq ${n}`, script: "", shots: [], dpNotes: null };
                    updateProjectData({ sequences: [...currentProject!.sequences, ns] });
                    setActiveSequenceId(ns.id);
                  }} className="h-11 px-4 bg-white/5 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-neutral-500 shrink-0 hover:bg-white/10 hover:border-white/30 transition-all">
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden min-h-0 flex flex-col print:h-auto print:overflow-visible">
                  {currentView === View.SCRIPT && (
                    <div className="h-full flex flex-col space-y-4 animate-in slide-in-from-bottom-2 duration-500 overflow-y-auto custom-scrollbar pb-20">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Script : {t.sequence} {getActiveSequence()?.number}</h3>
                        </div>
                      </div>
                      <DebouncedText
                        value={getActiveSequence()?.script || ''}
                        onChange={val => updateSequenceData({ script: val })}
                        placeholder="Collez ou rédigez votre séquence..."
                      />

                      {/* Style Selection Area under Textarea */}
                      <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] ml-1">
                            <Aperture size={12} /> Mise en scène
                          </div>
                          <div className="w-full md:w-80 flex items-center bg-[#121214] border border-white/10 rounded-xl p-1 pr-3">
                            <select
                              value={currentProject?.style}
                              onChange={e => {
                                const selectedStyle = e.target.value;
                                if (selectedStyle === 'Standard' || selectedStyle === 'Custom') {
                                  updateProjectData({ style: selectedStyle });
                                } else {
                                  const preset = profile?.customPresets?.find(p => p.id === selectedStyle);
                                  if (preset) {
                                    // Store the preset ID as the style, but keep the vision string for generation
                                    updateProjectData({ style: selectedStyle, customStyle: preset.vision });
                                  }
                                }
                              }}
                              className="bg-transparent text-white text-xs font-black outline-none px-4 py-3 flex-1 appearance-none"
                            >
                              {STYLES_LIST.map(s => <option key={s.id} value={s.id} className="bg-[#121214]">{s.label}</option>)}
                              {profile?.customPresets?.map(p => <option key={p.id} value={p.id} className="bg-[#121214]">{p.label}</option>)}
                            </select>
                            <ChevronDown size={16} className="text-neutral-500 shrink-0" />
                          </div>
                        </div>

                        {currentProject?.style === 'Custom' && (
                          <div className="flex-[2] w-full space-y-2">
                            <div className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] ml-1 flex justify-between items-center">
                              Vision artistique
                              {currentProject.customStyle && (
                                <button onClick={handleSavePreset} className="text-blue-400 hover:text-blue-300 transition-colors lowercase font-bold tracking-normal flex items-center gap-1">
                                  <Plus size={10} /> {language === 'fr' ? 'Sauvegarder en preset' : 'Save as preset'}
                                </button>
                              )}
                            </div>
                            <DebouncedInput
                              placeholder={t.customStylePlaceholder}
                              value={currentProject.customStyle || ''}
                              onChange={val => updateProjectData({ customStyle: val })}
                              className="w-full bg-[#121214] border border-white/10 rounded-xl px-6 py-4 text-xs font-bold focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center pt-2">
                        <Button onClick={handleGenerateBreakdown} loading={isAnalyzing} variant="magic" icon={Wand2} className="px-10 py-5 text-base rounded-2xl w-full md:w-auto">
                          {t.generate}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentView === View.BREAKDOWN && (
                    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pb-20 animate-in slide-in-from-bottom-2 duration-500 print:h-auto print:overflow-visible print:pb-0">
                      {!getActiveSequence()?.shots.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 animate-in fade-in zoom-in-95 duration-700">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                            <Film size={32} className="text-neutral-700 sm:size-[36px]" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black mb-3">{t.noShots}</h3>
                          <p className="text-neutral-500 max-w-sm mx-auto mb-8 sm:mb-10 text-xs sm:text-sm font-medium leading-relaxed px-4">
                            {t.noShotsGuide}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-6 sm:px-0">
                            <Button variant="magic" icon={Wand2} onClick={() => setCurrentView(View.SCRIPT)} className="w-full sm:w-auto px-8 rounded-2xl py-4">{t.generateViaScript}</Button>
                            <Button variant="secondary" icon={Plus} onClick={() => setIsManualModalOpen(true)} className="w-full sm:w-auto px-8 rounded-2xl py-4">{t.addManually}</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-600/5 border border-blue-500/10 p-5 rounded-2xl">
                              <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase mb-2"><Lightbulb size={16} /> Éclairage</div>
                              <p className="text-xs text-neutral-400 leading-relaxed font-medium">{getActiveSequence()?.dpNotes?.lighting}</p>
                            </div>
                            <div className="bg-purple-600/5 border border-purple-500/10 p-5 rounded-2xl">
                              <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase mb-2"><Palette size={16} /> Ambiance</div>
                              <p className="text-xs text-neutral-400 leading-relaxed font-medium">{getActiveSequence()?.dpNotes?.colors}</p>
                            </div>
                            <div className="bg-orange-600/5 border border-orange-500/10 p-5 rounded-2xl">
                              <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase mb-2"><Music size={16} /> Sonore</div>
                              <p className="text-xs text-neutral-400 leading-relaxed font-medium">{getActiveSequence()?.dpNotes?.sound}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {getActiveSequence()?.shots.map((shot, idx) => (
                              <div key={idx} className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-6 relative group transition-all hover:border-blue-500/30 shadow-xl overflow-hidden">
                                <div className="flex md:flex-col items-center justify-center bg-[#121214] rounded-2xl w-full md:w-24 h-12 md:h-24 shrink-0 border border-white/5 gap-2 md:gap-0">
                                  <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest">Plan</span>
                                  <span className="text-xl md:text-3xl font-black">{getActiveSequence()?.number}.{shot.id}</span>
                                </div>
                                <div className="flex-1 space-y-5">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge color="blue" icon={Maximize2}>{shot.shotType}</Badge>
                                    <Badge color="purple" icon={Move}>{shot.angle}</Badge>
                                    <Badge color="orange" icon={Compass}>{shot.axis}</Badge>
                                    <Badge color="pink" icon={Video}>{shot.movement}</Badge>
                                  </div>
                                  <p className="text-sm md:text-base text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 font-medium">{shot.description}</p>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="text-xs italic text-neutral-500 bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-3">
                                      <Mic size={16} className="shrink-0 text-orange-400" />
                                      <span>{shot.sound || "Ambiance standard"}</span>
                                    </div>
                                    {shot.dialogue && (
                                      <div className="text-xs text-blue-400 font-bold bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex gap-3">
                                        <MessageSquare size={16} className="shrink-0" />
                                        <span>{shot.dialogue}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                  <button onClick={() => { setManualShot(shot); setEditingShotIndex(idx); setIsManualModalOpen(true); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"><Edit3 size={18} /></button>
                                  <button onClick={() => { const ns = [...getActiveSequence()!.shots]; ns.splice(idx, 1); updateSequenceData({ shots: ns }); }} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/10"><Trash2 size={18} /></button>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-center pt-8 no-print">
                              <Button onClick={() => setIsManualModalOpen(true)} variant="secondary" icon={Plus} className="px-12 py-5 text-base rounded-2xl">Ajouter un plan</Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {currentView === View.STORYBOARD && (
                    <div className="h-full overflow-y-auto custom-scrollbar pb-20 animate-in slide-in-from-bottom-2 duration-500 print:h-auto print:overflow-visible print:pb-0">
                      {!getActiveSequence()?.shots.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 animate-in fade-in zoom-in-95 duration-700">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                            <ImageIcon size={32} className="text-neutral-700 sm:size-[36px]" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black mb-3">{t.storyboardEmpty}</h3>
                          <p className="text-neutral-500 max-w-sm mx-auto mb-8 sm:mb-10 text-xs sm:text-sm font-medium leading-relaxed px-4">
                            {t.storyboardEmptyGuide}
                          </p>
                          <div className="w-full sm:w-auto px-6 sm:px-0">
                            <Button variant="magic" icon={Film} onClick={() => setCurrentView(View.BREAKDOWN)} className="w-full sm:w-auto px-10 rounded-2xl py-4">Aller au Découpage</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {getActiveSequence()?.shots.map((shot, idx) => (
                            <div key={idx} className="bg-[#0c0c0e] border border-white/5 rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                              <div className="aspect-video bg-black flex items-center justify-center relative">
                                {shot.imageUrl ? (
                                  <>
                                    <img src={shot.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                      <button onClick={() => handleGenerateImage(idx)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-xl transition-all active:scale-90"><RefreshCw size={24} /></button>
                                    </div>
                                  </>
                                ) : (
                                  <Button onClick={() => handleGenerateImage(idx)} variant="secondary" loading={generatingImages[`${getActiveSequence()!.id}-${idx}`]} className="px-8 rounded-xl">Visualiser</Button>
                                )}
                                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black border border-white/10 tracking-widest text-white/90">#{getActiveSequence()?.number}.{shot.id}</span>
                              </div>
                              <div className="p-5">
                                <h4 className="text-sm font-black text-blue-400 mb-2 truncate">{shot.shotType}</h4>
                                <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed font-medium">{shot.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Shot Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl no-print">
          <div className="w-full max-w-2xl bg-[#0c0c0e] border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-3xl space-y-8 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">{editingShotIndex !== null ? t.edit : t.add} un Plan</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-neutral-500 hover:text-white transition-all"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.shotType}</label>
                <select value={manualShot.shotType} onChange={e => setManualShot({ ...manualShot, shotType: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold">
                  <option value="" disabled>Cadrage technique...</option>
                  {SHOT_TYPES.map(s => <option key={s} value={s} className="bg-[#121214]">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.angle}</label>
                <select value={manualShot.angle} onChange={e => setManualShot({ ...manualShot, angle: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold">
                  {ANGLES.map(s => <option key={s} value={s} className="bg-[#121214]">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.axis}</label>
                <select value={manualShot.axis} onChange={e => setManualShot({ ...manualShot, axis: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold">
                  {AXES.map(s => <option key={s} value={s} className="bg-[#121214]">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.movement}</label>
                <select value={manualShot.movement} onChange={e => setManualShot({ ...manualShot, movement: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold">
                  {MOVEMENTS.map(s => <option key={s} value={s} className="bg-[#121214]">{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.sound}</label>
                <input type="text" value={manualShot.sound} onChange={e => setManualShot({ ...manualShot, sound: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold" placeholder="Effets sonores, musique..." />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.dialogue}</label>
                <input type="text" value={manualShot.dialogue} onChange={e => setManualShot({ ...manualShot, dialogue: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold" placeholder="Réplique prononcée..." />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.description}</label>
                <textarea value={manualShot.description} onChange={e => setManualShot({ ...manualShot, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-medium min-h-[120px] resize-none" placeholder="Action visuelle précise..." />
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button onClick={() => setIsManualModalOpen(false)} variant="secondary" className="flex-1 py-4 rounded-2xl text-base">{t.cancel}</Button>
              <Button onClick={handleSaveManualShot} variant="primary" className="flex-1 py-4 rounded-2xl text-base">{t.save}</Button>
            </div>
          </div>
        </div>
      )}



      {/* Export UI */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl no-print">
          <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 p-8 rounded-[2rem] space-y-8 shadow-3xl">
            <h3 className="text-3xl font-black flex items-center gap-4"><Printer size={24} className="text-blue-400" /> {t.export}</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.selectFormat}</label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button onClick={() => setExportFormat('breakdown')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${exportFormat === 'breakdown' ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>{t.breakdown}</button>
                  <button onClick={() => setExportFormat('storyboard')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${exportFormat === 'storyboard' ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>{t.storyboard}</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest ml-1">{t.selectSequence}</label>
                <select value={exportSeqId} onChange={e => setExportSeqId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold outline-none">
                  {currentProject?.sequences.map(s => <option key={s.id} value={s.id} className="bg-[#121214]">{t.sequence} {s.number} ({s.shots.length} plans)</option>)}
                </select>
              </div>
              <Button onClick={handlePdfExport} variant="primary" className="w-full py-5 rounded-2xl text-base" icon={FileDown} loading={isExporting}>
                {isExporting ? "Génération..." : t.printExport}
              </Button>
              <Button onClick={() => setIsExportModalOpen(false)} variant="secondary" className="w-full rounded-2xl">{t.cancel}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl no-print">
          <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 p-8 rounded-[2rem] space-y-8 shadow-3xl">
            <h3 className="text-3xl font-black tracking-tight">{t.newProduction}</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Titre du film"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:border-blue-500 transition-all"
                />
                <textarea
                  value={newProjectPitch}
                  onChange={e => setNewProjectPitch(e.target.value)}
                  placeholder="Pitch du film (optionnel)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={() => { setIsNewProjectModalOpen(false); setNewProjectPitch(''); setNewProjectName(''); }} variant="secondary" className="flex-1 py-4 rounded-2xl">{t.cancel}</Button>
                <Button onClick={async () => {
                  if (!newProjectName.trim() || !user) return;
                  const newProject = {
                    name: newProjectName,
                    pitch: newProjectPitch,
                    style: 'Standard',
                    updatedAt: Date.now(),
                    ownerId: user.uid,
                    sequences: [{ id: Math.random().toString(36).substr(2, 9), number: 1, title: 'Seq 1', script: '', shots: [], dpNotes: null }]
                  };
                  try {
                    const docRef = await addDoc(collection(db, "projects"), newProject);
                    const projectWithId = { ...newProject, id: docRef.id };
                    setCurrentProject(projectWithId);
                    setActiveSequenceId(projectWithId.sequences[0].id);
                    setCurrentView(View.SCRIPT);
                    setIsNewProjectModalOpen(false);
                    setNewProjectName('');
                    setNewProjectPitch('');
                  } catch (e) {
                    showNotification("Erreur de création", "error");
                  }
                }} variant="magic" className="flex-1 py-4 rounded-2xl">{t.createProject}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal && confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl no-print">
          <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 p-8 rounded-[2rem] space-y-6 shadow-3xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">{confirmationModal.title}</h3>
              <p className="text-neutral-400 font-medium text-sm">{confirmationModal.message}</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setConfirmationModal(null)} variant="secondary" className="flex-1 py-4 rounded-xl">Annuler</Button>
              <Button onClick={confirmationModal.onConfirm} variant="danger" className="flex-1 py-4 rounded-xl">Confirmer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Pagination Export Layout */}
      <div className="fixed top-[-10000px] left-[-10000px]" ref={exportRef}>
        {currentProject?.sequences
          .filter(s => s.id === exportSeqId)
          .map((seq: any) => {
            const shots = seq.shots;
            // Chunk shots into pages
            // If Storyboard: 4 items per page
            // If Breakdown: 2 items per page
            const itemsPerPage = exportFormat === 'storyboard' ? 4 : 2;
            const shotChunks = chunk(shots, itemsPerPage);

            return shotChunks.map((chunkShots: any[], pageIdx) => (
              <div key={`${seq.id}-page-${pageIdx}`} className="pdf-page bg-white relative overflow-hidden" style={{ width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box' }}>
                {/* PDF Header - Repeated on Every Page */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200 h-[30mm]">
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter mb-1 text-black">ShotLab Studio</h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">{currentProject?.name} • {t.sequence} {seq.number} • Page {pageIdx + 1}/{shotChunks.length}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-neutral-400">
                      {exportFormat === 'breakdown' ? <Film size={14} /> : <ImageIcon size={14} />}
                      <p className="text-[10px] font-black uppercase tracking-widest">{exportFormat}</p>
                    </div>
                    <p className="text-sm font-black text-blue-600">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Content Area */}
                <div className="h-[235mm]">
                  {exportFormat === 'breakdown' ? (
                    <div className="space-y-4">
                      {(chunkShots as any[]).map((shot: any, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 flex gap-8 pdf-card break-inside-avoid shadow-sm h-[110mm] overflow-hidden">
                          <div className="w-32 h-32 bg-neutral-200 rounded-2xl flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Plan</span>
                            <span className="text-4xl font-black text-neutral-800">{seq.number}.{shot.id}</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-lg">{shot.shotType}</span>
                              <span className="text-xs font-bold bg-purple-100 text-purple-600 px-3 py-1 rounded-lg">{shot.angle}</span>
                              <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-lg">{shot.axis}</span>
                              <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-lg">{shot.movement}</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-neutral-600 mb-6 line-clamp-6">{shot.description}</p>
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2 text-xs text-neutral-500 truncate bg-white px-4 py-2 rounded-lg border border-neutral-100">
                                <Mic size={14} className="shrink-0" /> {shot.sound || "-"}
                              </div>
                              {shot.dialogue && (
                                <div className="flex items-center gap-2 text-xs text-blue-500 font-bold truncate bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                  <MessageSquare size={14} className="shrink-0" /> {shot.dialogue}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6 h-full content-start">
                      {(chunkShots as any[]).map((shot: any, idx) => (
                        <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[112mm]">
                          <div className="w-full aspect-video bg-neutral-100 flex items-center justify-center relative border-b border-neutral-200 overflow-hidden shrink-0">
                            {shot.imageUrl ? (
                              <img src={shot.imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-neutral-300">
                                <ImageIcon size={32} />
                                <span className="text-[10px] font-bold">No Image</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white border border-white/10 shadow-lg z-10">#{seq.number}.{shot.id}</div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col space-y-2 min-h-0 bg-white">
                            <div className="flex flex-wrap gap-1.5 shrink-0">
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">{shot.shotType}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100">{shot.angle}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">{shot.movement}</span>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                              <p className="text-[9px] font-medium leading-relaxed text-neutral-600 absolute inset-0 overflow-hidden">{shot.description}</p>
                            </div>
                            <div className="mt-auto pt-2 border-t border-neutral-100 flex flex-col gap-1 shrink-0">
                              {/* Dialogue and Sound removed for Storyboard as requested */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-center border-t border-neutral-100">
                  <p className="text-[8px] font-black text-neutral-300 uppercase tracking-[0.5em]">ShotLab Intelligent Studio</p>
                </div>
              </div>
            ));
          })}
      </div>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5">
          <div className={`px-8 py-3 rounded-full shadow-2xl backdrop-blur-3xl border text-[11px] font-black uppercase tracking-widest ${notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-blue-600/20 border-blue-500/50 text-blue-100'}`}>
            {notification.message}
          </div>
        </div>
      )}
      {updateAvailable && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all border border-blue-400/30"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Une mise à jour est disponible ! Cliquez pour rafraîchir
          </button>
        </div>
      )}
    </div>
  );
}
