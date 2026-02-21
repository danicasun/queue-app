import React, { useState } from 'react';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';

const initialTags = [
  { id: 1, name: 'Design', count: 3 },
  { id: 2, name: 'Science', count: 5 },
  { id: 3, name: 'History', count: 2 },
  { id: 4, name: 'Philosophy', count: 4 },
  { id: 5, name: 'Tech', count: 7 },
];

export default function Organize() {
  const [folders, setFolders] = useState(initialTags);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const newItem = { id: Date.now(), name: '', count: 0 };
    setFolders(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
    setEditValue('');
  };

  const handleSaveEdit = (id) => {
    if (!editValue.trim()) {
      setFolders(prev => prev.filter(i => i.id !== id));
    } else {
      setFolders(prev => prev.map(i => i.id === id ? { ...i, name: editValue } : i));
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id) => {
    setFolders(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Organize</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Tags</p>
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-28 pt-2">
        <button
          onClick={handleAdd}
          className="w-full flex items-center gap-3 py-3 mb-2 text-[#7EB09B]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#7EB09B]/10 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[14px] font-medium">New tag</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {folders.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(item.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                    placeholder="Tag name..."
                    className="w-full text-[15px] text-gray-800 placeholder:text-gray-300 bg-transparent outline-none"
                  />
                ) : (
                  <>
                    <h4 className="text-[15px] font-medium text-gray-800">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">{item.count} topic{item.count !== 1 ? 's' : ''}</p>
                  </>
                )}
              </div>
              {editingId !== item.id && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => { setEditingId(item.id); setEditValue(item.name); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}