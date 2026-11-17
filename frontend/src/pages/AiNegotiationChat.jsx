import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { FALLBACK_ANKARA_IMAGE, API_BASE_URL } from "../utils/constants";
import KiosqLogo from "../components/KiosqLogo";

export default function AiNegotiationChat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [searchParams] = useSearchParams();
  const initialOffer = searchParams.get("offer") || "22000";

  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}/api/v1/products/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setProduct(data);
        })
        .catch(() => {});
    }
  }, [id]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "buyer",
      text: `Hello Mama Tola, I saw this on your WhatsApp Status! Can you do ₦${Number(
        initialOffer
      ).toLocaleString()} for 6 yards?`,
      time: "Just now",
    },
    {
      id: 2,
      sender: "ai",
      text: `E kaabo! Mama Tola dey online. Genuine Grade A Super Wax Hollandais quality be this o, ₦${Number(
        initialOffer
      ).toLocaleString()} dey a bit low for 6 yards. But because say na from WhatsApp you come, my last card for you na ₦24,500 with same-day dispatch! How you see am?`,
      time: "Just now",
      badge: "Kiosq AI Negotiator (Mama Tola's Rep)",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("24500");
  const [isLocked, setIsLocked] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newBuyerMsg = {
      id: Date.now(),
      sender: "buyer",
      text: inputText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, newBuyerMsg]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Oya deal locked! ₦23,500 done set. I don hold this deal for you. Make you pay into Kiosq Escrow now so mama fit package am for delivery person immediately!",
          time: "Just now",
          badge: "Deal Accepted • Escrow Unlocked",
        },
      ]);
      setAgreedPrice("23500");
      setIsLocked(true);
    }, 1000);
  };

  const handleAcceptOffer = (price) => {
    setAgreedPrice(price);
    setIsLocked(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "system",
        text: `Deal agreed at ₦${Number(price).toLocaleString()}! Funds will be held in safe escrow.`,
        time: "Just now",
      },
    ]);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-2xl px-4 sm:px-6 py-4 flex flex-col h-[100dvh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-2.5">
            <Link
              to="/product/ankara-wax"
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
              <KiosqLogo className="h-7 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="flex flex-col">
              <h2 className="text-label-md font-bold text-on-surface leading-tight">
                Mama Tola Textiles
              </h2>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Kiosq Bargaining Bot (Rep for Mama Tola) 🤖
              </span>
            </div>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Product Context Strip */}
        <div className="bg-surface-container-lowest p-3 my-2 rounded-DEFAULT flex items-center justify-between shadow-xs border border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={product?.imageUrl || FALLBACK_ANKARA_IMAGE}
              alt={product?.title || "Product"}
              className="w-11 h-11 rounded-md object-cover"
            />
            <div className="flex flex-col">
              <h3 className="text-label-md font-bold text-on-surface">
                {product?.title || "Authentic Ankara Wax Print (6 Yards)"}
              </h3>
              <span className="text-body-sm text-on-surface-variant">
                Asking: {product?.askingPrice ? `₦${Number(product.askingPrice).toLocaleString()}` : "₦28,000"} • Floor protected
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-label-sm font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
              Escrow Ready
            </span>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "buyer"
                  ? "self-end items-end"
                  : msg.sender === "system"
                  ? "self-center items-center max-w-full my-2"
                  : "self-start items-start"
              }`}
            >
              {msg.badge && (
                <span className="text-[11px] font-bold text-secondary mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">smart_toy</span>
                  {msg.badge}
                </span>
              )}

              <div
                className={`p-3.5 rounded-2xl text-body-md ${
                  msg.sender === "buyer"
                    ? "bg-primary text-on-primary rounded-br-xs shadow-xs"
                    : msg.sender === "system"
                    ? "bg-secondary-container text-on-secondary-container font-bold text-center text-xs py-2 px-4 rounded-full"
                    : "bg-surface-container-lowest text-on-surface rounded-bl-xs shadow-xs border border-outline-variant/30"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {/* Quick Counter-Offer Chips if not locked */}
          {!isLocked && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-label-sm text-on-surface-variant font-bold">
                Quick Haggling Responses:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAcceptOffer("24500")}
                  className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold flex items-center gap-1 hover:brightness-95 cursor-pointer"
                >
                  <span>Accept ₦24,500</span>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                </button>
                <button
                  onClick={() => setInputText("Can you do ₦23,000 and I pay right now?")}
                  className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-label-sm font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Counter with ₦23,000
                </button>
                <button
                  onClick={() => setInputText("What if I buy 2 bundles?")}
                  className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-label-sm font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Bundle discount?
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Area */}
        <div className="pt-2 border-t border-surface-container-high shrink-0 flex flex-col gap-2">
          {/* If Deal is locked, show Escrow Checkout CTA */}
          {isLocked ? (
            <button
              onClick={() => navigate(`/escrow/order-4821?price=${agreedPrice}`)}
              className="w-full h-13 rounded-full bg-primary text-on-primary text-headline-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Lock &amp; Pay ₦{Number(agreedPrice).toLocaleString()} into Escrow</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message or offer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 h-12 px-4 rounded-full bg-surface-container border border-outline-variant/40 text-body-md text-on-surface focus:outline-primary"
              />
              <button
                onClick={handleSendMessage}
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-neutral-800 cursor-pointer shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
