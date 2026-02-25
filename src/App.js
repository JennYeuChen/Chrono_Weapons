import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Edit3,
  Clock, 
  RefreshCw,
  AlertTriangle,
  Plus,
  ArrowLeft,
  ChevronRight,
  Database
} from 'lucide-react';

// --- 視覺定義 ---
const UI_THEME = {
  bg: 'bg-[#050505]',
  surface: 'bg-[#111111]',
  accent: 'text-[#ffcc00]',
  accentBg: 'bg-[#ffcc00]',
  border: 'border-[#ffcc00]/20',
  text: 'text-white',
  rounded: 'rounded-2xl' 
};

// --- 文字亂碼動畫 ---
const useGlitchText = (text, trigger) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*@$";
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/3;
    }, 25);
    return () => clearInterval(interval);
  }, [text, trigger]);
  
  return displayText;
};

// --- 子項目組件 ---
const SortableItem = ({ id, item, onDelete, onEdit }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id });
  
  const glitchTitle = useGlitchText(item.title, item.id);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 300);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
    position: 'relative'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border ${UI_THEME.border} mb-2 ${UI_THEME.surface} p-5 flex items-center gap-6 overflow-hidden transition-all duration-300
        ${isDeleting ? 'animate-item-delete' : 'hover:bg-[#1a1a1a] hover:border-[#ffcc00]/50'} 
        ${UI_THEME.rounded}`}
    >
      <div className="flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 touch-none">
          <GripVertical size={16} className="text-[#ffcc00]" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`text-[9px] text-black font-black ${UI_THEME.accentBg} px-1.5 py-0.5 rounded`}>
            {String((item.index || 0) + 1).padStart(2, '0')}
          </span>
          <h3 className="font-bold text-white truncate text-xs tracking-widest uppercase">
            {glitchTitle}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-[#ffcc00]/40 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock size={10} /> {item.hours || '0'}H {item.minutes || '0'}M</span>
          <span className="opacity-30">|</span>
          <span className="text-[7px]">ID: {id}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button onClick={() => onEdit(item)} className="p-2.5 border border-[#ffcc00]/10 hover:bg-[#ffcc00] hover:text-black transition-all rounded-xl">
          <Edit3 size={14} />
        </button>
        <button onClick={handleDelete} className="p-2.5 border border-red-900/20 hover:bg-red-600 transition-all rounded-xl">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
const [schedules, setSchedules] = useState(() => {
  const saved = localStorage.getItem('CHRONO_DATA');
  return saved ? JSON.parse(saved) : [
    { id: 'S1', name: 'TACTICAL_OPS_2024', items: [
      { id: '401', title: 'SYSTEM_BOOT_SEQUENCE', hours: '0', minutes: '45' },
      { id: '402', title: 'FIELD_SURVEY_ALPHA', hours: '2', minutes: '30' }
    ]},
    { id: 'S2', name: 'CORE_DATA_RECOVERY', items: [] }
  ];
});
  
  // --- 視圖與數據狀態 ---
  const [currentView, setCurrentView] = useState('HOME');
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newItem, setNewItem] = useState({ title: '', hours: '', minutes: '' });
  const [activeId, setActiveId] = useState(null);

  // --- 彈窗動畫狀態 (這裡保持唯一即可) ---
  const [editingObject, setEditingObject] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false); // 新增的這一行

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

// 在 App 組件內的 useEffect 區塊添加：
useEffect(() => {
  localStorage.setItem('CHRONO_DATA', JSON.stringify(schedules));
  // 為了符合你的視覺風格，你甚至可以在這裡觸發一個「數據寫入」的小動畫
  console.log("DATABASE_SYNC_COMPLETE");
}, [schedules]);
  
useEffect(() => {
  if (editingObject) {
    setIsModalMounted(true); 
    const timer = setTimeout(() => setShowModalContent(true), 150);
    return () => clearTimeout(timer);
  } else {
    // 當 editingObject 為 null 時，確保所有動畫狀態回到初始值
    setShowModalContent(false);
    setIsModalMounted(false);
  }
}, [editingObject]);

const closeModal = () => {
  setIsClosingModal(true);
  setIsModalMounted(false); // 讓背景開始淡出
  
  setTimeout(() => {
    setEditingObject(null);
    setIsClosingModal(false);
  }, 400); 
};

  const changeView = (view, id = null) => {
    setIsChangingPage(true);
    setTimeout(() => {
      setCurrentView(view);
      setActiveScheduleId(id);
      setIsChangingPage(false);
    }, 400);
  };

  const addSchedule = (e) => {
    e.preventDefault();
    if (!newScheduleName.trim()) return;
    const newId = `S${Math.random().toString(36).substr(2, 4)}`;
    setSchedules(prev => [...prev, { id: newId, name: newScheduleName.toUpperCase(), items: [] }]);
    setNewScheduleName('');
  };

  const deleteSchedule = (e, id) => {
    e.stopPropagation();
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const currentSchedule = schedules.find(s => s.id === activeScheduleId);

  const updateCurrentItems = (newItems) => {
    setSchedules(prev => prev.map(s => s.id === activeScheduleId ? { ...s, items: newItems } : s));
  };

  const deleteItem = (itemId) => {
    if (!activeScheduleId) return;
    updateCurrentItems(currentSchedule.items.filter(i => i.id !== itemId));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentSchedule.items.findIndex((i) => i.id === active.id);
      const newIndex = currentSchedule.items.findIndex((i) => i.id === over.id);
      updateCurrentItems(arrayMove(currentSchedule.items, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    const itemWithId = { 
      ...newItem, 
      id: Math.random().toString(36).substr(2, 4),
      hours: newItem.hours || '0',
      minutes: newItem.minutes || '0'
    };
    updateCurrentItems([...(currentSchedule?.items || []), itemWithId]);
    setNewItem({ title: '', hours: '', minutes: '' });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (editingObject.type === 'schedule') {
      const updatedName = formData.get('name')?.toUpperCase();
      setSchedules(prev => prev.map(s => s.id === editingObject.data.id ? { ...s, name: updatedName } : s));
    } else {
      const updatedTitle = formData.get('title')?.toUpperCase();
      const updatedHours = formData.get('hours');
      const updatedMinutes = formData.get('minutes');
      updateCurrentItems(currentSchedule.items.map(item => 
        item.id === editingObject.data.id ? { ...item, title: updatedTitle, hours: updatedHours, minutes: updatedMinutes } : item
      ));
    }
    closeModal();
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.3',
        },
      },
    }),
  };

  return (
    <div className={`min-h-screen ${UI_THEME.bg} text-white font-mono p-6 md:p-20 relative overflow-x-hidden flex flex-col items-center selection:bg-[#ffcc00] selection:text-black`}>
      
      {/* 全域背景特效 */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,204,0,0.02)_50%,transparent_100%)] bg-[length:100%_4px] animate-vhs-scan"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
      </div>

      <div className={`w-full max-w-2xl relative z-10 transition-all duration-500 ${isChangingPage ? 'animate-page-exit' : 'animate-page-enter'}`}>
        
        {currentView === 'HOME' && (
          <div key="home-view">
            <header className="mb-20 border-b-2 border-[#ffcc00] pb-10 flex justify-between items-end">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <RefreshCw size={12} className="animate-spin text-[#ffcc00]/60" />
                  <span className="text-[9px] font-bold tracking-[0.5em] text-[#ffcc00]/40 uppercase">System_Active</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-[#ffcc00] tracking-tighter uppercase italic leading-none hover:skew-x-2 transition-transform cursor-crosshair">
                  CHRONO<br/>WEAPONS
                </h1>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono opacity-20 block mb-2">AUTH_TOKEN: 0xFF-992</span>
                <div className="bg-[#ffcc00] text-black text-[8px] font-black px-2 py-0.5 inline-block">V5.2_STABLE</div>
              </div>
            </header>

            <form onSubmit={addSchedule} className="mb-12 flex gap-3">
              <div className="flex-1 bg-[#ffcc00]/5 border border-[#ffcc00]/20 rounded-xl p-1 flex items-center px-5">
                <Plus size={14} className="text-[#ffcc00]/40 mr-4" />
                <input 
                  className="bg-transparent w-full outline-none text-[11px] font-bold uppercase tracking-widest placeholder:text-[#ffcc00]/10 py-4"
                  placeholder="INPUT_NEW_PROTOCOL..."
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-[#ffcc00] text-black px-8 py-4 rounded-xl text-[10px] font-black hover:bg-white transition-all active:scale-95 shadow-[0_0_30px_rgba(255,204,0,0.1)]">
                INIT_CORE
              </button>
            </form>

            <div className="space-y-3">
              <div className="text-[10px] text-[#ffcc00]/40 font-bold tracking-[0.3em] mb-6 flex items-center gap-2">
                <Database size={10} /> ACCESS_POINTS ({schedules.length})
              </div>
              {schedules.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => changeView('DETAIL', s.id)}
                  className="group bg-[#0d0d0d] border border-[#ffcc00]/10 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#ffcc00] hover:bg-[#151515] transition-all duration-300 relative overflow-hidden hover:translate-x-1"
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <h2 className="text-sm font-black tracking-[0.2em] group-hover:text-[#ffcc00] transition-colors uppercase">{s.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] text-[#ffcc00]/30 uppercase font-bold tracking-widest">Stack: {s.items.length} units</span>
                        <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ffcc00]/30 transition-all duration-1000" style={{ width: `${Math.min(s.items.length * 10, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingObject({ type: 'schedule', data: s }); }}
                      className="p-3 text-white/20 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10 rounded-xl transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteSchedule(e, s.id)}
                      className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-[#ffcc00]/20 group-hover:translate-x-1 transition-transform ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'DETAIL' && currentSchedule && (
          <div key="detail-view">
            <nav className="mb-12 flex justify-between items-center">
              <button 
                onClick={() => changeView('HOME')}
                className="flex items-center gap-3 text-[10px] font-black text-[#ffcc00]/40 hover:text-[#ffcc00] transition-all uppercase tracking-widest group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to command
              </button>
              <div className="text-[8px] bg-[#ffcc00]/10 text-[#ffcc00] px-4 py-1.5 rounded-full border border-[#ffcc00]/20 font-black">
                NODE_SECURE: {currentSchedule.id}
              </div>
            </nav>

            <header className="mb-12">
              <div className="flex items-end justify-between border-b border-[#ffcc00]/10 pb-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#ffcc00] opacity-30 uppercase tracking-[0.5em]">Protocol_Active</span>
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white">{currentSchedule.name}</h2>
                    <button 
                      onClick={() => setEditingObject({ type: 'schedule', data: currentSchedule })}
                      className="p-3 text-[#ffcc00]/30 hover:text-[#ffcc00] transition-colors bg-white/5 rounded-xl"
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div className="mb-12">
              <form onSubmit={addItem} className={`flex flex-col gap-2 bg-[#ffcc00]/5 p-2 border border-[#ffcc00]/20 backdrop-blur-md ${UI_THEME.rounded}`}>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className={`flex-1 bg-black flex items-center px-6 py-5 ${UI_THEME.rounded}`}>
                    <span className="text-[#ffcc00]/20 mr-4 text-xs font-black">{`>>`}</span>
                    <input
                      type="text"
                      placeholder="COMMAND_INPUT..."
                      className="w-full bg-transparent font-bold text-white placeholder:text-[#ffcc00]/10 outline-none text-[11px] tracking-widest uppercase"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                  </div>
                  <div className={`bg-black flex items-center justify-center px-6 py-5 ${UI_THEME.rounded} gap-4`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="hide-spinner w-8 bg-transparent text-[11px] font-mono text-white outline-none text-center font-bold"
                        value={newItem.hours}
                        onChange={(e) => setNewItem({ ...newItem, hours: e.target.value })}
                        placeholder="0"
                      />
                      <span className="text-[9px] text-[#ffcc00]/40 font-black">H</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                      <input
                        type="number"
                        className="hide-spinner w-8 bg-transparent text-[11px] font-mono text-white outline-none text-center font-bold"
                        value={newItem.minutes}
                        onChange={(e) => setNewItem({ ...newItem, minutes: e.target.value })}
                        placeholder="00"
                      />
                      <span className="text-[9px] text-[#ffcc00]/40 font-black">M</span>
                    </div>
                  </div>
                </div>
                <button type="submit" className={`bg-[#ffcc00] hover:bg-white text-black w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 ${UI_THEME.rounded}`}>
                  EXEC_INIT_SEQUENCE
                </button>
              </form>
            </div>

            <div className="min-h-[400px]">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={currentSchedule.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {currentSchedule.items.map((item, index) => (
                      <SortableItem 
                        key={item.id} 
                        id={item.id} 
                        item={{ ...item, index }} 
                        onDelete={deleteItem} 
                        onEdit={(it) => setEditingObject({ type: 'item', data: it })} 
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={dropAnimationConfig}>
                  {activeId ? (
                    <div className={`bg-[#ffcc00] p-6 border-2 border-white shadow-[0_10px_40px_rgba(255,204,0,0.6)] ${UI_THEME.rounded} cursor-grabbing scale-105 transition-transform`}>
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-black/40" />
                        <h3 className="font-black text-black uppercase tracking-widest text-xs">REPOSITIONING: {activeId}</h3>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              {currentSchedule.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#ffcc00]/5 rounded-3xl opacity-20">
                  <Database size={40} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command Input</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mt-24 border-t border-[#ffcc00]/10 pt-10 flex justify-between items-center opacity-30">
          <div className="text-[10px] font-black tracking-[0.3em] text-[#ffcc00] uppercase flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-[#ffcc00] animate-pulse rounded-full"></div>
            CORE_CLOCK: {Math.floor(performance.now()/1000)}s
          </div>
          <div className="text-[8px] text-[#ffcc00] flex gap-6 uppercase font-black">
            <span>SECURE_SHELL</span>
            <span>ENCRYPTED</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vhs-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        
        @keyframes crt-power-on {
          0% { transform: scaleY(0.005) scaleX(0); opacity: 0; background: #ffcc00; filter: brightness(3); }
          30% { transform: scaleY(0.005) scaleX(1.05); opacity: 1; }
          100% { transform: scaleY(1) scaleX(1); opacity: 1; }
        }
        @keyframes crt-power-off {
          0% { transform: scaleY(1) scaleX(1); opacity: 1; }
          40% { transform: scaleY(0.005) scaleX(1.05); opacity: 1; background: #ffcc00; }
          100% { transform: scaleY(0.005) scaleX(0); opacity: 0; }
        }

        @keyframes page-enter {
          0% { transform: translateX(30px); opacity: 0; filter: brightness(1.5) blur(5px); }
          100% { transform: translateX(0); opacity: 1; filter: none; }
        }
        @keyframes page-exit {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-30px); opacity: 0; filter: blur(5px); }
        }

        @keyframes item-delete {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; filter: blur(5px); }
        }
        
        @keyframes content-fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .hide-spinner::-webkit-outer-spin-button, 
        .hide-spinner::-webkit-inner-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .hide-spinner {
          -moz-appearance: textfield;
          appearance: textfield;
        }

        .animate-vhs-scan { animation: vhs-scan 12s linear infinite; }
        .animate-page-enter { animation: page-enter 0.5s cubic-bezier(0.2, 0, 0, 1) forwards; }
        .animate-page-exit { animation: page-exit 0.4s cubic-bezier(0.2, 0, 0, 1) forwards; }
        .animate-crt-power-on { animation: crt-power-on 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-crt-power-off { animation: crt-power-off 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-item-delete { animation: item-delete 0.3s cubic-bezier(0.2, 0, 0, 1) forwards; }
        .animate-content-show { animation: content-fade-in 0.3s cubic-bezier(0.2, 0, 0, 1) forwards; }
      `}} />

{/* --- 通用編輯彈窗 --- */}
{editingObject && (
  <div 
    className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-700
      ${(!isModalMounted || isClosingModal) ? 'backdrop-blur-none bg-black/0' : 'backdrop-blur-md bg-black/60'}`}
  >
    {/* 這裡面的 form 內容不變 */}
          <form 
            onSubmit={saveEdit}
            className={`relative bg-[#0d0d0d] border border-[#ffcc00]/40 w-full max-w-sm overflow-hidden
            ${isClosingModal ? 'animate-crt-power-off' : 'animate-crt-power-on'} 
            ${UI_THEME.rounded} shadow-[0_20px_100px_rgba(0,0,0,0.5)]`}
          >
            <div className={`p-8 md:p-10 transition-opacity duration-300 ${showModalContent && !isClosingModal ? 'animate-content-show' : 'opacity-0'}`}>
              <h2 className="text-[10px] font-black mb-10 border-b border-[#ffcc00]/20 pb-5 uppercase tracking-[0.4em] text-[#ffcc00] flex items-center justify-between">
                <span className="flex items-center gap-3"><AlertTriangle size={14} /> MOD_OVERRIDE</span>
                <span className="text-[8px] opacity-30 font-mono">REF_{editingObject.data.id}</span>
              </h2>

              <div className="space-y-8 mb-12">
                {editingObject.type === 'schedule' ? (
                  <div className="space-y-3">
                    <label className="text-[8px] text-[#ffcc00]/40 ml-1 font-black tracking-[0.3em] uppercase">Protocol_Identifier</label>
                    <input 
                      name="name"
                      autoFocus
                      autoComplete="off"
                      defaultValue={editingObject.data.name} 
                      className={`w-full bg-black border border-[#ffcc00]/20 p-5 text-[11px] font-bold outline-none focus:border-[#ffcc00] text-[#ffcc00] ${UI_THEME.rounded} tracking-widest uppercase transition-all`} 
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-[8px] text-[#ffcc00]/40 ml-1 font-black tracking-[0.3em] uppercase">Objective_Tag</label>
                      <input 
                        name="title"
                        autoFocus
                        autoComplete="off"
                        defaultValue={editingObject.data.title} 
                        className={`w-full bg-black border border-[#ffcc00]/20 p-5 text-[11px] font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded} tracking-widest uppercase transition-all`} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[8px] text-[#ffcc00]/40 ml-1 font-black tracking-[0.3em] uppercase">Hrs</label>
                        <input 
                          name="hours"
                          type="number"
                          defaultValue={editingObject.data.hours} 
                          className={`hide-spinner w-full bg-black border border-[#ffcc00]/20 p-5 text-[11px] font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded} transition-all`} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[8px] text-[#ffcc00]/40 ml-1 font-black tracking-[0.3em] uppercase">Min</label>
                        <input 
                          name="minutes"
                          type="number"
                          defaultValue={editingObject.data.minutes} 
                          className={`hide-spinner w-full bg-black border border-[#ffcc00]/20 p-5 text-[11px] font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded} transition-all`} 
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal} 
                  className="flex-1 py-5 text-[9px] font-black border border-[#ffcc00]/20 hover:bg-white/5 rounded-2xl transition-all tracking-[0.3em] uppercase"
                >
                  ABORT
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-5 bg-[#ffcc00] text-black text-[9px] font-black rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(255,204,0,0.2)] tracking-[0.3em] px-8 uppercase"
                >
                  COMMIT_CHANGES
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
