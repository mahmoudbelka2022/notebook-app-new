import React, { useState, useEffect } from 'react';
import { Book } from 'lucide-react';
import AuthForm from './components/AuthForm';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { authenticateUser, registerUser, saveUserNotes } from './utils/auth';
import { Note, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [error, setError] = useState<string>('');

  const handleAuth = (username: string, password: string) => {
    setError('');
    if (authMode === 'login') {
      const authenticatedUser = authenticateUser(username, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
      } else {
        setError('Invalid credentials');
      }
    } else {
      const success = registerUser(username, password);
      if (success) {
        setAuthMode('login');
      } else {
        setError('Username already exists');
      }
    }
  };

  const handleSaveNote = (note: { id: string; title: string; content: string }) => {
    if (!user) return;

    const now = new Date().toISOString();
    const updatedNote = {
      ...note,
      createdAt: note.id ? activeNote?.createdAt || now : now,
      updatedAt: now,
    };

    const updatedNotes = note.id
      ? user.notes.map((n) => (n.id === note.id ? updatedNote : n))
      : [...user.notes, updatedNote];

    setUser({ ...user, notes: updatedNotes });
    saveUserNotes(user.username, updatedNotes);
    setActiveNote(updatedNote);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;

    const updatedNotes = user.notes.filter((note) => note.id !== noteId);
    setUser({ ...user, notes: updatedNotes });
    saveUserNotes(user.username, updatedNotes);
    setActiveNote(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="text-blue-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-800">Notebook</h1>
          </div>
          <p className="text-gray-600">Your personal space for thoughts and ideas</p>
        </div>
        
        <AuthForm type={authMode} onSubmit={handleAuth} />
        
        {error && <p className="mt-4 text-red-500">{error}</p>}
        
        <p className="mt-6 text-gray-600">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-blue-600 hover:underline"
          >
            {authMode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Notebook</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={() => setUser(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <NoteList
              notes={user.notes}
              activeNoteId={activeNote?.id || null}
              onNoteSelect={setActiveNote}
              onNoteDelete={handleDeleteNote}
            />
          </div>
          <div className="md:col-span-2">
            <NoteEditor
              note={activeNote}
              onSave={handleSaveNote}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;