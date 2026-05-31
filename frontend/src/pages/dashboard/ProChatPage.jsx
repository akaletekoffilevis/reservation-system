import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';

export default function ProChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  const scrollToBottom = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    api.get('/chat/professional').then(({ data }) => setConversations(data)).catch(() => {});
  }, []);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    const { data } = await api.get(`/chat/${conv.id}/messages`);
    setMessages(data);
    await api.put(`/chat/${conv.id}/read`);
    conv.unreadCount = 0;
    setConversations([...conversations]);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    const { data } = await api.post(`/chat/${activeConv.id}/messages`, { content: input });
    setMessages([...messages, data]);
    setInput('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') sendMessage(); };

  return (
    <div className="flex h-[calc(100vh-8rem)] p-4 gap-4">
      <div className="w-72 bg-white rounded-xl border shadow-sm overflow-y-auto shrink-0">
        <div className="p-3 border-b font-semibold bg-gray-50">Conversations</div>
        {conversations.map(conv => (
          <div key={conv.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${activeConv?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            onClick={() => openConversation(conv)}>
            <p className="font-medium text-sm truncate">{conv.clientName || 'Client'}</p>
            <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Aucun message'}</p>
            {conv.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{conv.unreadCount}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col">
        {activeConv ? (
          <>
            <div className="p-3 border-b font-medium bg-gray-50">{activeConv.clientName || 'Client'}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'Professional' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'Professional' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    <p className={`text-xs mt-1 ${msg.sender === 'Professional' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={sendMessage} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition">
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Sélectionnez une conversation</div>
        )}
      </div>
    </div>
  );
}
