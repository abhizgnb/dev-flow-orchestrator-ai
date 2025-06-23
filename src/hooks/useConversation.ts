
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agent_name?: string;
  agent_avatar?: string;
  agent_color?: string;
  message_type?: 'message' | 'code' | 'review' | 'test' | 'deployment';
  created_at: string;
}

interface WorkflowStep {
  id: string;
  agentName: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
  estimatedTime?: string;
}

interface AgentWorkflow {
  id: string;
  steps: WorkflowStep[];
  current_step: number;
  progress: number;
  status: string;
}

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [workflow, setWorkflow] = useState<AgentWorkflow | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Type cast the data to match our Message interface
    const typedMessages: Message[] = (data || []).map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender as 'user' | 'agent',
      agent_name: msg.agent_name || undefined,
      agent_avatar: msg.agent_avatar || undefined,
      agent_color: msg.agent_color || undefined,
      message_type: msg.message_type as 'message' | 'code' | 'review' | 'test' | 'deployment' || 'message',
      created_at: msg.created_at
    }));

    setMessages(typedMessages);
  };

  const loadWorkflow = async (convId: string) => {
    const { data, error } = await supabase
      .from('agent_workflows')
      .select('*')
      .eq('conversation_id', convId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading workflow:', error);
      return;
    }

    if (data) {
      // Type cast the data to match our AgentWorkflow interface
      const typedWorkflow: AgentWorkflow = {
        id: data.id,
        steps: Array.isArray(data.steps) ? data.steps as WorkflowStep[] : [],
        current_step: data.current_step || 0,
        progress: data.progress || 0,
        status: data.status || 'pending'
      };
      setWorkflow(typedWorkflow);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('agent-coordinator', {
        body: {
          message: content,
          conversationId,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      if (!conversationId && response.data?.conversationId) {
        setConversationId(response.data.conversationId);
        await loadMessages(response.data.conversationId);
        await loadWorkflow(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId || !user) return;

    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new;
          const typedMessage: Message = {
            id: newMessage.id,
            content: newMessage.content,
            sender: newMessage.sender as 'user' | 'agent',
            agent_name: newMessage.agent_name || undefined,
            agent_avatar: newMessage.agent_avatar || undefined,
            agent_color: newMessage.agent_color || undefined,
            message_type: newMessage.message_type as 'message' | 'code' | 'review' | 'test' | 'deployment' || 'message',
            created_at: newMessage.created_at
          };
          setMessages(prev => [...prev, typedMessage]);
        }
      )
      .subscribe();

    const workflowChannel = supabase
      .channel(`workflow-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_workflows',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedData = payload.new;
          const typedWorkflow: AgentWorkflow = {
            id: updatedData.id,
            steps: Array.isArray(updatedData.steps) ? updatedData.steps as WorkflowStep[] : [],
            current_step: updatedData.current_step || 0,
            progress: updatedData.progress || 0,
            status: updatedData.status || 'pending'
          };
          setWorkflow(typedWorkflow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(workflowChannel);
    };
  }, [conversationId, user]);

  return {
    messages,
    workflow,
    conversationId,
    isLoading,
    sendMessage,
    setConversationId: (id: string) => {
      setConversationId(id);
      if (id) {
        loadMessages(id);
        loadWorkflow(id);
      }
    }
  };
};
