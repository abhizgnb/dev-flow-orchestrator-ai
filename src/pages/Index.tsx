
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import AgentCard from '@/components/AgentCard';
import AgentWorkflow from '@/components/AgentWorkflow';
import { agents, getAgentById } from '@/data/agents';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentName?: string;
  agentAvatar?: string;
  agentColor?: string;
  timestamp: Date;
  type?: 'message' | 'code' | 'review' | 'test' | 'deployment';
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Welcome to the Multi-Agent Development Platform! I\'m Alex, your Prompt Interpreter. Tell me what you want to build, and I\'ll coordinate with my team of expert AI agents to bring your vision to life.\n\nOur team includes:\n• Morgan (Full-Stack Developer)\n• Jordan (Code Reviewer)\n• Riley (QA Engineer)\n• Casey (DevOps Specialist)\n• Sam (Dashboard Creator)\n\nWhat would you like us to build today?',
      sender: 'agent',
      agentName: 'Alex the Interpreter',
      agentAvatar: '🎯',
      agentColor: 'bg-purple-500',
      timestamp: new Date(),
      type: 'message'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<any[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAgentResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate Alex (Prompt Agent) responding first
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const alexResponse: Message = {
      id: Date.now().toString(),
      content: `I understand you want to build: "${userMessage}"\n\nLet me break this down and create a clear development plan. I'll coordinate with the team to:\n\n1. Analyze requirements\n2. Design architecture\n3. Generate code\n4. Review for quality\n5. Test thoroughly\n6. Deploy successfully\n\nLet me start the workflow now...`,
      sender: 'agent',
      agentName: 'Alex the Interpreter',
      agentAvatar: '🎯',
      agentColor: 'bg-purple-500',
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, alexResponse]);

    // Create workflow steps
    const workflowSteps = [
      {
        id: '1',
        agentName: 'Alex',
        title: 'Requirements Analysis',
        status: 'in-progress' as const,
        description: 'Analyzing and refining requirements',
        estimatedTime: '2 min'
      },
      {
        id: '2',
        agentName: 'Morgan',
        title: 'Code Generation',
        status: 'pending' as const,
        description: 'Writing clean, scalable code',
        estimatedTime: '5 min'
      },
      {
        id: '3',
        agentName: 'Jordan',
        title: 'Code Review',
        status: 'pending' as const,
        description: 'Reviewing for quality and security',
        estimatedTime: '3 min'
      },
      {
        id: '4',
        agentName: 'Riley',
        title: 'Quality Assurance',
        status: 'pending' as const,
        description: 'Running comprehensive tests',
        estimatedTime: '4 min'
      },
      {
        id: '5',
        agentName: 'Casey',
        title: 'Deployment',
        status: 'pending' as const,
        description: 'Deploying to production',
        estimatedTime: '2 min'
      }
    ];

    setCurrentWorkflow(workflowSteps);
    setActiveTab('workflow');

    // Simulate Morgan (Coder) responding
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const morganResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: `// Generated React Component\nimport React, { useState } from 'react';\nimport { Button } from '@/components/ui/button';\n\nconst MyApp = () => {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div className="p-6">\n      <h1>Your App</h1>\n      <p>Count: {count}</p>\n      <Button onClick={() => setCount(count + 1)}>\n        Increment\n      </Button>\n    </div>\n  );\n};\n\nexport default MyApp;`,
      sender: 'agent',
      agentName: 'Morgan the Builder',
      agentAvatar: '💻',
      agentColor: 'bg-green-500',
      timestamp: new Date(),
      type: 'code'
    };

    setMessages(prev => [...prev, morganResponse]);

    // Update workflow progress
    setCurrentStep(1);
    setWorkflowProgress(40);
    
    // Update agent statuses
    const updatedAgents = [...agents];
    updatedAgents[0].status = 'completed'; // Alex
    updatedAgents[1].status = 'working'; // Morgan

    toast({
      title: "Development in Progress",
      description: "Morgan has generated the initial code. Jordan will review it next.",
    });

    setIsLoading(false);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await simulateAgentResponse(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Multi-Agent Development Platform
          </h1>
          <p className="text-gray-600">
            AI agents working together to build your software from idea to deployment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">💬 Chat</TabsTrigger>
                <TabsTrigger value="workflow">⚡ Workflow</TabsTrigger>
                <TabsTrigger value="agents">👥 Team</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Development Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto pr-4 mb-4"
                      style={{ maxHeight: '450px' }}
                    >
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <ChatInput 
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      placeholder="Describe what you want to build (e.g., 'Create a todo app with user authentication')"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflow" className="mt-4">
                <div className="space-y-4">
                  {currentWorkflow.length > 0 && (
                    <AgentWorkflow 
                      steps={currentWorkflow}
                      currentStep={currentStep}
                      progress={workflowProgress}
                    />
                  )}
                  <Card className="p-6">
                    <div className="text-center text-gray-500">
                      {currentWorkflow.length === 0 ? (
                        <>
                          <h3 className="text-lg font-semibold mb-2">No Active Workflow</h3>
                          <p>Start a conversation in the chat to see the development workflow in action!</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold mb-2">Development In Progress</h3>
                          <p>Our AI agents are working hard to build your project!</p>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Agent Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Try these examples:</h4>
                  <div className="space-y-2">
                    {[
                      "Build a todo app with authentication",
                      "Create a dashboard with charts",
                      "Make a blog with comments system",
                      "Build an e-commerce product page"
                    ].map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto p-2 text-xs"
                        onClick={() => handleSendMessage(example)}
                        disabled={isLoading}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">🎯 Current Status</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Active Agents:</span>
                      <span className="font-mono">
                        {agents.filter(a => a.status === 'working').length}/6
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Tasks:</span>
                      <span className="font-mono">
                        {agents.filter(a => a.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
