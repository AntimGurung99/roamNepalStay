import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiAPI } from "../api/axios";
import "../styles/HomeAIChat.css";
import { TbMessageChatbotFilled } from "react-icons/tb";

const HomeAIChat = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [reply, setReply] = useState("");
  const [suggestedPlace, setSuggestedPlace] = useState("");
  const [buttonText, setButtonText] = useState("");

  // ✅ UPDATED FUNCTION (clean + safe)
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const response = await aiAPI.homeChat(message);

      setReply(response.data.reply || "");
      setSuggestedPlace(response.data.suggested_place || "");
      setButtonText(response.data.button_text || "");
    } catch (error) {
      console.error("AI error:", error);
      setReply("AI failed. Try again.");
      setSuggestedPlace("");
      setButtonText("");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to explore page
  const goToSuggestedPlace = () => {
    if (!suggestedPlace) return;

    navigate(`/explore-map?search=${encodeURIComponent(suggestedPlace)}`);
  };

  return (
    <>
      {/* Floating Button */}
      <button className="ai-chat-fab" onClick={() => setOpen(!open)}>
        Ask AI <TbMessageChatbotFilled />
      </button>

      {/* Popup */}
      {open && (
        <div className="ai-chat-popup">
          {/* Header */}
          <div className="ai-chat-header">
            <h4>RoamNepal AI</h4>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          {/* Body */}
          <div className="ai-chat-body">
            <p className="ai-helper-text">
              Ask me where you should go in Nepal.
            </p>

            {/* Quick Suggestions */}
            <div className="ai-chip-row">
              <button
                onClick={() => {
                  setMessage("I want a peaceful getaway");
                  setReply("");
                }}
              >
                Peaceful getaway
              </button>

              <button
                onClick={() => {
                  setMessage("Suggest a mountain view place");
                  setReply("");
                }}
              >
                Mountain view
              </button>

              <button
                onClick={() => {
                  setMessage("I want a jungle stay");
                  setReply("");
                }}
              >
                Jungle stay
              </button>
            </div>

            {/* Input */}
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type something like: I want a peaceful stay for couples"
            />

            {/* Send Button */}
            <button
              className="ai-send-btn"
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send"}
            </button>

            {/* AI Response */}
            {reply && (
              <div className="ai-reply-box">
                <p>{reply}</p>

                {suggestedPlace && (
                  <button
                    className="ai-explore-btn"
                    onClick={goToSuggestedPlace}
                  >
                    {buttonText || `Explore ${suggestedPlace}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HomeAIChat;