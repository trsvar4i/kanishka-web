import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Key, ArrowUpRight } from 'lucide-react';
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
    'Расскажи про сумку ZARAFOT',
    'Что выбрать в подарок?',
  ],
  uz: [
    'Har kunga sumka',
    'Charm ryukzak',
    'ZARAFOT sumkasi haqida',
    'Sovg‘aga nima bor?',
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
    inspect: string;
  }
> = {
  ru: {
    btnLabel: 'Ассистент Kanishka',
    title: 'KANIШKA · АССИСТЕНТ',
    subtitle: 'Консультант авторской мастерской',
    placeholder: 'Спросите о товаре, размере или материале...',
    send: 'Отправить',
    settingsHint: 'Подключите Gemini API Key для живого диалога с Google Gemini (или укажите PUBLIC_GEMINI_API_KEY в .env):',
    keyPlaceholder: 'Вставьте ваш AI Studio ключ (AIza...)',
    saveKey: 'Сохранить',
    saved: 'Сохранено!',
    welcome:
      'Я ассистент Kanishka! Готов посоветовать вам подходящую вещь или рассказать о товаре подробнее.\n\nЧто вас интересует — кожаная сумка, вместительный рюкзак или подарок?',
    geminiLive: 'Gemini AI',
    offlineMode: 'Мастерская',
    inspect: 'Рассмотреть',
  },
  uz: {
    btnLabel: 'Kanishka yordamchisi',
    title: 'KANIШKA · YORDAMCHI',
    subtitle: 'Ustaxona shaxsiy maslahatchisi',
    placeholder: 'Mahsulot, o‘lcham yoki material haqida so‘rang...',
    send: 'Yuborish',
    settingsHint: 'Google Gemini jonli sun’iy intellekti uchun API kalitingizni kiriting:',
    keyPlaceholder: 'API kalit (AIza...)',
    saveKey: 'Saqlash',
    saved: 'Saqlandi!',
    welcome:
      'Men Kanishka yordamchisiman! Sizga mos buyum tanlashda yordam berishga yoki mahsulot haqida batafsil aytib berishga tayyorman.\n\nSizni nima qiziqtiradi — charm sumka, ryukzak yoki sovg‘a?',
    geminiLive: 'Gemini AI',
    offlineMode: 'Ustaxona',
    inspect: 'Ko‘rish',
  },
  en: {
    btnLabel: 'Kanishka Assistant',
    title: 'KANIШKA · ASSISTANT',
    subtitle: 'Artisanal atelier advisor',
    placeholder: 'Ask about items, sizes, or materials...',
    send: 'Send',
    settingsHint: 'Connect your Gemini API Key to enable live conversational AI:',
    keyPlaceholder: 'Paste your AI Studio Key (AIza...)',
    saveKey: 'Save',
    saved: 'Saved!',
    welcome:
      'I am Kanishka’s assistant! I’m ready to recommend the right piece or share more details about our handcrafted items.\n\nWhat are you looking for — a leather bag, a spacious backpack, or a thoughtful gift?',
    geminiLive: 'Gemini AI',
    offlineMode: 'Atelier',
    inspect: 'View item',
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
          content: 'Произошла небольшая заминка при связи. Задайте вопрос ещё раз или напишите нам в Telegram @kanishka_dsgn.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isGeminiActive = Boolean(apiKey || hasEnvKey);

  return (
    <div className="ai-widget-container" aria-label="Kanishka Assistant">
      {/* Floating Trigger Button - Bright Red Brand Pill with Chat Icon */}
      {!isOpen && (
        <button
          type="button"
          className="ai-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-controls="ai-chat-window"
        >
          <span className="ai-trigger-icon" aria-hidden="true">
            <MessageCircle size={20} strokeWidth={2.2} />
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
                <MessageCircle size={19} strokeWidth={2.2} />
              </div>
              <div className="ai-header-titles">
                <h3>{t.title}</h3>
                <div className="ai-header-subrow">
                  <span className="ai-header-subtext">{t.subtitle}</span>
                  <span className="ai-status-divider">·</span>
                  <span className="ai-status-pill">
                    <span className={`ai-status-dot ${isGeminiActive ? 'active' : ''}`} />
                    <span>{isGeminiActive ? t.geminiLive : t.offlineMode}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-icon-btn"
                title="Настройки Gemini API"
                aria-label="Настройки Gemini API"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Key size={16} />
              </button>
              <button
                type="button"
                className="ai-icon-btn"
                title="Закрыть"
                aria-label="Закрыть диалог"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
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

                {/* Product Recommendations */}
                {msg.suggestedProductIds && msg.suggestedProductIds.length > 0 && (
                  <div className="ai-products-preview">
                    {msg.suggestedProductIds.map((prodId) => {
                      const prod = products.find((p) => p.id === prodId);
                      if (!prod) return null;
                      const title = prod.title[lang] || prod.title.ru;
                      const path = productPath(prod, lang);
                      const thumb = prod.images[0] || '/assets/images/latest-00.jpg';
                      const materialName =
                        prod.material === 'leather'
                          ? 'Натуральная кожа'
                          : prod.material === 'textile'
                          ? 'Канвас / Деним'
                          : 'Материал мастерской';

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
                            <div className="ai-product-meta">
                              <span>{materialName}</span>
                              {prod.specs.dimensions && prod.specs.dimensions !== '—' && (
                                <>
                                  <span className="ai-meta-dot">·</span>
                                  <span>{prod.specs.dimensions}</span>
                                </>
                              )}
                            </div>
                            <div className="ai-product-price">
                              {formatPrice(prod.priceUZS, lang)} сум
                            </div>
                          </div>
                          <span className="ai-product-link-btn" aria-hidden="true">
                            <ArrowUpRight size={17} />
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="ai-message model">
                <div className="ai-typing-indicator" aria-label="Печатает ответ...">
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
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
