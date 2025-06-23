
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    agentName?: string;
    agentAvatar?: string;
    agentColor?: string;
    timestamp: Date;
    type?: 'message' | 'code' | 'review' | 'test' | 'deployment';
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return '💻';
      case 'review': return '🔍';
      case 'test': return '🧪';
      case 'deployment': return '🚀';
      default: return '💬';
    }
  };

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className={`w-8 h-8 mt-1 ${message.agentColor || 'bg-gray-500'}`}>
          <AvatarFallback className="text-white text-xs font-bold">
            {message.agentAvatar || '🤖'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{message.agentName}</span>
            {message.type && (
              <Badge variant="secondary" className="text-xs">
                {getMessageTypeIcon(message.type)} {message.type}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <Card className={`p-4 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : message.type === 'code' 
              ? 'bg-gray-900 text-green-400 font-mono' 
              : 'bg-white border'
        }`}>
          <pre className={`whitespace-pre-wrap text-sm ${
            message.type === 'code' ? 'font-mono' : 'font-normal'
          }`}>
            {message.content}
          </pre>
        </Card>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 mt-1 bg-blue-500">
          <AvatarFallback className="text-white text-xs font-bold">
            👤
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
