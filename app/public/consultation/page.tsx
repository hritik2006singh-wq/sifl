'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { SelectInput } from '@/components/SelectInput';
import { ToggleOption } from '@/components/ToggleOption';
import { CalendarSelector } from '@/components/CalendarSelector';
import { bookingContent } from '@/content/booking';

export default function ConsultationPage() {
    const [meetingType, setMeetingType] = useState(bookingContent.form.meetingTypes[0].id);
    const [language, setLanguage] = useState(bookingContent.form.languages[0].value);
    const [level, setLevel] = useState(bookingContent.form.levels[0].value);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [objective, setObjective] = useState('');

    return (
        <main className="pt-24 pb-24 bg-slate-50 min-h-screen">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">

                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Book Your Free Demo</h1>
                    <p className="text-slate-600 max-w-xl mx-auto text-lg leading-relaxed">
                        Take the first structured step toward your global career. Select a time below to map out your language proficiency roadmap.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT SIDE: FORM */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 md:p-10 shadow-sm border border-slate-100 bg-white">
                            <h2 className="text-2xl font-bold mb-8 text-slate-800">Demo Details</h2>

                            <div className="mb-8">
                                <label className="block mb-3 text-sm font-bold text-slate-700">Meeting Format</label>
                                <ToggleOption
                                    options={bookingContent.form.meetingTypes}
                                    selectedId={meetingType}
                                    onChange={setMeetingType}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <SelectInput
                                    label="Target Language"
                                    options={bookingContent.form.languages}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                />
                                <SelectInput
                                    label="Current Level (Approximate)"
                                    options={bookingContent.form.levels}
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                />
                            </div>

                            <div className="mb-8">
                                <FormInput
                                    label="Primary Career / Study Objective"
                                    placeholder="E.g., Masters in Germany, Nursing in UK, Corporate transfer..."
                                    multiline
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                                <CalendarSelector
                                    selectedDate={date}
                                    onSelect={setDate}
                                />
                                <div>
                                    <label className="block mb-3 text-sm font-bold text-slate-700">Available Time Slots</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {bookingContent.form.timeSlots.map((ts, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setTime(ts)}
                                                className={`py-3 px-2 text-sm font-bold rounded-xl border transition-all ${time === ts
                                                    ? 'border-primary bg-primary text-white shadow-md'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary hover:text-primary active:scale-95'
                                                    }`}
                                            >
                                                {ts}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT SIDE: SUMMARY */}
                    <div className="lg:col-span-1 sticky top-24">
                        <Card className="p-8 bg-white border border-slate-100 shadow-xl rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                            <h3 className="text-xl font-black mb-6 text-slate-900">{bookingContent.summary.title}</h3>

                            <div className="space-y-5 mb-8">
                                <div className="flex justify-between pb-4 border-b border-slate-100 items-center">
                                    <span className="text-slate-500 text-sm font-medium">Format</span>
                                    <span className="font-bold text-slate-900">{bookingContent.form.meetingTypes.find(m => m.id === meetingType)?.label}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-slate-100 items-center">
                                    <span className="text-slate-500 text-sm font-medium">Language</span>
                                    <span className="font-bold text-slate-900">{bookingContent.form.languages.find(l => l.value === language)?.label}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-slate-100 items-center">
                                    <span className="text-slate-500 text-sm font-medium">Date</span>
                                    <span className="font-bold text-slate-900">{date ? new Date(date).toLocaleDateString() : 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between pb-4 border-b border-slate-100 items-center">
                                    <span className="text-slate-500 text-sm font-medium">Time</span>
                                    <span className="font-bold text-slate-900">{time || 'Not selected'}</span>
                                </div>
                            </div>

                            <Button fullWidth size="lg" className="w-full bg-primary hover:bg-primary-hover shadow-lg active:scale-95 transition-all mb-4">
                                Confirm Booking
                            </Button>

                            {/* Trust Reinforcement Line */}
                            <div className="text-center mt-6 pt-6 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">encrypted</span> Secure & Confidential
                                </p>
                                <p className="mt-2 text-sm text-slate-500 font-medium">
                                    Join 1,000+ professionals who successfully built their global careers through SIFL.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
