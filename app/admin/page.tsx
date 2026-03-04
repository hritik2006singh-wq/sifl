"use client";

import { useState } from "react";
import { db } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export default function AdminDashboardPage() {
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult(true);
        console.log("🔥 TOKEN CLAIMS:", token.claims);
      } else {
        console.log("❌ No user logged in");
      }
    });

    return () => unsubscribe();
  }, []);
  const router = useRouter();
  const { user, loading } = useAdminGuard();

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingDemos: 0,
    todaysDemos: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalMaterials: 0,
  });

  // Chart Data State
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      // 1. Total Students
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
      const totalStudentsSnap = await getCountFromServer(studentsQuery);

      // 2. Active Students
      const activeStudentsQuery = query(collection(db, "users"), where("role", "==", "student"), where("status", "==", "active"));
      const activeStudentsSnap = await getCountFromServer(activeStudentsQuery);

      // 3. Total Teachers
      const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"));
      const totalTeachersSnap = await getCountFromServer(teachersQuery);

      // Total Admins
      const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
      const totalAdminsSnap = await getCountFromServer(adminsQuery);

      // Total Materials
      const materialsQuery = collection(db, "materials");
      const totalMaterialsSnap = await getCountFromServer(materialsQuery);

      // 4. Pending Demos
      const pendingDemosQuery = query(collection(db, "demo_bookings"), where("status", "==", "pending"));
      const pendingDemosSnap = await getCountFromServer(pendingDemosQuery);

      // 5. Today's Demos
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysDemosQuery = query(collection(db, "demo_bookings"), where("createdAt", ">=", today.toISOString()));
      let todaysDemosCount = 0;
      try {
        const todaySnap = await getCountFromServer(todaysDemosQuery);
        todaysDemosCount = todaySnap.data().count;
      } catch (e) {
        // Fallback if index missing or using created_at
        const fallbackQuery = query(collection(db, "demo_bookings"), where("created_at", ">=", today.toISOString()));
        try {
          const fallbackSnap = await getCountFromServer(fallbackQuery);
          todaysDemosCount = fallbackSnap.data().count;
        } catch (fallbackErr) {
          // Ignore
        }
      }

      setMetrics({
        totalStudents: totalStudentsSnap.data().count,
        activeStudents: activeStudentsSnap.data().count,
        totalTeachers: totalTeachersSnap.data().count,
        totalAdmins: totalAdminsSnap.data().count,
        pendingDemos: pendingDemosSnap.data().count,
        todaysDemos: todaysDemosCount,
        totalMaterials: totalMaterialsSnap.data().count,
      });

      // 6. Weekly Demo Graph logic
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const weeklyDemosQuery = query(collection(db, "demo_bookings"));
      const weeklySnap = await getDocs(weeklyDemosQuery);

      const aggregatedData = [0, 0, 0, 0, 0, 0, 0];

      weeklySnap.docs.forEach(doc => {
        const data = doc.data();
        let dateStr = data.createdAt || data.created_at;
        if (dateStr) {
          const createdDate = new Date(dateStr);
          if (createdDate >= sevenDaysAgo) {
            const dayLabel = createdDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
            const index = last7Days.indexOf(dayLabel);
            if (index !== -1) {
              aggregatedData[index]++;
            }
          }
        }
      });
      console.log(aggregatedData);


      setChartData({
        labels: last7Days,
        datasets: [
          {
            fill: true,
            label: 'Demo Bookings',
            data: aggregatedData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      });

    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const todayStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning, {user?.name || "Admin"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here is what's happening at the institute today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">
              calendar_today
            </span>
            {todayStr}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Students
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.totalStudents}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Active Students
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.activeStudents}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">
                pending_actions
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Pending Demos
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.pendingDemos}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <span className="material-symbols-outlined">event_note</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Today's Demos
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.todaysDemos}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="material-symbols-outlined">badge</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Teachers
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.totalTeachers}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Materials
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.totalMaterials}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Admins
          </p>
          <h3 className="text-2xl font-bold mt-1">{metrics.totalAdmins}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Analytics & Quick Actions */}
        <div className="xl:col-span-2 space-y-8">
          {/* Graph Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-lg">Weekly Demo Bookings</h3>
                <p className="text-slate-400 text-xs font-medium">
                  Performance over the last 7 days
                </p>
              </div>
            </div>
            {/* Real Chart.js Line Chart */}
            <div className="relative h-64 w-full flex items-center justify-center p-2">
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              ) : (
                <div className="text-slate-400">Loading chart...</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/students')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm"
              >
                <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">
                    person_add
                  </span>
                </div>
                <span className="text-sm font-bold">Manage Students</span>
              </button>
              <button
                onClick={() => router.push('/demo-booking')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm"
              >
                <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">
                    event
                  </span>
                </div>
                <span className="text-sm font-bold">View Demos</span>
              </button>
              <button
                onClick={() => router.push('/admin/materials')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm"
              >
                <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">
                    upload_file
                  </span>
                </div>
                <span className="text-sm font-bold">Upload Material</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Recent Activity</h3>
              <button className="text-primary text-xs font-bold hover:underline">
                View All
              </button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="text-sm text-slate-500 italic">No recent activity</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
