import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import ActivityCard from '@/components/queue/ActivityCard';
import CommentSheet from '@/components/queue/CommentSheet';
import EmptyState from '@/components/queue/EmptyState';

const mockFeed = [
  {
    id: 1,
    name: 'Julia',
    avatarColor: '#C4A1D4',
    topicTitle: 'How memory palaces work',
    context: 'Inspired by Moonwalking with Einstein',
    tag: 'Psychology',
    privacyLabel: 'Resources private',
    saved: false,
  },
  {
    id: 2,
    name: 'Marcus',
    avatarColor: '#A1C4D4',
    topicTitle: 'Basics of mushroom foraging',
    context: "Want to learn what's safe to pick locally",
    tag: 'Nature',
    privacyLabel: 'Shared topic',
    saved: false,
  },
  {
    id: 3,
    name: 'Priya',
    avatarColor: '#D4C4A1',
    topicTitle: 'Introduction to generative art',
    context: '',
    tag: 'Design',
    privacyLabel: 'Resources private',
    saved: true,
  },
  {
    id: 4,
    name: 'Leo',
    avatarColor: '#A1D4B8',
    topicTitle: 'Why do we dream?',
    context: "Neuroscience perspective, not the Freud stuff",
    tag: 'Science',
    privacyLabel: 'Shared topic',
    saved: false,
  },
  {
    id: 5,
    name: 'Aisha',
    avatarColor: '#D4A1B8',
    topicTitle: 'History of Japanese joinery',
    context: 'No nails, just precision',
    tag: 'Craft',
    privacyLabel: 'Resources private',
    saved: false,
  },
];

export default function Discover() {
  const [commentSheet, setCommentSheet] = useState({ open: false, topic: '' });

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Discover</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Things your friends are curious about</p>
        </div>
      </div>

      {/* Feed */}
      <div className="px-5 pb-28 space-y-3 pt-1">
        {mockFeed.length > 0 ? (
          mockFeed.map(item => (
            <ActivityCard
              key={item.id}
              activity={item}
              onOpenComments={() => setCommentSheet({ open: true, topic: item.topicTitle })}
            />
          ))
        ) : (
          <EmptyState
            icon={Compass}
            title="Discover what others are exploring."
            subtitle="Follow friends to see their curiosities"
          />
        )}
      </div>

      <CommentSheet
        isOpen={commentSheet.open}
        onClose={() => setCommentSheet({ open: false, topic: '' })}
        topicTitle={commentSheet.topic}
      />
    </div>
  );
}