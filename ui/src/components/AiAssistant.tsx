import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ArrowUpRight, Compass, Sparkles, Gift, ShoppingBag } from 'lucide-react';
import type { Lang } from '../lib/types';
import { products } from '../data/products';
import { formatPrice, productPath } from '../lib/products';
import { askGemini, type ChatMessage } from '../lib/gemini';

interface AiAssistantProps {
  lang?: Lang;
}

interface QuestionCard {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: 'bag' | 'sparkles' | 'compass' | 'gift';
}

const READY_QUESTIONS: Record<Lang, QuestionCard[]> = {
  ru: [
    {
      id: 'q1',
      title: 'Сумка на каждый день',
      subtitle: 'Подбор по практичности, форме и материалу',
      prompt: 'Посоветуй удобную и практичную сумку на каждый день',
      icon: 'bag',
    },
    {
      id: 'q2',
      title: 'О знаковой сумке ZARAFOT',
      subtitle: 'Размеры, мягкая красная кожа и посадка на плече',
      prompt: 'Расскажи подробнее о сумке ZARAFOT: размеры, кожа и особенности',
      icon: 'sparkles',
    },
    {
      id: 'q3',
      title: 'Вместительный рюкзак для города',
      subtitle: 'Кожа или деним для документов и вещей',
      prompt: 'Какой рюкзак лучше выбрать для города, работы и поездок?',
      icon: 'compass',
    },
    {
      id: 'q4',
      title: 'Идеи подарков мастерской',
      subtitle: 'Портмоне, аксессуары и сумки по бюджету',
      prompt: 'Что посоветуешь выбрать в подарок из коллекции Kanishka?',
      icon: 'gift',
    },
  ],
  uz: [
    {
      id: 'q1',
      title: 'Har kunga qulay sumka',
      subtitle: 'Shakl, qulaylik va material bo‘yicha tanlov',
      prompt: 'Har kunlik uchun qulay sumka tavsiya qiling',
      icon: 'bag',
    },
    {
      id: 'q2',
      title: 'ZARAFOT sumkasi haqida',
      subtitle: 'Yumshoq qizil charm, o‘lchamlar va detallar',
      prompt: 'ZARAFOT sumkasi haqida batafsil aytib bering',
      icon: 'sparkles',
    },
    {
      id: 'q3',
      title: 'Shahar uchun keng ryukzak',
      subtitle: 'Hujjatlar va safarlar uchun charm yoki denim',
      prompt: 'Shahar va ish uchun qanday ryukzak ma’qul?',
      icon: 'compass',
    },
    {
      id: 'q4',
      title: 'Sovg‘a uchun g‘oyalar',
      subtitle: 'Hamyonlar, aksessuarlar va sumkalar',
      prompt: 'Kanishka to‘plamidan sovg‘aga nima tanlashni maslahat berasiz?',
      icon: 'gift',
    },
  ],
  en: [
    {
      id: 'q1',
      title: 'Everyday shoulder bag',
      subtitle: 'Curated by comfort, form and daily essentials',
      prompt: 'Recommend a comfortable everyday bag from the collection',
      icon: 'bag',
    },
    {
      id: 'q2',
      title: 'About the iconic ZARAFOT bag',
      subtitle: 'Soft red leather drape, dimensions and features',
      prompt: 'Tell me more about the ZARAFOT bag: leather, size and fit',
      icon: 'sparkles',
    },
    {
      id: 'q3',
      title: 'Spacious city backpack',
      subtitle: 'Leather or denim for work, gear and commute',
      prompt: 'Which backpack is best for daily commute and travel?',
      icon: 'compass',
    },
    {
      id: 'q4',
      title: 'Atelier gift ideas',
      subtitle: 'Wallets, small leather goods and statement bags',
      prompt: 'What gift do you recommend from the Kanishka workshop?',
      icon: 'gift',
    },
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
    welcome: string;
  }
> = {
  ru: {
    btnLabel: 'Ассистент Kanishka',
    title: 'KANIШKA АССИСТЕНТ',
    subtitle: 'Консультант авторской мастерской',
    placeholder: 'Спросите о товаре или размере...',
    send: 'Отправить',
    welcome:
      'Я ассистент Kanishka! Готов посоветовать вам подходящую вещь или рассказать о товаре подробнее.\n\nЧто вас интересует — кожаная сумка, вместительный рюкзак или подарок?',
  },
  uz: {
    btnLabel: 'Kanishka yordamchisi',
    title: 'KANIШKA YORDAMCHI',
    subtitle: 'Ustaxona shaxsiy maslahatchisi',
    placeholder: 'Mahsulot yoki o‘lcham haqida...',
    send: 'Yuborish',
    welcome:
      'Men Kanishka yordamchisiman! Sizga mos buyum tanlashda yordam berishga yoki mahsulot haqida batafsil aytib berishga tayyorman.\n\nSizni nima qiziqtiradi — charm sumka, ryukzak yoki sovg‘a?',
  },
  en: {
    btnLabel: 'Kanishka Assistant',
    title: 'KANIШKA ASSISTANT',
    subtitle: 'Artisanal atelier advisor',
    placeholder: 'Ask about items or sizes...',
    send: 'Send',
    welcome:
      'I am Kanishka’s assistant! I’m ready to recommend the right piece or share more details about our handcrafted items.\n\nWhat are you looking for — a leather bag, a spacious backpack, or a thoughtful gift?',
  },
};

export default function AiAssistant({ lang = 'ru' }: AiAssistantProps) {
  const t = UI_TEXT[lang] || UI_TEXT.ru;
  const questionCards = READY_QUESTIONS[lang] || READY_QUESTIONS.ru;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          content: t.welcome,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      if (messages.length > 1) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => inputRef.current?.focus(), 150);

      // Lock body scroll on mobile
      if (typeof window !== 'undefined' && window.innerWidth <= 640) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }
  }, [isOpen, messages.length, isLoading]);

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
      const activeKey =
        (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GEMINI_API_KEY
          ? (import.meta.env.PUBLIC_GEMINI_API_KEY as string)
          : '') ||
        (typeof window !== 'undefined' ? localStorage.getItem('kanishka_gemini_api_key') : null) ||
        '';

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
          content:
            'Произошла небольшая заминка при связи. Задайте вопрос ещё раз или напишите нам в Telegram @kanishka_dsgn.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (type: QuestionCard['icon']) => {
    switch (type) {
      case 'bag':
        return <ShoppingBag size={18} />;
      case 'sparkles':
        return <Sparkles size={18} />;
      case 'compass':
        return <Compass size={18} />;
      case 'gift':
        return <Gift size={18} />;
      default:
        return <MessageCircle size={18} />;
    }
  };

  return (
    <div className={`ai-widget-container ${isOpen ? 'is-open' : ''}`} aria-label="Kanishka Assistant">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="ai-chat-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Trigger Button - Liquid Glassmorphism */}
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
                <MessageCircle size={18} strokeWidth={2} />
              </div>
              <div className="ai-header-titles">
                <h3>{t.title}</h3>
                <p className="ai-header-subtext">{t.subtitle}</p>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-icon-btn ai-close-btn"
                title="Закрыть"
                aria-label="Закрыть диалог"
                onClick={() => setIsOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-messages-area">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                <div className="ai-bubble">
                  {msg.content
                    .replace(/\*\*([^*]+)\*\*/g, '$1')
                    .replace(/\*([^*]+)\*/g, '$1')
                    .replace(/\*\*/g, '')}
                </div>

                {/* Initial Welcome Screen: Ready-made Question Cards in exact same card style */}
                {idx === 0 && messages.length === 1 && (
                  <div className="ai-questions-preview">
                    {questionCards.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        className="ai-product-chip ai-question-card"
                        onClick={() => handleSend(q.prompt)}
                      >
                        <div className="ai-question-icon" aria-hidden="true">
                          {renderIcon(q.icon)}
                        </div>
                        <div className="ai-product-details">
                          <div className="ai-product-name">{q.title}</div>
                          <div className="ai-product-meta">{q.subtitle}</div>
                        </div>
                        <span className="ai-product-link-btn" aria-hidden="true">
                          <ArrowUpRight size={17} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Subsequent Bot Messages: Product Recommendations if any */}
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
