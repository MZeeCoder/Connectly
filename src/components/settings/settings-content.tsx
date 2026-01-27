"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

export function SettingsContent() {
    const [switches, setSwitches] = useState({
        notifications: true,
    });

    const [appearance, setAppearance] = useState("system"); // light, dark, system

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <header className="px-8 py-10 max-w-3xl mx-auto w-full">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
                <div className="max-w-3xl mx-auto space-y-10">
                    {/* Account Section */}
                    <section>
                        <h2 className="text-base font-bold text-slate-900 mb-4 px-2">Account</h2>
                        <div className="bg-white border border-slate-100 rounded-4xl shadow-sm overflow-hidden p-8 space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl uppercase shadow-inner">
                                        JD
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">John Doe</h3>
                                        <p className="text-sm text-slate-400">@johndoe</p>
                                    </div>
                                </div>
                                <button className="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                                    Change Avatar
                                </button>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-900 ml-4 uppercase tracking-wider">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="John"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-900 ml-4 uppercase tracking-wider">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Doe"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-900 ml-4 uppercase tracking-wider">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    defaultValue="@johndoe"
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-900 ml-4 uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue="hello@example.com"
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <button className="w-fit bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]">
                                Save Changes
                            </button>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section>
                        <h2 className="text-base font-bold text-slate-900 mb-4 px-2">Preferences</h2>
                        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm divide-y divide-slate-50 overflow-hidden">
                            {/* Appearance */}
                            <div className="p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="12" cy="12" r="4" />
                                            <path d="M12 2v2" />
                                            <path d="M12 20v2" />
                                            <path d="M4.93 4.93l1.41 1.41" />
                                            <path d="M17.66 17.66l1.41 1.41" />
                                            <path d="M2 12h2" />
                                            <path d="M20 12h2" />
                                            <path d="M4.93 19.07l1.41-1.41" />
                                            <path d="M17.66 6.34l1.41-1.41" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-slate-900">Appearance</h4>
                                        <p className="text-[13px] text-slate-400">Customize look and feel</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                    <button
                                        onClick={() => setAppearance("light")}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            appearance === "light"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="12" cy="12" r="5" />
                                            <path d="M12 1v2" />
                                            <path d="M12 21v2" />
                                            <path d="M4.22 4.22l1.42 1.42" />
                                            <path d="M18.36 18.36l1.42 1.42" />
                                            <path d="M1 12h2" />
                                            <path d="M21 12h2" />
                                            <path d="M4.22 19.07l1.42-1.42" />
                                            <path d="M18.36 5.64l1.42-1.42" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setAppearance("dark")}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            appearance === "dark"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setAppearance("system")}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            appearance === "system"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <rect width="20" height="14" x="2" y="3" rx="2" />
                                            <line x1="8" x2="16" y1="21" y2="21" />
                                            <line x1="12" x2="12" y1="17" y2="21" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-slate-900">Notifications</h4>
                                        <p className="text-[13px] text-slate-400">Manage push notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setSwitches((prev) => ({ ...prev, notifications: !prev.notifications }))
                                    }
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative p-1",
                                        switches.notifications ? "bg-primary" : "bg-slate-200"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                            switches.notifications ? "translate-x-6" : "translate-x-0"
                                        )}
                                    />
                                </button>
                            </div>

                            {/* Privacy */}
                            <div className="p-6 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-slate-900">Privacy</h4>
                                        <p className="text-[13px] text-slate-400">Password and security</p>
                                    </div>
                                </div>
                                <button className="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                                    Manage
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Logout Section */}
                    <button className="w-full bg-red-50 text-red-500 py-4 rounded-[1.5rem] text-[15px] font-bold border border-red-100/50 hover:bg-red-100/80 transition-all flex items-center justify-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="rotate-180"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </main>
        </div>
    );
}
