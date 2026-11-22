import React, { useState } from 'react';
import { CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { computeWarmthStatus } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';
import { CircleGroup, ContactPerson } from '../types/jarvis';

const BRIDGE_GESTURES_PL = [
  'Zadzwoń na 8 minut podczas popołudniowego spaceru — bez pośpiechu.',
  'Zaproponuj wspólną kawę lub herbatę bez telefonów w przyszłym tygodniu.',
  'Wyślij krótką notatkę głosową z jednym konkretnym wspomnieniem z ostatniego spotkania.',
  'Przynieś drobną rzecz nawiązującą do ich aktualnego projektu lub pasji.',
];

const BRIDGE_GESTURES_EN = [
  'Call for 8 unhurried minutes during an afternoon walk.',
  'Invite for an offline coffee or tea next week with phones away.',
  'Send a short voice memo referencing their current project.',
  'Bring a small thoughtful item tied to what matters to them right now.',
];

export const InnerCircleView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const contacts = state.innerCircle.contacts;

  const [groupFilter, setGroupFilter] = useState<'all' | CircleGroup>('all');
  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<CircleGroup>('friends');
  const [newCadence, setNewCadence] = useState('14');
  const [newNote, setNewNote] = useState('');

  const filtered = contacts.filter((c) => (groupFilter === 'all' ? true : c.group === groupFilter));
  const dueCount = contacts.filter((c) => computeWarmthStatus(c).status !== 'warm').length;

  const generateIdea = (person: ContactPerson) => {
    const pool = lang === 'pl' ? BRIDGE_GESTURES_PL : BRIDGE_GESTURES_EN;
    const idx = (person.name.length + person.daysSinceContact) % pool.length;
    const noteCtx = lang === 'pl' ? person.contextNotePl : person.contextNoteEn;
    setGeneratedIdeas((prev) => ({
      ...prev,
      [person.id]: `${pool[idx]} (${noteCtx})`,
    }));
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const roleMap: Record<CircleGroup, { pl: string; en: string }> = {
      family: { pl: 'Rodzina', en: 'Family' },
      friends: { pl: 'Bliski Przyjaciel', en: 'Close Friend' },
      mentors: { pl: 'Mentor / Sojusznik', en: 'Mentor / Ally' },
    };
    dispatch({
      type: 'ADD_CONTACT',
      name: newName.trim(),
      rolePl: roleMap[newGroup].pl,
      roleEn: roleMap[newGroup].en,
      group: newGroup,
      desiredCadenceDays: Math.max(1, Number(newCadence) || 14),
      contextNotePl: newNote.trim() || (lang === 'pl' ? 'Ważna osoba w kręgu.' : 'Important circle contact.'),
    });
    setNewName('');
    setNewNote('');
    notify(lang === 'pl' ? 'Dodano osobę do Kręgu Bliskich' : 'Added to Inner Circle', 'emerald');
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="inner-circle"
        kpis={[
          { label: lang === 'pl' ? 'Bliskie Osoby' : 'Circle Size', value: `${contacts.length}`, accent: true },
          { label: lang === 'pl' ? 'Do Odnowienia' : 'Due Now', value: `${dueCount}` },
          { label: lang === 'pl' ? 'Rodzina' : 'Family', value: `${contacts.filter((c) => c.group === 'family').length}` },
        ]}
      />

      {/* Concentric Circle Filter + Add Form */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-900/10 bg-white p-1 dark:border-white/10 dark:bg-[#0E1219]">
          {(
            [
              { id: 'all', pl: 'Wszystkie', en: 'All' },
              { id: 'family', pl: 'Rodzina', en: 'Family' },
              { id: 'friends', pl: 'Bliscy Przyjaciele', en: 'Close Friends' },
              { id: 'mentors', pl: 'Mentorzy & Sojusznicy', en: 'Mentors & Allies' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGroupFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                groupFilter === tab.id
                  ? 'bg-[#090C11] text-white dark:bg-[#FB7185] dark:text-[#090C11]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {lang === 'pl' ? tab.pl : tab.en}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddPerson} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={lang === 'pl' ? 'Imię i relacja...' : 'Name...'}
            className="h-9 rounded-xl border border-slate-900/12 bg-white px-3 text-xs dark:border-white/12 dark:bg-[#0E1219]"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value as CircleGroup)}
            className="h-9 rounded-xl border border-slate-900/12 bg-white px-2.5 text-xs dark:border-white/12 dark:bg-[#0E1219]"
          >
            <option value="family">{lang === 'pl' ? 'Rodzina' : 'Family'}</option>
            <option value="friends">{lang === 'pl' ? 'Przyjaciel' : 'Friend'}</option>
            <option value="mentors">{lang === 'pl' ? 'Mentor' : 'Mentor'}</option>
          </select>
          <input
            type="number"
            min={1}
            value={newCadence}
            onChange={(e) => setNewCadence(e.target.value)}
            aria-label="Cadence days"
            className="h-9 w-16 rounded-xl border border-slate-900/12 bg-white px-2 text-right font-mono text-xs dark:border-white/12 dark:bg-[#0E1219]"
          />
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={lang === 'pl' ? 'Co jest dla nich ważne...' : 'Context note...'}
            className="h-9 rounded-xl border border-slate-900/12 bg-white px-3 text-xs dark:border-white/12 dark:bg-[#0E1219]"
          />
          <button
            type="submit"
            className="flex h-9 items-center gap-1 rounded-xl bg-[#FB7185] px-3 text-xs font-bold text-[#090C11]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Dodaj' : 'Add'}</span>
          </button>
        </form>
      </div>

      {/* Warmth Pulse Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((person) => {
          const warmth = computeWarmthStatus(person);
          const statusColor =
            warmth.status === 'warm'
              ? '#10B981'
              : warmth.status === 'due'
              ? '#F59E0B'
              : '#FB7185';
          const statusText =
            warmth.status === 'warm'
              ? lang === 'pl'
                ? 'Ciepły kontakt'
                : 'Warm'
              : warmth.status === 'due'
              ? lang === 'pl'
                ? 'Warto się odezwać'
                : 'Due soon'
              : lang === 'pl'
              ? 'Wymaga uwagi'
              : 'Overdue';

          return (
            <PhotographicCard
              key={person.id}
              imageUrl={MODULE_VISUALS['inner-circle'].cardUrl}
              fallbackGradient={MODULE_VISUALS['inner-circle'].fallbackGradient}
              alt={person.name}
              className="flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-slate-300">
                    {lang === 'pl' ? person.rolePl : person.roleEn}
                  </span>
                  <span style={{ color: statusColor }} className="font-semibold">
                    {statusText} · {person.daysSinceContact}d / {person.desiredCadenceDays}d
                  </span>
                </div>

                <h3 className="mt-1.5 text-lg font-bold text-white">{person.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  {lang === 'pl' ? person.contextNotePl : person.contextNoteEn}
                </p>
                <div className="mt-2 font-mono text-[11px] text-slate-400">
                  {person.upcomingEvent} · {person.lastGesture}
                </div>

                {generatedIdeas[person.id] && (
                  <div className="mt-3 rounded-xl border border-[#FB7185]/40 bg-[#FB7185]/10 p-2.5 text-xs text-rose-100">
                    {generatedIdeas[person.id]}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'LOG_CONTACT_INTERACTION', contactId: person.id });
                    notify(`${person.name} · ${lang === 'pl' ? 'Zalogowano kontakt' : 'Logged'}`, 'emerald');
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{lang === 'pl' ? 'Zaloguj Rozmowę / Spotkanie' : 'Log Call / Meetup'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => generateIdea(person)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-white/15"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? 'Most do Offline' : 'Bridge to Offline'}</span>
                </button>
              </div>
            </PhotographicCard>
          );
        })}
      </div>
    </div>
  );
};

export default InnerCircleView;
