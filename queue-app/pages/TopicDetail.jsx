import React, { useState } from 'react';
import { ChevronLeft, Lock, Globe, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ResourceRow from '@/components/queue/ResourceRow';
import EmptyState from '@/components/queue/EmptyState';

const mockResources = [
  { id: 1, title: "3Blue1Brown: Neural Networks", domain: "youtube.com", note: "Excellent visual explanations", category: "video" },
  { id: 2, title: 'Neural Networks and Deep Learning (book)', domain: 'neuralnetworksanddeeplearning.com', note: '', category: "reading" },
  { id: 3, title: "MIT 6.034 Lecture Notes", domain: "ocw.mit.edu", note: "More academic perspective", category: "course" },
  { id: 4, title: "Andrej Karpathy's Blog", domain: "karpathy.github.io", note: "", category: "article" },
];

const visibilityOptions = [
  { icon: Lock, label: 'Private', desc: 'Only you can see this' },
  { icon: Globe, label: 'Shared with others', desc: 'Topic visible, resources private' },
];

export default function TopicDetail() {
  const [title, setTitle] = useState('How do neural networks actually learn?');
  const [note, setNote] = useState("Started with 3Blue1Brown's video series. Want to understand backpropagation intuitively before diving into the math.");
  const [visibility, setVisibility] = useState(0);
  const [resources, setResources] = useState(mockResources);

  const vis = visibilityOptions[visibility];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="px-2 pt-3 pb-3 flex items-center gap-1">
          <Link
            to={createPageUrl('Queue')}
            className="flex items-center gap-0.5 text-[#7EB09B] px-2 py-2 -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">Queue</span>
          </Link>
        </div>
      </div>

      <div className="px-5 pb-28">
        {/* Editable Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[22px] font-bold text-gray-900 tracking-tight bg-transparent outline-none mb-2 leading-tight"
        />

        {/* Editable Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full text-[14px] text-gray-500 leading-relaxed bg-transparent outline-none resize-none mb-5 placeholder:text-gray-300"
        />

        {/* Visibility */}
        <button
          onClick={() => setVisibility((v) => (v + 1) % visibilityOptions.length)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-sm mb-8"
        >
          <vis.icon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[12px] font-medium text-gray-600">{vis.label}</span>
          <span className="text-[11px] text-gray-300">·</span>
          <span className="text-[11px] text-gray-400">{vis.desc}</span>
        </button>

        {/* Resources */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Resources</h2>
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#7EB09B]">
              <Plus className="w-3.5 h-3.5" />
              Add resource
            </button>
          </div>

          {resources.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 px-4">
              {resources.map(r => (
                <ResourceRow key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Add a resource when you find something useful."
            />
          )}
        </div>

        {/* Delete */}
        <div className="pt-8 pb-4">
          <button className="flex items-center gap-2 text-[13px] text-red-400 font-medium mx-auto">
            <Trash2 className="w-3.5 h-3.5" />
            Delete topic
          </button>
        </div>
      </div>
    </div>
  );
}