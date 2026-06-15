import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, CheckCheck, Clock } from 'lucide-react';
import './ChatWidget.css';

const BOT_DELAY = 900; // ms before bot auto-replies

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: 'bot',
    text: '👋 Hi there! Welcome to **SafeHive**. How can we help you today?',
    time: new Date(),
  },
];

const AUTO_REPLIES = [
  "Thanks for reaching out! One of our security experts will get back to you shortly. You can also call us at **+251 923 55 55 54**.",
  "Great question! Our team will review your message and reply as soon as possible — usually within a few hours.",
  "We appreciate you contacting SafeHive! A specialist will follow up with you very soon. 🔒",
];
let replyIndex = 0;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderText(text) {
  // Bold **text**
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Pulse the button after 6 seconds if not opened
  useEffect(() => {
    const t = setTimeout(() => setBounce(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: 'user', text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = AUTO_REPLIES[replyIndex % AUTO_REPLIES.length];
      replyIndex++;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: reply, time: new Date() },
      ]);
      setTyping(false);
    }, BOT_DELAY);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div className={`chat-widget-panel ${open ? 'chat-open' : ''}`}>
        {/* Header */}
        <div className="chat-widget-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <img src="/assets/safehive.png" alt="SafeHive" />
              <span className="chat-status-dot" />
            </div>
            <div>
              <p className="chat-header-name">SafeHive Support</p>
              <p className="chat-header-status">🟢 Online — replies instantly</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg-row ${msg.from === 'user' ? 'user-row' : 'bot-row'}`}>
              {msg.from === 'bot' && (
                <div className="chat-msg-avatar">
                  <img src="/assets/safehive.png" alt="bot" />
                </div>
              )}
              <div className={`chat-bubble ${msg.from === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                <p>{renderText(msg.text)}</p>
                <span className="chat-time">
                  {formatTime(msg.time)}
                  {msg.from === 'user' && <CheckCheck size={13} className="chat-tick" />}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="chat-msg-row bot-row">
              <div className="chat-msg-avatar">
                <img src="/assets/safehive.png" alt="bot" />
              </div>
              <div className="chat-bubble bubble-bot typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
            onClick={sendMessage}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="chat-footer-note">
          Powered by <strong>SafeHive</strong> · We typically reply in minutes
        </p>
      </div>

      {/* Floating Bubble */}
      <button
        className={`chat-fab ${bounce ? 'chat-fab-bounce' : ''} ${open ? 'chat-fab-open' : ''}`}
        onClick={() => { setOpen((v) => !v); setBounce(false); }}
        aria-label="Open live chat"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
        {!open && unread > 0 && <span className="chat-unread-badge">{unread}</span>}
      </button>
    </>
  );
}
