
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import AgentCard from '@/components/AgentCard';
import AgentWorkflow from '@/components/AgentWorkflow';
import AuthForm from '@/components/AuthForm';
import { agents } from '@/data/agents';
import { useAuth } from '@/hooks/useAuth';
import { useConversation } from '@/hooks/useConversation';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { messages, workflow, isLoading, sendMessage } = useConversation();
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    if (workflow && workflow.steps.length > 0) {
      setActiveTab('workflow');
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Convert messages to display format
  const displayMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender as 'user' | 'agent',
    agentName: msg.agent_name,
    agentAvatar: msg.agent_avatar,
    agentColor: msg.agent_color,
    timestamp: new Date(msg.created_at),
    type: msg.message_type as 'message' | 'code' | 'review' | 'test' | 'deployment'
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 Multi-Agent Development Platform
            </h1>
            <p className="text-gray-600">
              AI agents working together to build your software from idea to deployment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
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
                      {displayMessages.length === 0 && (
                        <div className="text-center text-gray-500 mt-8">
                          <h3 className="text-lg font-semibold mb-2">Welcome to your AI Development Team!</h3>
                          <p>Start by describing what you want to build, and our AI agents will work together to make it happen.</p>
                        </div>
                      )}
                      {displayMessages.map((message) => (
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
                  {workflow && workflow.steps.length > 0 ? (
                    <AgentWorkflow 
                      steps={workflow.steps}
                      currentStep={workflow.current_step}
                      progress={workflow.progress}
                    />
                  ) : (
                    <Card className="p-6">
                      <div className="text-center text-gray-500">
                        <h3 className="text-lg font-semibold mb-2">No Active Workflow</h3>
                        <p>Start a conversation in the chat to see the development workflow in action!</p>
                      </div>
                    </Card>
                  )}
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

          {/* Sidebar - Quick Start */}
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
                      <span>Messages:</span>
                      <span className="font-mono">{displayMessages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workflow Progress:</span>
                      <span className="font-mono">{workflow?.progress || 0}%</span>
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
