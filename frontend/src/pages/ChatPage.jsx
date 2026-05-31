import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button, Card, Input } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ChatPage() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

  const scrollToBottom = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }
    api.get(`/chat/${conversationId}/messages`).then(({ data }) => {
      setMessages(data);
      setConv({ id: parseInt(conversationId) });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startConversation = async () => {
    const { data } = await api.post('/chat/start', {
      professionalId: parseInt(searchParams.get('pro')),
      clientName: searchParams.get('name') || 'Client',
      clientEmail: searchParams.get('email') || 'client@example.com',
      message: input,
    });
    setConv(data);
    setMessages([{ id: Date.now(), content: input, sender: 'Client', createdAt: new Date().toISOString() }]);
    setInput('');
    window.history.replaceState(null, '', `/chat/${data.id}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || !conv) return;
    const { data } = await api.post(`/chat/${conv.id}/messages`, { content: input });
    setMessages([...messages, data]);
    setInput('');
  };

  if (loading) return <PageLoader />;

  if (!conv) {
    return (
      <div className="max-w-lg mx-auto p-6 animate-fade-in">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Contacter un professionnel</h1>
          <p className="text-gray-600 mb-6">Envoyez votre premier message pour démarrer la conversation.</p>
          <textarea className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 mb-3" rows={3}
            placeholder="Votre message..." value={input} onChange={(e) => setInput(e.target.value)} />
          <Button variant="primary" onClick={startConversation}>Envoyer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <Card className="h-[60vh] flex flex-col overflow-hidden">
        <div className="p-3 border-b font-medium bg-gray-50">Discussion</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'Professional' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                msg.sender === 'Professional' ? 'bg-gray-100 rounded-bl-sm' : 'bg-brand-600 text-white rounded-br-sm'
              }`}>
                {msg.content}
                <p className={`text-xs mt-1 ${msg.sender === 'Professional' ? 'text-gray-400' : 'text-brand-200'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>
        <div className="p-3 border-t flex gap-2">
          <input className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Votre message..." value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <Button variant="primary" onClick={sendMessage}>Envoyer</Button>
        </div>
      </Card>
    </div>
  );
}
