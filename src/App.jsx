import React, { useState, useEffect } from 'react'

const defaultPrayers = [
  { id: 'fajr', name: 'Fajr', arabic: 'الفجر', time: '05:00', done: false },
  { id: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', time: '13:00', done: false },
  { id: 'asr', name: 'Asr', arabic: 'العصر', time: '16:30', done: false },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', time: '20:00', done: false },
  { id: 'isha', name: 'Isha', arabic: 'العشاء', time: '22:00', done: false },
]

const defaultRoutines = [
  { id: 'routine1', title: 'Sport', progress: 0 },
  { id: 'routine2', title: 'Lesen', progress: 0 },
]

const defaultSettings = {
  remindTasks: false,
  remindRoutine: false,
  remindPrayers: false,
  theme: 'light',
}

const navItems = [
  { key: 'privat', label: 'Privat 🏡' },
  { key: 'arbeit', label: 'Arbeit 💼' },
  { key: 'routine', label: 'Routine 🔄' },
  { key: 'gebete', label: 'Gebete 🕌' },
  { key: 'done', label: 'Erledigt ✅' },
  { key: 'settings', label: 'Einstellungen ⚙️' },
]

export default function App() {
  const [active, setActive] = useState('privat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [routine, setRoutine] = useState(defaultRoutines)
  const [prayers, setPrayers] = useState(defaultPrayers)
  const [settings, setSettings] = useState(defaultSettings)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Initial load from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || []
    const storedRoutine = JSON.parse(localStorage.getItem('routine')) || defaultRoutines
    const storedPrayers = JSON.parse(localStorage.getItem('prayers')) || defaultPrayers
    const storedSettings = JSON.parse(localStorage.getItem('settings')) || defaultSettings
    setTasks(storedTasks)
    setRoutine(storedRoutine)
    setPrayers(storedPrayers)
    setSettings(storedSettings)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('routine', JSON.stringify(routine))
  }, [routine])

  useEffect(() => {
    localStorage.setItem('prayers', JSON.stringify(prayers))
  }, [prayers])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  // Theme handling
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  // Reset at midnight
  useEffect(() => {
    const checkReset = () => {
      const last = localStorage.getItem('lastReset')
      const today = new Date().toDateString()
      if (last !== today) {
        setRoutine(routine.map(r => ({ ...r, progress: 0 })))
        setPrayers(prayers.map(p => ({ ...p, done: false })))
        localStorage.setItem('lastReset', today)
      }
    }
    checkReset()
    const id = setInterval(checkReset, 60000)
    return () => clearInterval(id)
  }, [routine, prayers])

  // Task helpers
  const addTask = () => {
    if (!title) return
    const newTask = {
      id: Date.now(),
      title,
      description,
      dueDate,
      category: active,
      completed: false,
    }
    setTasks([...tasks, newTask])
    setTitle('')
    setDescription('')
    setDueDate('')
    setDrawerOpen(false)
  }

  const toggleTask = id => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed))
  }

  const incRoutine = id => {
    setRoutine(routine.map(r => (r.id === id ? { ...r, progress: Math.min(100, r.progress + 25) } : r)))
  }

  const togglePrayer = id => {
    setPrayers(prayers.map(p => (p.id === id ? { ...p, done: !p.done } : p)))
  }

  const resetRoutine = () => {
    setRoutine(routine.map(r => ({ ...r, progress: 0 })))
  }

  const resetPrayers = () => {
    setPrayers(prayers.map(p => ({ ...p, done: false })))
  }

  const clearAllData = () => {
    localStorage.clear()
    setTasks([])
    setRoutine(defaultRoutines.map(r => ({ ...r, progress: 0 })))
    setPrayers(defaultPrayers.map(p => ({ ...p, done: false })))
    setSettings(defaultSettings)
    localStorage.setItem('lastReset', new Date().toDateString())
  }

  const overdue = task => {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
  }

  const renderTasks = category => (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks
        .filter(t => t.category === category && !t.completed)
        .map(t => (
          <div key={t.id} className="task-card flex">
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleTask(t.id)}
              className="mr-2 mt-1"
            />
            <div className="flex-1">
              <h3 className="font-medium">{t.title}</h3>
              {t.description && <p className="text-sm text-gray-500">{t.description}</p>}
              {t.dueDate && (
                <p
                  className={`text-sm mt-1 ${
                    overdue(t) ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {t.dueDate} {overdue(t) && '⚠️'}
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  )

  const renderRoutine = () => (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {routine.map(r => (
        <div
          key={r.id}
          className={`task-card flex items-center justify-between ${
            r.progress === 100 ? 'line-through text-gray-400' : ''
          }`}
        >
          <div className="flex-1 mr-2">
            <h3>{r.title}</h3>
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-ocean h-2 rounded"
                style={{ width: `${r.progress}%` }}
              ></div>
            </div>
          </div>
          <button className="gradient-button text-sm" onClick={() => incRoutine(r.id)}>
            +25%
          </button>
        </div>
      ))}
    </div>
  )

  const renderPrayers = () => (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {prayers.map(p => (
        <div key={p.id} className="task-card flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={p.done}
            onChange={() => togglePrayer(p.id)}
          />
          <div>
            <h3 className={`${p.done ? 'line-through text-gray-400' : ''}`}>
              {p.name} <span className="text-sm ml-1">{p.arabic}</span>
            </h3>
            <p className="text-sm text-gray-500">{p.time}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDone = () => (
    <div className="p-4">
      <button onClick={clearCompleted} className="gradient-button mb-4">
        Alle löschen
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks
          .filter(t => t.completed)
          .map(t => (
            <div key={t.id} className="task-card opacity-60">
              <h3 className="line-through">{t.title}</h3>
              {t.description && (
                <p className="text-sm line-through">{t.description}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Erinnerungen</h2>
        <label className="flex items-center mb-1">
          <input
            type="checkbox"
            className="mr-2"
            checked={settings.remindTasks}
            onChange={e => setSettings({ ...settings, remindTasks: e.target.checked })}
          />
          Aufgaben
        </label>
        <label className="flex items-center mb-1">
          <input
            type="checkbox"
            className="mr-2"
            checked={settings.remindRoutine}
            onChange={e =>
              setSettings({ ...settings, remindRoutine: e.target.checked })
            }
          />
          Routine
        </label>
        <label className="flex items-center mb-1">
          <input
            type="checkbox"
            className="mr-2"
            checked={settings.remindPrayers}
            onChange={e =>
              setSettings({ ...settings, remindPrayers: e.target.checked })
            }
          />
          Gebete
        </label>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Design</h2>
        <select
          className="border p-2 rounded"
          value={settings.theme}
          onChange={e => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="light">Hell</option>
          <option value="dark">Dunkel</option>
          <option value="auto">Automatisch</option>
        </select>
      </div>

      <div className="space-x-2">
        <button className="gradient-button" onClick={resetRoutine}>
          Routinen zurücksetzen
        </button>
        <button className="gradient-button" onClick={resetPrayers}>
          Gebete zurücksetzen
        </button>
        <button className="gradient-button" onClick={clearAllData}>
          Alle Daten löschen
        </button>
      </div>
    </div>
  )

  const mainContent = () => {
    switch (active) {
      case 'privat':
        return renderTasks('privat')
      case 'arbeit':
        return renderTasks('arbeit')
      case 'routine':
        return renderRoutine()
      case 'gebete':
        return renderPrayers()
      case 'done':
        return renderDone()
      case 'settings':
        return renderSettings()
      default:
        return null
    }
  }

  return (
    <div>
      {/* Hamburger */}
      <button
        className="p-2 m-2"
        onClick={() => setSidebarOpen(true)}
        aria-label="Menü"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          <button className="mb-4" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
          <nav>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key)
                  setSidebarOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded mb-2 ${
                  active === item.key
                    ? 'bg-gradient-to-r from-turquoise to-ocean text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Drawer for new task */}
      <div
        className={`drawer ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4">
          <h2 className="text-xl mb-4">Neue Aufgabe</h2>
          <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="Titel"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-2 mb-2 rounded"
            placeholder="Beschreibung"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="date"
            className="w-full border p-2 mb-4 rounded"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          <div className="flex space-x-2">
            <button className="gradient-button" onClick={addTask}>
              Speichern
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setDrawerOpen(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4">{mainContent()}</div>

      {/* Add button */}
      {(active === 'privat' || active === 'arbeit') && (
        <button
          className="fixed bottom-6 right-6 gradient-button rounded-full w-14 h-14 flex items-center justify-center text-2xl"
          onClick={() => setDrawerOpen(true)}
          aria-label="Aufgabe hinzufügen"
        >
          +
        </button>
      )}
    </div>
  )
}
