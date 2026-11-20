import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Key, ChevronRight } from 'lucide-react';
import type { Lang } from '../lib/types';
import { products } from '../data/products';
import { formatPrice, productPath } from '../lib/products';
import { askGemini, type ChatMessage } from '../lib/gemini';

interface AiAssistantProps {
  lang?: Lang;
}

const QUICK_PROMPTS: Record<Lang, string[]> = {
  ru: [
    'Сумка на каждый день',
    'Кожаный рюкзак',
    'Особенности сумки ZARAFOT',
    'Подарок до 600 000 сум',
  ],
  uz: [
    'Har kunga sumka',
    'Charm ryukzak',
    'ZARAFOT sumkasi haqida',
    'Sovg‘a 600 000 so‘mgacha',
  ],
  en: [
    'Everyday shoulder bag',
    'Leather backpack',
    'Tell me about ZARAFOT',
    'Gift ideas under 600,000 UZS',
  ],
};

const UI_TEXT: Record<
  Lang,
  {
    btnLabel: string;
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    settingsHint: string;
    keyPlaceholder: string;
    saveKey: string;
    saved: string;
    welcome: string;
    geminiLive: string;
    offlineMode: string;
    viewProduct: string;
  }
> = {
  ru: {
    btnLabel: 'Подбор сумок',
    title: 'Консультант Kanishka',
    subtitle: 'AI-подбор сумок и рюкзаков',
    placeholder: 'Спросите о сумке, размере или материале...',
    send: 'Отправить',
    settingsHint: 'Для живого ИИ от Google подключите Gemini API Key (или укажите PUBLIC_GEMINI_API_KEY в .env):',
    keyPlaceholder: 'Вставьте ваш AI Studio ключ (AIza...)',
    saveKey: 'Сохранить',
    saved: 'Сохранено!',
    welcome:
      'Здравствуйте! Я помогу подобрать авторскую сумку или рюкзак Kanishka. Расскажите, что вы ищете — на каждый день, в дорогу или в подарок?',
    geminiLive: 'Gemini AI активен',
    offlineMode: 'Локальный советник',
    viewProduct: 'Рассмотреть',
  },
  uz: {
    btnLabel: 'Sumkalar tanlovi',
    title: 'Kanishka maslahatchisi',
    subtitle: 'Sumkalar va ryukzaklar tanlovi',
    placeholder: 'Sumka, o‘lcham yoki material haqida so‘rang...',
    send: 'Yuborish',
    settingsHint: 'Google jonli sun’iy intellekti uchun Gemini API kalitini kiriting:',
    keyPlaceholder: 'API kalitni kiriting (AIza...)',
    saveKey: 'Saqlash',
    saved: 'Saqlandi!',
    welcome:
      'Assalomu alaykum! Kanishka to‘plamidan sumka yoki ryukzak tanlashda yordam beraman. Har kunlik, safar yoki sovg‘a uchun nima qidiryapsiz?',
    geminiLive: 'Gemini AI faol',
    offlineMode: 'Lokal maslahatchi',
    viewProduct: 'Ko‘rish',
  },
  en: {
    btnLabel: 'Bag Advisor',
    title: 'Kanishka Advisor',
    subtitle: 'Artisanal bags & backpacks',
    placeholder: 'Ask about sizes, styles, or materials...',
    send: 'Send',
    settingsHint: 'Connect your Gemini API Key to enable live Google Gemini intelligence:',
    keyPlaceholder: 'Paste your AI Studio Key (AIza...)',
    saveKey: 'Save',
    saved: 'Saved!',
    welcome:
      'Hello! I can guide you through Kanishka’s handcrafted bags and backpacks. Are you looking for an everyday companion, a travel piece, or a thoughtful gift?',
    geminiLive: 'Gemini AI Live',
    offlineMode: 'Curated Advisor',
    viewProduct: 'Inspect',
  },
};

export default function AiAssistant({ lang = 'ru' }: AiAssistantProps) {
  const t = UI_TEXT[lang] || UI_TEXT.ru;
  const quickPrompts = QUICK_PROMPTS[lang] || QUICK_PROMPTS.ru;

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keySavedBadge, setKeySavedBadge] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize keys and welcome message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('kanishka_gemini_api_key') || '';
      const envKey =
        typeof import.meta !== 'undefined' && import.meta.env
          ? (import.meta.env.PUBLIC_GEMINI_API_KEY as string) || ''
          : '';

      if (storedKey) {
        setApiKey(storedKey);
        setKeyInput(storedKey);
      }
      if (envKey) {
        setHasEnvKey(true);
      }

      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          content: t.welcome,
          suggestedProductIds: ['kan-002', 'kan-001', 'kan-007'],
          timestamp: Date.now(),
        },
      ]);
    }
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSaveKey = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    setApiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('kanishka_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('kanishka_gemini_api_key');
      }
    }
    setKeySavedBadge(true);
    setTimeout(() => {
      setKeySavedBadge(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const activeKey = apiKey || (hasEnvKey ? (import.meta.env.PUBLIC_GEMINI_API_KEY as string) : '');
      const reply = await askGemini(newHistory, promptText, lang, activeKey);

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: reply.text,
        suggestedProductIds: reply.suggestedProductIds,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: 'Произошла небольшая заминка при связи. Попробуйте еще раз или напишите нам в Telegram @kanishka_dsgn.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isGeminiActive = Boolean(apiKey || hasEnvKey);

  return (
    <div className="ai-widget-container" aria-label="Kanishka Bag Advisor Widget">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-controls="ai-chat-window"
        >
          <span className="ai-trigger-icon" aria-hidden="true">
            <Sparkles size={15} />
          </span>
          <span className="ai-trigger-label">{t.btnLabel}</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div id="ai-chat-window" className="ai-chat-window" role="dialog" aria-modal="false">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-header-badge" aria-hidden="true">
                <Sparkles size={18} />
              </div>
              <div className="ai-header-titles">
                <h3>{t.title}</h3>
                <p>{t.subtitle}</p>
                <div className="ai-status-pill">
                  <span className={`ai-status-dot ${isGeminiActive ? 'active' : ''}`} />
                  <span>{isGeminiActive ? t.geminiLive : t.offlineMode}</span>
                </div>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-icon-btn"
                title="Gemini API Key"
                aria-label="Настройки Gemini API"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Key size={17} />
              </button>
              <button
                type="button"
                className="ai-icon-btn"
                title="Закрыть"
                aria-label="Закрыть чат"
                onClick={() => setIsOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Settings Drawer */}
          {showSettings && (
            <div className="ai-settings-drawer">
              <p>{t.settingsHint}</p>
              <form onSubmit={handleSaveKey} className="ai-settings-input-group">
                <input
                  type="password"
                  className="ai-settings-input"
                  placeholder={t.keyPlaceholder}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <button type="submit" className="ai-settings-save">
                  {keySavedBadge ? t.saved : t.saveKey}
                </button>
              </form>
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                <div className="ai-bubble">{msg.content}</div>

                {/* Suggested Products Preview */}
                {msg.suggestedProductIds && msg.suggestedProductIds.length > 0 && (
                  <div className="ai-products-preview">
                    {msg.suggestedProductIds.map((prodId) => {
                      const prod = products.find((p) => p.id === prodId);
                      if (!prod) return null;
                      const title = prod.title[lang] || prod.title.ru;
                      const path = productPath(prod, lang);
                      const thumb = prod.images[0] || '/assets/images/latest-00.jpg';

                      return (
                        <a
                          key={prod.id}
                          href={path}
                          className="ai-product-chip"
                          title={`${title} — ${formatPrice(prod.priceUZS, lang)} сум`}
                        >
                          <img src={thumb} alt={title} className="ai-product-thumb" loading="lazy" />
                          <div className="ai-product-details">
                            <div className="ai-product-name">{prod.name}</div>
                            <div className="ai-product-price">
                              {formatPrice(prod.priceUZS, lang)} сум
                            </div>
                          </div>
                          <ChevronRight size={16} className="ai-product-arrow" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ai-message model">
                <div className="ai-typing-indicator" aria-label="AI думает...">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="ai-quick-prompts">
              {quickPrompts.map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  className="ai-chip-btn"
                  onClick={() => handleSend(promptText)}
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            className="ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ai-send-btn"
              title={t.send}
              aria-label={t.send}
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
