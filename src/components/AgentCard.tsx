
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  story: string;
  avatar: string;
  color: string;
  status: 'idle' | 'working' | 'completed' | 'reviewing';
}

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={`w-12 h-12 ${agent.color}`}>
              <AvatarFallback className="text-white font-bold">
                {agent.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(agent.status)}>
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Goal</h4>
            <p className="text-sm text-gray-600">{agent.goal}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Story</h4>
            <p className="text-sm text-gray-600 italic">{agent.story}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
