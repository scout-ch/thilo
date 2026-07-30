// Local-first progress tracking for scouts: chapters read and quiz results.
// Stored in localStorage so it works offline (PWA) without accounts; see
// docs/GAMIFICATION.md for the roadmap toward badges and synced profiles.
//
// Client-side only: every function touches localStorage/window lazily so the
// module itself is safe to import in SSR code paths.

const STORAGE_KEY = 'thilo-progress-v1';
export const PROGRESS_EVENT = 'thilo:progress';

export interface QuizResult {
  correct: number;
  total: number;
  completedAt: string;
}

export interface ProgressState {
  // "<sectionSlug>#<chapterSlug>" -> ISO timestamp of when it was first read
  chaptersRead: Record<string, string>;
  // quiz URL -> best result
  quizResults: Record<string, QuizResult>;
}

function emptyState(): ProgressState {
  return { chaptersRead: {}, quizResults: {} };
}

export function getProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return emptyState();
}

function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch { /* storage unavailable: progress is best-effort */ }
}

export function chapterKey(sectionSlug: string, chapterSlug: string): string {
  return `${sectionSlug}#${chapterSlug}`;
}

export function markChapterRead(sectionSlug: string, chapterSlug: string): void {
  if (!sectionSlug || !chapterSlug) return;
  const state = getProgress();
  const key = chapterKey(sectionSlug, chapterSlug);
  if (state.chaptersRead[key]) return;
  state.chaptersRead[key] = new Date().toISOString();
  saveProgress(state);
}

export function isChapterRead(sectionSlug: string, chapterSlug: string): boolean {
  return Boolean(getProgress().chaptersRead[chapterKey(sectionSlug, chapterSlug)]);
}

export function recordQuizResult(quizUrl: string, correct: number, total: number): void {
  if (!quizUrl || total <= 0) return;
  const state = getProgress();
  const previous = state.quizResults[quizUrl];
  // Keep the best attempt
  if (previous && previous.correct / previous.total >= correct / total) return;
  state.quizResults[quizUrl] = { correct, total, completedAt: new Date().toISOString() };
  saveProgress(state);
}

export function getQuizResult(quizUrl: string): QuizResult | undefined {
  return getProgress().quizResults[quizUrl];
}

export function getSectionReadCount(sectionSlug: string, chapterSlugs: string[]): number {
  const state = getProgress();
  return chapterSlugs.filter(slug => state.chaptersRead[chapterKey(sectionSlug, slug)]).length;
}

// Fires on local changes (custom event) and changes from other tabs (storage)
export function onProgressChange(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) callback(); };
  window.addEventListener(PROGRESS_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function resetProgress(): void {
  saveProgress(emptyState());
}
