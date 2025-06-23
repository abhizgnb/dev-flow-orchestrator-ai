
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  agentName: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
  estimatedTime?: string;
}

interface AgentWorkflowProps {
  steps: WorkflowStep[];
  currentStep: number;
  progress: number;
}

const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ steps, currentStep, progress }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent Workflow Progress</span>
          <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${
                    index === currentStep ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {step.agentName}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(step.status)}`}>
                      {step.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.estimatedTime && step.status === 'in-progress' && (
                  <p className="text-xs text-blue-500 mt-1">⏱ Est. {step.estimatedTime}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentWorkflow;
