import React from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { ProgressBar } from '@/components/ProgressBar';
import { dashboardContent } from '@/content/dashboard';

export default function DashboardIndex() {
    return (
        <div className="space-y-8">
            {/* HEADER SECTION */}
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-2">{dashboardContent.welcome.greeting}</h1>
                <p className="text-gray-600">{dashboardContent.welcome.message}</p>
            </header>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardContent.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-card shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between">
                        <span className="text-gray-500 font-medium">{metric.label}</span>
                        <span className="text-2xl font-bold text-primary">{metric.value}</span>
                    </div>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: PROGRESS & ASSIGNMENTS */}
                <div className="lg:col-span-2 space-y-8">

                    <DashboardCard title="Learning Progress">
                        <div className="space-y-6">
                            <div>
                                <ProgressBar progress={78} label="German B2 - Module 4" />
                            </div>
                            <div>
                                <ProgressBar progress={45} label="Speaking Practice Goals" />
                            </div>
                            <div>
                                <ProgressBar progress={90} label="Vocabulary Mastery" />
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Recent Test Results">
                        <div className="">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Assessment</th>
                                        <th className="pb-3 text-right font-medium">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {dashboardContent.recentTests.map((test, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 text-gray-500">{test.date}</td>
                                            <td className="py-4 font-medium text-foreground">{test.name}</td>
                                            <td className="py-4 text-right font-bold text-primary">{test.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardCard>

                </div>

                {/* RIGHT COLUMN: SCHEDULE & DUE DATES */}
                <div className="space-y-8">

                    <DashboardCard title="Assignments Due">
                        <div className="space-y-4">
                            {dashboardContent.assignmentsDue.map((assignment, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors">
                                    <h4 className="font-bold text-sm mb-1">{assignment.title}</h4>
                                    <div className="flex flex-col md:flex-row justify-between items-center text-xs">
                                        <span className="text-gray-500">{assignment.course}</span>
                                        <span className="font-bold text-red-500">{assignment.due}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Today's Schedule">
                        <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-px before:bg-gray-200">
                            {dashboardContent.scheduleWidget.map((item, idx) => (
                                <div key={idx} className="relative pl-10">
                                    <span className="absolute left-2.5 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-white"></span>
                                    <div className="text-sm font-bold text-gray-500 mb-1">{item.time}</div>
                                    <h4 className="font-bold text-foreground mb-1">{item.class}</h4>
                                    <div className="text-xs text-gray-500 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {item.location}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardCard>

                </div>
            </div>
        </div>
    );
}
