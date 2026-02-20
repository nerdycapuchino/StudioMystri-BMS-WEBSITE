import React, { useState } from 'react';
import { useCampaigns, useUpdateCampaign } from '../hooks/useMarketing';
import { Sparkles, MessageSquare, Mail, X, Pause, Play, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const Marketing: React.FC = () => {
  const { data: campData, isLoading, isError, error } = useCampaigns();
  const updateCampaign = useUpdateCampaign();

  const campaigns: any[] = Array.isArray(campData?.data || campData) ? (campData?.data || campData) as any[] : [];

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !audience) return;
    setIsGenerating(true);
    setTimeout(() => {
      const templates = [
        `Subject: Discover ${topic} - Just for You!\n\nHi there,\n\nWe know ${audience} appreciate quality. That's why we're bringing you the best in ${topic}. Visit our showroom today!`,
        `Hey ${audience}!\n\nCheck out our new ${topic} collection. It's exactly what you've been looking for. Limited stock available!`
      ];
      setGeneratedContent(templates[Math.floor(Math.random() * templates.length)]);
      setIsGenerating(false);
    }, 1000);
  };

  const toggleCampaignStatus = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      updateCampaign.mutate({ id, status: campaign.status === 'Active' ? 'Paused' : 'Active' } as any);
    }
  };

  const chartData = [
    { name: 'Camp A', roi: 400 },
    { name: 'Camp B', roi: 300 },
    { name: 'Camp C', roi: 550 },
    { name: 'Camp D', roi: 200 },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse w-48" />
        <div className="flex-1 bg-zinc-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-2">Failed to load campaigns</p>
          <p className="text-zinc-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Marketing & Campaigns</h2>
          <p className="text-slate-500 text-sm">Automate outreach and track ROI.</p>
        </div>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200"
        >
          <Sparkles className="w-4 h-4" /> Content Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Active Campaigns</h3>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${campaign.channel === 'WhatsApp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {campaign.channel === 'WhatsApp' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{campaign.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {campaign.status}
                      </span>
                      <span className="text-xs text-slate-500">{campaign.channel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-sm font-bold text-slate-800">{campaign.conversionRate}%</p>
                    <p className="text-xs text-slate-500">Conv. Rate</p>
                  </div>
                  <button onClick={() => toggleCampaignStatus(campaign.id)} className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-lg">
                    {campaign.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-semibold text-slate-800 mb-4">ROI Analytics</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="roi" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isAiModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl">
          <div className="bg-white w-[500px] rounded-xl shadow-2xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold flex gap-2 items-center"><Sparkles className="w-4 h-4 text-purple-600" /> Quick Template Gen</h3>
              <button onClick={() => setIsAiModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Product / Topic" className="w-full border p-2 rounded mb-2" />
            <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Target Audience" className="w-full border p-2 rounded mb-4" />
            <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white py-2 rounded">
              {isGenerating ? 'Generating...' : 'Generate Template'}
            </button>
            {generatedContent && <div className="mt-4 p-2 bg-slate-50 text-sm border rounded whitespace-pre-wrap">{generatedContent}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
