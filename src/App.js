import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RefreshCw } from 'lucide-react';

const SortableItem = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="p-4 mb-2 bg-[#151515] border border-[#ffcc00]/20 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab p-2 hover:bg-white/5 rounded-md">
          <GripVertical size={16} className="text-[#ffcc00]" />
        </div>
        <span className="text-sm font-bold text-white uppercase tracking-widest">{title}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState([
    { id: '1', title: 'SYSTEM_BOOT_SEQUENCE' },
    { id: '2', title: 'CORE_SYNC_PROTOCOL' },
    { id: '3', title: 'ENCRYPTION_KEY_GEN' }
  ]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-10 flex flex-col items-center font-mono">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_0%,#ffcc00_50%,transparent_100%)] bg-[length:100%_4px]"></div>
      <header className="w-full max-w-md border-b-4 border-[#ffcc00] pb-6 mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#ffcc00] italic leading-none">CHRONO</h1>
          <h2 className="text-4xl font-black text-[#ffcc00] italic leading-none">WEAPONS</h2>
        </div>
        <RefreshCw size={20} className="text-[#ffcc00] animate-spin mb-1" />
      </header>
      <div className="w-full max-w-md relative z-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => <SortableItem key={item.id} id={item.id} title={item.title} />)}
          </SortableContext>
        </DndContext>
      </div>
      <footer className="mt-20 text-[10px] text-[#ffcc00]/30 tracking-[0.5em] uppercase">
        End / Transmission
      </footer>
    </div>
  );
}
