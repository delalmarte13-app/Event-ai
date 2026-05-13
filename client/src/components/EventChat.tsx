import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Props {
  eventId: number;
}

export default function EventChat({ eventId }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: messages, isLoading } = trpc.chat.getMessages.useQuery(
    { eventId, limit: 100 },
    { refetchInterval: 3000 }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate({ eventId });
      setMessage("");
    },
    onError: () => toast.error("Error al enviar el mensaje"),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({ eventId, content: message.trim() });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Hoy";
    if (d.toDateString() === yesterday.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  if (messages) {
    let currentDate = "";
    for (const msg of messages) {
      const date = formatDate(msg.createdAt);
      if (date !== currentDate) {
        currentDate = date;
        groupedMessages.push({ date, messages: [msg] });
      } else {
        groupedMessages[groupedMessages.length - 1]?.messages?.push(msg);
      }
    }
  }

  return (
    <div className="flex flex-col h-[600px] glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-sky-400/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Chat del evento</h3>
          <p className="text-xs text-muted-foreground">Mensajes privados entre participantes</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Sé el primero en escribir en este chat
            </p>
          </div>
        ) : (
          groupedMessages.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground px-2">{date}</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {dayMsgs?.map((msg, idx) => {
                const isOwn = msg.senderId === user?.id;
                const prevMsg = dayMsgs[idx - 1];
                const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className="w-7 flex-shrink-0">
                      {showAvatar && !isOwn && (
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={msg.senderAvatar ?? undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {(msg.senderName ?? "U").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                      {showAvatar && !isOwn && (
                        <span className="text-xs text-muted-foreground mb-1 ml-1">
                          {msg.senderName ?? "Usuario"}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-input border-border/60 flex-1"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
