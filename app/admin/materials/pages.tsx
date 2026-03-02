<>
  <meta charSet="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <title>Study Materials | SIFL Institute</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    rel="stylesheet"
  />
  <div className="flex h-screen overflow-hidden">
    {/* Sidebar */}
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">translate</span>
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">SIFL Institute</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Admin Dashboard
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <a
          className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            dashboard
          </span>
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            auto_stories
          </span>
          <span className="text-sm font-medium">Programs</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px] fill-current">
            description
          </span>
          <span className="text-sm font-medium">Study Materials</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">group</span>
          <span className="text-sm font-medium">Students</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            settings
          </span>
          <span className="text-sm font-medium">Settings</span>
        </a>
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
            data-alt="Admin user profile picture"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEU3FRgoTUAT67Q-vCYSRr6_XK9f1Oo16xvV5BVnxj0vgcvxGfoHGRqmMHosU0MGPUxtuGISDhizZHXDuJ4HgyJIMzEmPE98I50qSZ19gUuaabPmeUnJjOXmqjSwber_TfT5UouAfM76iMKtUyUMswYDfvLUDi9QWLT-LDiXi6A6Q6T-Bd17xfv4NBEEy7hxeXbnLhPfWl7mdRLutIPxYVGWxFpc_tADvrfFotas-O0PEi7l2lqF8DziEOqc8DmXjaI9K3b8g0gG95")'
            }}
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">Alex Rivera</p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
    {/* Main Content */}
    <main className="flex-1 flex flex-col min-w-0 overflow-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-lg font-bold">Study Materials</h2>
          <div className="relative max-w-sm w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 transition-all"
              placeholder="Search materials..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Upload Material
          </button>
        </div>
      </header>
      <div className="p-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-slate-400 text-[14px]">
            chevron_right
          </span>
          <span className="font-medium text-primary">Study Materials</span>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mr-2">
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filters:
          </div>
          <div className="relative">
            <select className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-4 pr-10 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
              <option>All Languages</option>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Japanese</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          <div className="relative">
            <select className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-4 pr-10 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
              <option>All Types</option>
              <option>PDF Document</option>
              <option>Video Content</option>
              <option>Audio Clip</option>
              <option>Spreadsheet</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          <div className="relative">
            <select className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-4 pr-10 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
              <option>All Status</option>
              <option>Active</option>
              <option>Hidden</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          <button className="text-sm text-slate-500 hover:text-primary transition-colors ml-auto font-medium">
            Clear All Filters
          </button>
        </div>
        {/* Materials Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Material Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Language
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Row 1 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        picture_as_pdf
                      </span>
                      <div>
                        <p className="font-semibold text-sm">
                          Advanced French Grammar Guide
                        </p>
                        <p className="text-xs text-slate-500">2.4 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      PDF
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    French
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      <div
                        className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300"
                        data-alt="Student avatar 1"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCT4fbf8XdPE5gKBbxLcSI0ZolS5ckY64CYwNHnEDxOVLJa7cpEeRiIduVXZcYVFUowFliCdKpZVF5oX6EtrhJVSQCpE4ua_5DIKdM88MZe9auDX5toZq7hCNdHvMdC63GMxeiXTnIST5NoIwclZ6v8JQ0t3b9pT-CJ2AZi2UphKLhacr84G2WGf2jUaQoUVTDfX2CrPCQ-8UWX7Jdx_RPk7kfSYkub_K32lpECuUOCdtstLVgGx46K8wQmT6t5YK05Fgk-yj6GySeQ")'
                        }}
                      />
                      <div
                        className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400"
                        data-alt="Student avatar 2"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0aFeOpeqNM60Fjrdh1IJ62zM8k20pFinEo25Em9Uo8C8VfsVOMtIw09WdqZ892mqInvzwRHt3SYcXGiE6JN5CMz7snI5lDBsw4fm7NQQttrUV-4q31zulSgHHjBSMr4L7Rh8Qwk3GYTyB8BYC_Kgfnlcg_behnuA5FjlY8E7XJT1kQ3Sj1zQfrVvl_clqgLL15Y8P8RO7ieS9tbRk9WYC6pbm6kUbqzXor8tfj6ZNgrBcr2gbqGYqd1EqMsrQEvehZ1-pRPaH68aO")'
                        }}
                      />
                      <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        +12
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    Oct 12, 2023
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button
                        className="p-1 hover:text-primary transition-colors"
                        title="Reassign"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          person_add
                        </span>
                      </button>
                      <button
                        className="p-1 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-500">
                        video_library
                      </span>
                      <div>
                        <p className="font-semibold text-sm">
                          Japanese Pronunciation Basics
                        </p>
                        <p className="text-xs text-slate-500">14:20 mins</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Video
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Japanese
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      All Beginners
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    Oct 08, 2023
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          person_add
                        </span>
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        picture_as_pdf
                      </span>
                      <div>
                        <p className="font-semibold text-sm">
                          English Idioms Dictionary
                        </p>
                        <p className="text-xs text-slate-500">5.8 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      PDF
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    English
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        45
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    Sep 28, 2023
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          person_add
                        </span>
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors opacity-60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">
                        description
                      </span>
                      <div>
                        <p className="font-semibold text-sm">
                          Spanish Vocabulary - Level 1 (Hidden)
                        </p>
                        <p className="text-xs text-slate-500">1.1 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      PDF
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    Spanish
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs italic text-slate-400">
                      Not Assigned
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    Sep 25, 2023
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                      <button className="p-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing 4 of 24 materials</p>
            <div className="flex gap-2">
              <button
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    {/* Overlay for Modal (Always Visible in this preview) */}
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      {/* Upload Side Panel */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold">Upload New Material</h3>
          <button className="size-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Material Title
            </label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="e.g. Business English Phrases"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              File Upload
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">
                  upload_file
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, MP4, MP3 or ZIP (max. 100MB)
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Language Program
              </label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all">
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
                <option>Japanese</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Visibility
              </label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all">
                <option>Active</option>
                <option>Hidden</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Assign To Students / Groups
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Search students or groups..."
                type="text"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                Beginner Batch A
                <span className="material-symbols-outlined text-[14px] cursor-pointer">
                  close
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                Jean Dupont
                <span className="material-symbols-outlined text-[14px] cursor-pointer">
                  close
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                className="rounded text-primary focus:ring-primary border-slate-300"
                id="notify"
                type="checkbox"
              />
              <label
                className="text-sm text-slate-600 dark:text-slate-400"
                htmlFor="notify"
              >
                Notify assigned students via email
              </label>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
          <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            Cancel
          </button>
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 transition-all">
            Confirm Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</>
