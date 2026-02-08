import React from 'react';

const ChatMessage = ({ message, isSelf }) => {
  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} mb-4`}>
      <div className={`max-w-[80%] p-3 rounded-lg border backdrop-blur-sm ${
        isSelf 
          ? 'bg-blue-500/20 border-blue-400/50 text-blue-50' 
          : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-50'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold opacity-70">{message.user}</span>
          {message.role && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">
              {message.role}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed font-mono break-words">{message.text}</p>
        <span className="text-[10px] opacity-40 mt-1 block text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
