'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
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
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-foreground mb-4">{bookingContent.header.title}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{bookingContent.header.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* LEFT SIDE: FORM */}
                        <div className="lg:col-span-2">
                            <Card className="p-8">
                                <h2 className="text-2xl font-bold mb-6">Booking Details</h2>

                                <div className="mb-8">
                                    <label className="block mb-3 text-sm font-medium text-gray-700">Meeting Type</label>
                                    <ToggleOption
                                        options={bookingContent.form.meetingTypes}
                                        selectedId={meetingType}
                                        onChange={setMeetingType}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <SelectInput
                                        label="Language of Interest"
                                        options={bookingContent.form.languages}
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    />
                                    <SelectInput
                                        label="Current Academic Level"
                                        options={bookingContent.form.levels}
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                    />
                                </div>

                                <div className="mb-6">
                                    <FormInput
                                        label="Primary Objective"
                                        placeholder="E.g., University admission, professional requirement..."
                                        multiline
                                        value={objective}
                                        onChange={(e) => setObjective(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <CalendarSelector
                                        selectedDate={date}
                                        onSelect={setDate}
                                    />
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Select Time</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {bookingContent.form.timeSlots.map((ts, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setTime(ts)}
                                                    className={`py-3 px-2 text-sm font-medium rounded-btn border transition-colors ${time === ts
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
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
                        <div className="lg:col-span-1 sticky top-28">
                            <Card className="p-8 bg-white border border-gray-100 shadow-lg">
                                <h3 className="text-xl font-bold mb-6">{bookingContent.summary.title}</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between pb-4 border-b border-gray-100 items-center">
                                        <span className="text-gray-500 text-sm">Type</span>
                                        <span className="font-medium text-foreground">{bookingContent.form.meetingTypes.find(m => m.id === meetingType)?.label}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-gray-100 items-center">
                                        <span className="text-gray-500 text-sm">Language</span>
                                        <span className="font-medium text-foreground">{bookingContent.form.languages.find(l => l.value === language)?.label}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-gray-100 items-center">
                                        <span className="text-gray-500 text-sm">Date</span>
                                        <span className="font-medium text-foreground">{date ? new Date(date).toLocaleDateString() : 'Not selected'}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-gray-100 items-center">
                                        <span className="text-gray-500 text-sm">Time</span>
                                        <span className="font-medium text-foreground">{time || 'Not selected'}</span>
                                    </div>
                                </div>

                                <Button fullWidth size="lg">{bookingContent.summary.confirmButton}</Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
