import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your AI travel agent. Tell me where you want to go, your budget, travel dates, or any preferences — I'll help you find the best award redemptions.",
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    // Placeholder response — will be wired up to an agent
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: "Got it! I'm working on finding the best options for you — this feature is coming soon." },
      ]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#444444]">AI Travel Agent</h2>
        <p className="text-sm text-[#aaaaaa] mt-1">Describe your trip — I'll find the best award options</p>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#aaaaaa] text-white rounded-br-sm'
                  : 'bg-white border border-[#dddddd] text-[#555555] rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-[#dddddd] rounded-2xl flex items-end gap-3 p-3 mt-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I want to fly business class to Tokyo in May under 70k miles..."
          rows={2}
          className="flex-1 resize-none text-sm text-[#555555] placeholder:text-[#bbbbbb] focus:outline-none bg-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-[#aaaaaa] hover:bg-[#999999] disabled:bg-[#dddddd] text-white font-semibold px-4 py-2 rounded-xl text-sm transition shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
