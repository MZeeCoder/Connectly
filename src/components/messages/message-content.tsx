"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";

interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
}

export function MessageContent() {
    const [messages] = useState<Message[]>([
        { id: "1", text: "Hi there! How are you doing?", time: "10:00 AM", isMe: false },
        { id: "2", text: "I'm good, thanks! Just working on the new project.", time: "10:02 AM", isMe: true },
        { id: "3", text: "That sounds exciting! Need any help?", time: "10:05 AM", isMe: false },
        { id: "4", text: "Actually, yes. Could you review the latest designs?", time: "10:10 AM", isMe: true },
        { id: "5", text: "Sure thing, send them over.", time: "10:12 AM", isMe: false },
    ]);

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white relative">
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar
                            src=""
                            alt="Alice Freeman"
                            fallback="AF"
                            className="w-10 h-10 border border-slate-100"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">Alice Freeman</h2>
                        <p className="text-xs font-semibold text-green-500 uppercase tracking-tight">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <button className="p-2 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </button>
                    <button className="p-2 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                    </button>
                    <button className="p-2 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col max-w-[80%]",
                            msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "px-5 py-3 rounded-2xl text-[15px] font-medium leading-relaxed",
                                msg.isMe
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none"
                                    : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none"
                            )}
                        >
                            {msg.text}
                        </div>
                        <span className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {msg.time}
                        </span>
                    </div>
                ))}
            </main>

            {/* Footer Input */}
            <footer className="p-6 bg-white border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 p-2 focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
                    <div className="flex items-center gap-1">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 py-3"
                    />

                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
