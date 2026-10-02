import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendAIMessage } from "../../services/aiService";
import "./AIAssistant.css";

const QUICK_QUESTIONS = [
  "What are the common symptoms of fever?",
  "How can I maintain a healthy lifestyle?",
  "What is a blood test used for?",
  "How do I book a hospital appointment?",
];

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------------------------------------------
     Auto scroll to latest message
  --------------------------------------------- */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  /* ---------------------------------------------
     Focus input when chatbot opens
  --------------------------------------------- */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, isMinimized]);

  /* ---------------------------------------------
     Open chatbot
  --------------------------------------------- */
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  /* ---------------------------------------------
     Close chatbot
  --------------------------------------------- */
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  /* ---------------------------------------------
     Minimize chatbot
  --------------------------------------------- */
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  /* ---------------------------------------------
     Restore minimized chatbot
  --------------------------------------------- */
  const handleRestore = () => {
    setIsMinimized(false);
  };

  /* ---------------------------------------------
     Send message
  --------------------------------------------- */
  const handleSendMessage = async (customMessage = null) => {
    const text = (customMessage ?? message).trim();

    if (!text || isLoading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const data = await sendAIMessage(text);

      const aiResponse =
        typeof data?.response === "string"
          ? data.response
          : "Sorry, I couldn't process your request right now.";

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: aiResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content:
          error?.message ||
          "Sorry, something went wrong. Please try again.",
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------
     Enter key handler
  --------------------------------------------- */
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /* ---------------------------------------------
     Welcome message
  --------------------------------------------- */
  const showWelcome = messages.length === 0;

  return (
    <>
      {/* =====================================================
          FLOATING AI BUTTON
      ===================================================== */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            className="ai-floating-button"
            onClick={handleOpen}
            aria-label="Open AI Assistant"
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              y: 30,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.94,
            }}
          >
            <span className="ai-button-glow" />

            <motion.span
              className="ai-floating-icon"
              animate={{
                rotate: [0, -8, 8, -5, 5, 0],
                y: [0, -2, 0, -2, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <i className="bx bx-bot" />
            </motion.span>

            <span className="ai-online-dot" />

            <span className="ai-floating-tooltip">
              Ask AI Assistant
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* =====================================================
          MINIMIZED AI BUTTON
      ===================================================== */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            type="button"
            className="ai-minimized-button"
            onClick={handleRestore}
            aria-label="Restore AI Assistant"
            initial={{
              opacity: 0,
              scale: 0.7,
              y: 25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.7,
              y: 25,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 20,
            }}
            whileHover={{
              scale: 1.06,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <span className="ai-mini-icon">
              <i className="bx bx-bot" />
            </span>

            <span className="ai-mini-text">
              AI Assistant
            </span>

            {isLoading && (
              <span className="ai-mini-loading">
                <span />
                <span />
                <span />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.section
            className="ai-chat-window"
            initial={{
              opacity: 0,
              scale: 0.85,
              y: 35,
              transformOrigin: "bottom right",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              y: 35,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            aria-label="AI Assistant"
          >
            {/* =================================================
                HEADER
            ================================================= */}
            <div className="ai-chat-header">
              <div className="ai-header-left">
                <motion.div
                  className="ai-header-avatar"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(20, 184, 166, 0.25)",
                      "0 0 0 8px rgba(20, 184, 166, 0)",
                      "0 0 0 0 rgba(20, 184, 166, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                  }}
                >
                  <i className="bx bx-bot" />
                </motion.div>

                <div className="ai-header-info">
                  <div className="ai-header-title">
                    <span>AI Assistant</span>
                    <span className="ai-header-badge">
                      AI
                    </span>
                  </div>

                  <div className="ai-header-status">
                    <span className="ai-status-dot" />
                    <span>Online • Healthcare Assistant</span>
                  </div>
                </div>
              </div>

              <div className="ai-header-actions">
                <button
                  type="button"
                  onClick={handleMinimize}
                  aria-label="Minimize AI Assistant"
                  title="Minimize"
                >
                  <i className="bx bx-minus" />
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close AI Assistant"
                  title="Close"
                >
                  <i className="bx bx-x" />
                </button>
              </div>
            </div>

            {/* =================================================
                CHAT BODY
            ================================================= */}
            <div className="ai-chat-body">
              {/* Background decoration */}
              <div className="ai-body-decoration ai-decoration-one" />
              <div className="ai-body-decoration ai-decoration-two" />

              {showWelcome ? (
                <motion.div
                  className="ai-welcome-container"
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                  }}
                >
                  <motion.div
                    className="ai-welcome-avatar"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="ai-welcome-icon">
                      <i className="bx bx-bot" />
                    </div>

                    <span className="ai-welcome-sparkle sparkle-one">
                      ✦
                    </span>

                    <span className="ai-welcome-sparkle sparkle-two">
                      ✦
                    </span>
                  </motion.div>

                  <h2>
                    Hello! 👋
                  </h2>

                  <h3>
                    I'm your AI Healthcare Assistant
                  </h3>

                  <p>
                    Ask me about symptoms, medicines,
                    medical tests, healthy lifestyle,
                    hospital services, appointments and
                    more.
                  </p>

                  <div className="ai-welcome-note">
                    <i className="bx bx-shield-quarter" />
                    <span>
                      For educational guidance only.
                      Always consult a qualified healthcare
                      professional for medical decisions.
                    </span>
                  </div>

                  <div className="ai-quick-section">
                    <span className="ai-quick-label">
                      <i className="bx bx-bulb" />
                      Try asking
                    </span>

                    <div className="ai-quick-list">
                      {QUICK_QUESTIONS.map((question, index) => (
                        <motion.button
                          key={question}
                          type="button"
                          className="ai-quick-question"
                          onClick={() =>
                            handleSendMessage(question)
                          }
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: 0.12 + index * 0.07,
                          }}
                          whileHover={{
                            x: 3,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                        >
                          <span>{question}</span>
                          <i className="bx bx-right-arrow-alt" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="ai-messages">
                  <AnimatePresence initial={false}>
                    {messages.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`ai-message-row ${
                          item.role === "user"
                            ? "ai-user-row"
                            : "ai-assistant-row"
                        }`}
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                      >
                        {item.role === "assistant" && (
                          <div className="ai-message-avatar">
                            <i className="bx bx-bot" />
                          </div>
                        )}

                        <div
                          className={`ai-message-bubble ${
                            item.role === "user"
                              ? "ai-user-bubble"
                              : "ai-assistant-bubble"
                          } ${
                            item.isError
                              ? "ai-error-bubble"
                              : ""
                          }`}
                        >
                          {item.role === "assistant" && (
                            <span className="ai-message-label">
                              AI Assistant
                            </span>
                          )}

                          <p>{item.content}</p>
                        </div>

                        {item.role === "user" && (
                          <div className="ai-user-avatar">
                            <i className="bx bx-user" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* =========================================
                      TYPING INDICATOR
                  ========================================= */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        className="ai-message-row ai-assistant-row"
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                      >
                        <div className="ai-message-avatar">
                          <i className="bx bx-bot" />
                        </div>

                        <div className="ai-typing-bubble">
                          <span className="ai-typing-text">
                            Thinking
                          </span>

                          <span className="ai-typing-dots">
                            <span />
                            <span />
                            <span />
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* =================================================
                INPUT AREA
            ================================================= */}
            <div className="ai-chat-input-area">
              <div className="ai-input-wrapper">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about healthcare..."
                  rows={1}
                  disabled={isLoading}
                  aria-label="Message AI Assistant"
                />

                <motion.button
                  type="button"
                  className="ai-send-button"
                  onClick={() => handleSendMessage()}
                  disabled={
                    !message.trim() || isLoading
                  }
                  aria-label="Send message"
                  whileHover={
                    message.trim() && !isLoading
                      ? { scale: 1.06 }
                      : {}
                  }
                  whileTap={
                    message.trim() && !isLoading
                      ? { scale: 0.92 }
                      : {}
                  }
                >
                  {isLoading ? (
                    <i className="bx bx-loader-alt bx-spin" />
                  ) : (
                    <i className="bx bxs-send" />
                  )}
                </motion.button>
              </div>

              <div className="ai-input-footer">
                <span>
                  <i className="bx bx-lock-alt" />
                  Your conversation is secure
                </span>

                <span>
                  Press <b>Enter</b> to send
                </span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;