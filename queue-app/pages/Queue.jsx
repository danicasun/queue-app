import React, { useState } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import TopicCard from '@/components/queue/TopicCard';
import EmptyState from '@/components/queue/EmptyState';
import AddTopicSheet from '@/components/queue/AddTopicSheet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const initialTopics = [
  {
    id: 1,
    title: 'How do neural networks actually learn?',
    note: "Started with 3Blue1Brown's video series",
    tags: ['Tech', 'Science'],
    status: 'active',
    resourceCount: 4,
  },
  {
    id: 2,
    title: 'The history of cartography',
    note: "Old maps are fascinating — want to understand projection methods",
    tags: ['History'],
    status: 'active',
    resourceCount: 2,
  },
  {
    id: 3,
    title: 'Basics of sourdough fermentation',
    note: '',
    tags: ['Science', 'Food'],
    status: 'active',
    resourceCount: 1,
  },
  {
    id: 4,
    title: 'Stoic philosophy intro',
    note: "Meditations by Marcus Aurelius seems like a good starting point",
    tags: ['Philosophy'],
    status: 'completed',
    resourceCount: 3,
  },
  {
    id: 5,
    title: 'Color theory in UI design',
    note: '',
    tags: ['Design', 'Tech'],
    status: 'active',
    resourceCount: 0,
  },
];

export default function Queue() {
  const [topics, setTopics] = useState(initialTopics);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTopic = (topic) => {
    setTopics(prev => [{
      id: Date.now(),
      ...topic,
      status: 'active',
      resourceCount: 0,
    }, ...prev]);
  };

  const filtered = searchQuery
    ? topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : topics;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="px-5 pt-3 pb-3">
          {!searchOpen ? (
            <div className="flex items-center justify-between">
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">My Queue</h1>
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
              >
                <Search className="w-4.5 h-4.5 text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center px-3.5 py-2.5">
                <Search className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="flex-1 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-300 outline-none"
                />
              </div>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="text-[14px] font-medium text-[#7EB09B]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic List */}
      <div className="px-5 pb-28 space-y-3 pt-1">
        {filtered.length > 0 ? (
          filtered.map(topic => (
            <Link key={topic.id} to={createPageUrl('TopicDetail') + `?id=${topic.id}`} className="block">
              <TopicCard topic={topic} />
            </Link>
          ))
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Add something you're curious about."
            subtitle="Your learning queue starts here"
          />
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#7EB09B] shadow-lg shadow-[#7EB09B]/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      <AddTopicSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddTopic}
      />
    </div>
  );
}