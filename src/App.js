import React, { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
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
  Plus, 
  GripVertical, 
  Trash2, 
  Edit3,
  Clock, 
  X,
  Terminal,
  Cpu,
  Zap,
  Activity,
  Save,
  Settings,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// --- 視覺定義：黑黃色調 ---
const UI_THEME = {
  bg: 'bg-[#0a0a0a]',
  surface: 'bg-[#151515]',
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
      iteration += 1/2;
    }, 20);
    return () => clearInterval(interval);
  }, [text, trigger]);
  
  return displayText;
};

// --- 可排序項目組件 ---
const SortableItem = ({ id, item, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const glitchTitle = useGlitchText(item.title, item.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border ${UI_THEME.border} mb-2 ${UI_THEME.surface} p-5 flex items-center gap-6 overflow-hidden transition-all hover:bg-[#222] hover:border-[#ffcc00]/50 hover:scale-[1.01] active:scale-[0.98] ${UI_THEME.rounded}`}
    >
      <div className="flex flex-col items-center opacity-30 group-hover:opacity-100 group-hover:animate-jitter">
        <span className="text-[7px] font-mono text-[#ffcc00] mb-2 leading-none uppercase tracking-tighter">REF_{id}</span>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
          <GripVertical size={14} className="text-[#ffcc00]" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`text-[10px] text-black font-black ${UI_THEME.accentBg} px-1.5 py-0.5 rounded-md`}>
            {String(item.index + 1).padStart(2, '0')}
          </span>
          <h3 className="font-bold text-white truncate text-xs tracking-[0.2em] uppercase">
            {glitchTitle}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-[#ffcc00]/40 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock size={10} /> {item.hours || '0'}H {item.minutes || '0'}M</span>
          <span className="text-[8px] italic opacity-50">STATUS: SECURE_NODE</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => onEdit(item)} className={`p-2 border border-[#ffcc00]/20 hover:bg-[#ffcc00] hover:text-black transition-colors rounded-lg`}>
          <Edit3 size={12} />
        </button>
        <button onClick={() => onDelete(id)} className={`p-2 border border-red-900/40 hover:bg-red-600 transition-colors rounded-lg`}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// --- 主程式 ---
export default function App() {
  const [items, setItems] = useState([
    { id: '401', title: 'SYSTEM_BOOT_SEQUENCE', hours: '0', minutes: '45' },
    { id: '402', title: 'FIELD_SURVEY_ALPHA', hours: '2', minutes: '30' },
    { id: '403', title: 'ENERGY_CELL_REPLACE', hours: '1', minutes: '15' },
    { id: '404', title: 'NIGHT_WATCH_PROTOCOL', hours: '8', minutes: '00' },
  ]);

  const [newItem, setNewItem] = useState({ title: '', hours: '', minutes: '' });
  const [activeId, setActiveId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragStart = (e) => {
    setActiveId(e.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: Math.random().toString(36).substr(2, 4) }]);
    setNewItem({ title: '', hours: '', minutes: '' });
  };

  const deleteItem = (id) => setItems(prev => prev.filter(item => item.id !== id));
  const saveEdit = (updatedItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  return (
    <div className={`min-h-screen ${UI_THEME.bg} text-white font-mono p-6 md:p-20 relative overflow-hidden flex flex-col items-center selection:bg-[#ffcc00] selection:text-black`}>
      
      {/* --- 氛圍效果層 --- */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,204,0,0.03)_50%,transparent_100%)] bg-[length:100%_3px] animate-vhs-scan"></div>
        <div className="absolute top-6 left-6 text-[8px] font-black opacity-30 text-[#ffcc00]"> </div>
        <div className="absolute top-6 right-6 text-[8px] font-black opacity-30 text-[#ffcc00]"> </div>
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(255,204,0,0.05)] border-[20px] border-black"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-crt-power-on">
        
        {/* 工業 Header */}
        <header className={`mb-16 border-b-4 border-[#ffcc00] pb-10 flex justify-between items-end relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-1 bg-[#ffcc00] text-black text-[8px] font-black rounded-bl-lg">HAZARD_LV3</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw size={12} className="animate-spin text-[#ffcc00]/50" />
              <span className="text-[9px] font-bold tracking-[0.5em] text-[#ffcc00]/40 uppercase">Awaiting Instructions...</span>
            </div>
            <h1 className="text-6xl font-black text-[#ffcc00] tracking-tighter uppercase italic leading-none hover:animate-jitter cursor-crosshair">
              CHRONO WEAPONS
            </h1>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <div className="h-4 w-24 bg-[#ffcc00]/5 flex gap-1 p-1 rounded-sm">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm ${i < (tick % 8) ? 'bg-[#ffcc00]' : 'bg-[#ffcc00]/10'}`}></div>
              ))}
            </div>
            <span className="text-[10px] font-black tracking-widest text-[#ffcc00]/40 italic uppercase">Sync: OK</span>
          </div>
        </header>

        {/* 交互輸入端 */}
        <div className="mb-12">
          <form onSubmit={addItem} className={`flex flex-col md:flex-row gap-2 bg-[#ffcc00]/10 p-2 border border-[#ffcc00]/30 backdrop-blur-sm ${UI_THEME.rounded}`}>
            <div className={`flex-1 bg-black flex items-center px-6 py-5 group ${UI_THEME.rounded}`}>
              <span className="text-[#ffcc00]/20 mr-4 text-xs font-black group-focus-within:text-[#ffcc00] group-focus-within:animate-pulse">{`>>`}</span>
              <input
                type="text"
                placeholder="ENTER NEW COMMAND..."
                className="w-full bg-transparent font-bold text-white placeholder:text-[#ffcc00]/10 outline-none text-xs tracking-widest uppercase"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div className={`bg-black flex items-center px-4 py-5 border-[#ffcc00]/10 ${UI_THEME.rounded} gap-2`}>
              <Clock size={12} className="text-[#ffcc00]/20" />
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="0"
                  className="hide-spinner w-8 bg-transparent text-[10px] font-mono text-white outline-none placeholder:text-[#ffcc00]/10 text-center"
                  value={newItem.hours}
                  onChange={(e) => setNewItem({ ...newItem, hours: e.target.value })}
                />
                <span className="text-[8px] text-[#ffcc00]/30 mr-2 font-black">H</span>
                <input
                  type="number"
                  placeholder="00"
                  className="hide-spinner w-8 bg-transparent text-[10px] font-mono text-white outline-none placeholder:text-[#ffcc00]/10 text-center"
                  value={newItem.minutes}
                  onChange={(e) => setNewItem({ ...newItem, minutes: e.target.value })}
                />
                <span className="text-[8px] text-[#ffcc00]/30 font-black">M</span>
              </div>
            </div>
            <button 
              type="submit" 
              className={`bg-[#ffcc00] hover:bg-[#ffe066] text-black px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 hover:animate-jitter ${UI_THEME.rounded}`}
            >
              EXECUTE
            </button>
          </form>
        </div>

        {/* 協議列表 */}
        <div className="min-h-[400px] relative">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <SortableItem 
                    key={item.id} 
                    id={item.id} 
                    item={{ ...item, index }} 
                    onDelete={deleteItem} 
                    onEdit={setEditingItem}
                  />
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <div className={`bg-[#ffcc00] p-6 flex items-center gap-6 cursor-grabbing border-4 border-black animate-jitter shadow-[0_0_30px_rgba(255,204,0,0.3)] ${UI_THEME.rounded}`}>
                  <h3 className="font-black text-black uppercase tracking-widest">
                    MOVE_PROTOCOL: {items.find(i => i.id === activeId)?.id}
                  </h3>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          {items.length === 0 && (
            <div className={`text-center py-40 border-2 border-dashed border-[#ffcc00]/10 text-[10px] font-black tracking-[1em] text-[#ffcc00]/10 animate-pulse ${UI_THEME.rounded}`}>
              NO_LOGS_AVAILABLE
            </div>
          )}
        </div>

        {/* 底部邊緣數據 */}
        <footer className="mt-24 border-t-2 border-[#ffcc00]/20 pt-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex gap-4">
            <div className={`px-4 py-2 bg-[#ffcc00]/5 border border-[#ffcc00]/10 text-[8px] font-black animate-pulse rounded-full text-[#ffcc00]`}>CORE HEAT: 42°C</div>
            <div className={`px-4 py-2 bg-[#ffcc00]/5 border border-[#ffcc00]/10 text-[8px] font-black rounded-full text-[#ffcc00]`}>BUFFER: 100%</div>
          </div>
          <div className="text-[10px] font-black tracking-[0.5em] text-[#ffcc00]/20 italic uppercase">
            End Of Transmission
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vhs-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes jitter {
          0% { transform: translate(0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(0); }
        }
        @keyframes crt-power-on {
          0% { 
            transform: scaleY(0.005) scaleX(0); 
            opacity: 0; 
            background: #ffcc00; 
          }
          20% { 
            transform: scaleY(0.005) scaleX(1.2); 
            opacity: 1; 
            background: #ffcc00; 
          }
          40% { 
            transform: scaleY(0.005) scaleX(1); 
            opacity: 1; 
            background: #ffcc00;
          }
          100% { 
            transform: scaleY(1) scaleX(1); 
            opacity: 1; 
          }
        }
        /* 隱藏數字輸入框的上下箭頭 */
        .hide-spinner::-webkit-outer-spin-button,
        .hide-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-spinner {
          -moz-appearance: textfield;
        }

        .animate-vhs-scan { animation: vhs-scan 5s linear infinite; }
        .animate-jitter { animation: jitter 0.1s infinite; }
        .animate-crt-power-on { animation: crt-power-on 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}} />

      {/* 編輯彈窗 */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className={`bg-[#151515] border-2 border-[#ffcc00] p-8 w-full max-w-sm animate-crt-power-on ${UI_THEME.rounded} shadow-[0_0_50px_rgba(255,204,0,0.2)]`}>
            <h2 className="text-xs font-black mb-6 border-b border-[#ffcc00]/20 pb-2 uppercase tracking-widest text-[#ffcc00] flex items-center gap-2">
              <AlertTriangle size={14} /> Protocol_Mod
            </h2>
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[8px] text-[#ffcc00]/50 ml-1 font-bold">COMMAND_ID</label>
                <input 
                  id="edit-title" 
                  defaultValue={editingItem.title} 
                  className={`w-full bg-black border border-[#ffcc00]/20 p-4 text-xs font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded}`} 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] text-[#ffcc00]/50 ml-1 font-bold">HOURS (H)</label>
                  <input 
                    id="edit-hours" 
                    type="number"
                    defaultValue={editingItem.hours} 
                    className={`hide-spinner w-full bg-black border border-[#ffcc00]/20 p-4 text-xs font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded}`} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-[#ffcc00]/50 ml-1 font-bold">MINUTES (M)</label>
                  <input 
                    id="edit-minutes" 
                    type="number"
                    defaultValue={editingItem.minutes} 
                    className={`hide-spinner w-full bg-black border border-[#ffcc00]/20 p-4 text-xs font-bold outline-none focus:border-[#ffcc00] text-white ${UI_THEME.rounded}`} 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingItem(null)} className={`flex-1 py-4 text-[10px] border border-[#ffcc00]/20 hover:bg-white/5 rounded-xl`}>CANCEL</button>
              <button 
                onClick={() => saveEdit({ 
                  ...editingItem, 
                  title: document.getElementById('edit-title').value, 
                  hours: document.getElementById('edit-hours').value,
                  minutes: document.getElementById('edit-minutes').value 
                })} 
                className={`flex-1 py-4 bg-[#ffcc00] text-black text-[10px] font-black rounded-xl`}
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
