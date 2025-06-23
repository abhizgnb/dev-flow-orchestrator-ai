
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  avatar: string;
  color: string;
}

const agents: Agent[] = [
  {
    id: 'prompt-agent',
    name: 'Alex the Interpreter',
    role: 'Prompt Architect',
    systemPrompt: 'You are Alex, a skilled prompt architect. Your job is to analyze user requests and break them down into clear, actionable development requirements. Ask clarifying questions when needed and provide structured project plans.',
    avatar: '🎯',
    color: 'bg-purple-500'
  },
  {
    id: 'coder-agent', 
    name: 'Morgan the Builder',
    role: 'Full-Stack Developer',
    systemPrompt: 'You are Morgan, an expert full-stack developer. Generate clean, efficient, and well-documented code based on requirements. Focus on React, TypeScript, and modern web development practices.',
    avatar: '💻',
    color: 'bg-green-500'
  },
  {
    id: 'reviewer-agent',
    name: 'Jordan the Guardian', 
    role: 'Code Reviewer',
    systemPrompt: 'You are Jordan, a senior code reviewer. Analyze code for bugs, security issues, performance problems, and adherence to best practices. Provide constructive feedback and suggestions.',
    avatar: '🔍',
    color: 'bg-blue-500'
  },
  {
    id: 'qa-agent',
    name: 'Riley the Validator',
    role: 'QA Engineer',
    systemPrompt: 'You are Riley, a QA engineer focused on testing and quality assurance. Create test cases, identify edge cases, and ensure software reliability and user experience.',
    avatar: '🧪', 
    color: 'bg-orange-500'
  },
  {
    id: 'deployment-agent',
    name: 'Casey the Deployer',
    role: 'DevOps Engineer', 
    systemPrompt: 'You are Casey, a DevOps specialist. Handle deployment strategies, environment setup, CI/CD pipelines, and production readiness assessments.',
    avatar: '🚀',
    color: 'bg-red-500'
  }
];

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, userId } = await req.json();

    // Create conversation if it doesn't exist
    if (!conversationId) {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + '...'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Save user message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        content: message,
        sender: 'user'
      });

      // Start agent workflow
      const workflowSteps = [
        {
          id: '1',
          agentName: 'Alex',
          title: 'Requirements Analysis',
          status: 'in-progress',
          description: 'Analyzing and refining requirements',
          estimatedTime: '2 min'
        },
        {
          id: '2', 
          agentName: 'Morgan',
          title: 'Code Generation',
          status: 'pending',
          description: 'Writing clean, scalable code',
          estimatedTime: '5 min'
        },
        {
          id: '3',
          agentName: 'Jordan', 
          title: 'Code Review',
          status: 'pending',
          description: 'Reviewing for quality and security',
          estimatedTime: '3 min'
        },
        {
          id: '4',
          agentName: 'Riley',
          title: 'Quality Assurance', 
          status: 'pending',
          description: 'Running comprehensive tests',
          estimatedTime: '4 min'
        },
        {
          id: '5',
          agentName: 'Casey',
          title: 'Deployment',
          status: 'pending', 
          description: 'Deploying to production',
          estimatedTime: '2 min'
        }
      ];

      await supabase.from('agent_workflows').insert({
        conversation_id: conversation.id,
        steps: workflowSteps,
        current_step: 0,
        progress: 20,
        status: 'in-progress'
      });

      // Process with Alex (Prompt Agent)
      const alexResponse = await callOpenAI(message, agents[0].systemPrompt);
      
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        content: alexResponse,
        sender: 'agent',
        agent_name: agents[0].name,
        agent_avatar: agents[0].avatar,
        agent_color: agents[0].color,
        message_type: 'message'
      });

      // Simulate Morgan (Coder Agent) response
      setTimeout(async () => {
        const morganPrompt = `Based on this requirement: "${message}", generate React TypeScript code that implements the requested functionality.`;
        const morganResponse = await callOpenAI(morganPrompt, agents[1].systemPrompt);
        
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          content: morganResponse,
          sender: 'agent',
          agent_name: agents[1].name,
          agent_avatar: agents[1].avatar,
          agent_color: agents[1].color,
          message_type: 'code'
        });

        // Update workflow progress
        await supabase.from('agent_workflows')
          .update({ 
            current_step: 1, 
            progress: 40,
            steps: workflowSteps.map((step, index) => ({
              ...step,
              status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending'
            }))
          })
          .eq('conversation_id', conversation.id);
      }, 3000);

      return new Response(JSON.stringify({ 
        success: true, 
        conversationId: conversation.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Handle existing conversation
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        content: message,
        sender: 'user'
      });

      // Get conversation context and continue workflow
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      const context = messages?.map(m => `${m.sender}: ${m.content}`).join('\n') || '';
      const response = await callOpenAI(`${context}\n\nUser: ${message}`, agents[0].systemPrompt);

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        content: response,
        sender: 'agent',
        agent_name: agents[0].name,
        agent_avatar: agents[0].avatar,
        agent_color: agents[0].color,
        message_type: 'message'
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in agent-coordinator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
