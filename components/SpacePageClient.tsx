'use client';

import { useState } from 'react';
import SpacePageHeader from './SpacePageHeader';
import ChatbotView from './ChatbotView';

interface User {
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
  sub?: string;
}

interface Space {
  _id: string;
  name: string;
  currentStep: number;
  completed: boolean;
}

interface SpacePageClientProps {
  user: User;
  space: Space;
  totalSteps: number;
  children: React.ReactNode;
}

export default function SpacePageClient({ user, space, totalSteps, children }: SpacePageClientProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      <SpacePageHeader
        user={user}
        space={space}
        totalSteps={totalSteps}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />
      {children}
      <ChatbotView
        spaceId={space._id}
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
}
