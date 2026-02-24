import React, { useState, useEffect } from 'react';
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
  GripVertical, 
  Trash2, 
  Edit3,
  Clock, 
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
      <div className="flex flex-col items-center opacity-30 group-hover:opacity-100">
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
        <button onClick={() => onEdit(item)} className="p-2 border border-[#ffcc00]/20 hover:bg-[#ffcc00] hover:text-black transition-colors rounded-lg">
          <Edit3 size={12} />
        </button>
        <button onClick={() => onDelete(id)} className="p-2 border border-red-900/40 hover:bg-red-600 transition-colors rounded-lg">
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

  const saveEdit = (updatedItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  return (
    <div className={`min-h-screen ${UI_THEME.bg} text-white font-mono p-6 md:p-20 relative overflow-hidden flex flex-col items-center selection:bg-[#ffcc00] selection:text-black`}>
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,204,0,0.03)_50%,transparent_100%)] bg-[length:100%_3px] animate-vhs-scan"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-crt-power-on">
        <header className="mb-16 border-b-4 border-[#ffcc00] pb-10 flex justify-between items-end relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw size={12} className="animate-spin text-[#ffcc00]/50" />
              <span className="text-[9px] font-bold tracking-[0.5em] text-[#ffcc00]/40 uppercase">Awaiting Instructions...</span>
            </div>
            <h1 className="text-6xl font-black text-[#ffcc00] tracking-tighter uppercase italic leading-none">CHRONO WEAPONS</h1>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <div className="h-4 w-24 bg-[#ffcc00]/5 flex gap-1 p-1 rounded-sm">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm ${i < (tick % 8) ? 'bg-[#ffcc00]' : 'bg-[#ffcc00]/10'}`}></div>
              ))}
            </div>
          </div>
        </header>

        <form onSubmit={addItem} className={`mb-12 flex flex-col md:flex-row gap-2 bg-[#ffcc00]/10 p-2 border border-[#ffcc00]/30 backdrop-blur-sm ${UI_THEME.rounded}`}>
          <div className={`flex-1 bg-black flex items-center px-6 py-5 ${UI_THEME.rounded}`}>
            <input
              type="text"
              placeholder="ENTER COMMAND..."
              className="w-full bg-transparent font-bold text-white placeholder:text-[#ffcc00]/10 outline-none text-xs uppercase"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
          </div>
          <button 输入="submit" className={`bg-[#ffcc00] text-black px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] ${UI_THEME.rounded}`}>EXECUTE</button>
        </form>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableItem key={item.id} id={item.id} item={{ ...item, index }} onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))} onEdit={setEditingItem} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className={`bg-[#ffcc00] p-6 flex items-center gap-6 border-4 border-black ${UI_THEME.rounded}`}>
                <h3 className="font-black text-black uppercase tracking-widest">MOVING_NODE_{activeId}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vhs-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        @keyframes crt-power-on { 0% { transform: scaleY(0.005) scaleX(0); opacity: 0; } 100% { transform: scaleY(1) scaleX(1); opacity: 1; } }
        .animate-vhs-scan { animation: vhs-scan 5s linear infinite; }
        .animate-crt-power-on { animation: crt-power-on 0.5s ease-out forwards; }
      `}} />

      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className={`bg-[#151515] border-2 border-[#ffcc00] p-8 w-full max-w-sm ${UI_THEME.rounded}`}>
            <h2 className="text-xs font-black mb-6 text-[#ffcc00] flex items-center gap-2"><AlertTriangle size={14} /> Protocol_Mod</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditingItem(null)} className="flex-1 py-4 text-[10px] border border-[#ffcc00]/20 rounded-xl">CANCEL</button>
              <button onClick={() => saveEdit({...editingItem})} className="flex-1 py-4 bg-[#ffcc00] text-black text-[10px] font-black rounded-xl">APPLY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
