import React, { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t border-white/10 bg-black/20">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Transmitting data..."
        className="flex-1 bg-black/40 border border-blue-500/30 rounded px-3 py-2 text-sm text-blue-100 placeholder-blue-300/30 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all font-mono"
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-600/30 hover:bg-blue-500/50 border border-blue-400 text-blue-100 rounded text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
