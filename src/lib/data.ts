import { createClient } from "@/lib/supabase/client";

// ─── Types (giữ nguyên UI types để tương thích ngược) ─────────────────

export type Author = "BK" | "Bi";

export interface Reaction {
  id: string;
  emoji: string;
  by: Author;
}

export interface Comment {
  id: string;
  by: Author;
  text: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  mood: string;
  body: string;
  photos: string[];
  author: Author;
  reactions: Reaction[];
  comments: Comment[];
}

export interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
  caption: string;
  date: string;
}

export interface DateInfo {
  id: string;
  emoji: string;
  label: string;
  date: string;
  type:
    | "first-meet"
    | "first-date"
    | "anniversary"
    | "birthday-him"
    | "birthday-her";
  person?: string;
}

export interface Plan {
  id: string;
  title: string;
  date: string;
  location?: string;
  note?: string;
  status: "planned" | "done" | "cancelled";
}

export interface PromptAnswer {
  by: Author;
  text: string;
  date: string;
}

export interface CouplePrompt {
  id: string;
  question: string;
  date: string;
  emoji: string;
  answers: PromptAnswer[];
}

// ─── Helpers ──────────────────────────────────────────────────────────

function supabase() {
  return createClient();
}

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Transform Supabase row → UI JournalEntry
function mapEntry(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    mood: row.mood as string,
    body: row.body as string,
    author: row.author as Author,
    photos: Array.isArray(row.entry_photos)
      ? (row.entry_photos as { url: string }[]).map((p) => p.url)
      : [],
    reactions: Array.isArray(row.reactions)
      ? (row.reactions as { id: string; emoji: string; author: Author }[]).map(
          (r) => ({ id: r.id, emoji: r.emoji, by: r.author })
        )
      : [],
    comments: Array.isArray(row.comments)
      ? (row.comments as {
            id: string;
            author: Author;
            text: string;
            created_at: string;
          }[]).map((c) => ({
            id: c.id,
            by: c.author,
            text: c.text,
            date: c.created_at,
          }))
      : [],
  };
}

// Transform Supabase row → UI CouplePrompt
function mapPrompt(row: Record<string, unknown>): CouplePrompt {
  return {
    id: row.id as string,
    question: row.question as string,
    date: row.date as string,
    emoji: row.emoji as string,
    answers: Array.isArray(row.prompt_answers)
      ? (row.prompt_answers as {
            author: Author;
            text: string;
            created_at: string;
          }[]).map((a) => ({
            by: a.author,
            text: a.text,
            date: a.created_at,
          }))
      : [],
  };
}

// ─── Current User ─────────────────────────────────────────────────────

let _cachedUser: Author | null = null;

export function getCurrentUserCached(): Author {
  if (_cachedUser) return _cachedUser;
  return "BK"; // fallback
}

export async function getCurrentUser(): Promise<Author> {
  const {
    data: { user },
  } = await supabase().auth.getUser();
  if (!user?.email) return "BK";
  if (user.email.includes("bi@")) return "Bi";
  return "BK";
}

export function setCurrentUser(author: Author): void {
  _cachedUser = author;
}

// ─── Journal Entries ──────────────────────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase()
    .from("journal_entries")
    .select("*, entry_photos(*), reactions(*), comments(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

export async function getJournalEntry(
  id: string
): Promise<JournalEntry | undefined> {
  const { data, error } = await supabase()
    .from("journal_entries")
    .select("*, entry_photos(*), reactions(*), comments(*)")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return mapEntry(data);
}

export async function addJournalEntry(
  data: Omit<JournalEntry, "id" | "reactions" | "comments">
): Promise<JournalEntry> {
  const { title, date, mood, body, photos, author } = data;

  const { data: entry, error } = await supabase()
    .from("journal_entries")
    .insert({ title, date, mood, body, author })
    .select("*")
    .single();

  if (error) throw error;

  if (photos.length > 0) {
    await supabase()
      .from("entry_photos")
      .insert(
        photos.map((url, i) => ({
          entry_id: entry.id,
          url,
          position: i,
        }))
      );
  }

  return getJournalEntry(entry.id) as Promise<JournalEntry>;
}

export async function updateJournalEntry(
  id: string,
  data: Partial<Omit<JournalEntry, "id">>
): Promise<JournalEntry | undefined> {
  const { photos, ...rest } = data;

  if (Object.keys(rest).length > 0) {
    const { error } = await supabase()
      .from("journal_entries")
      .update(rest)
      .eq("id", id);

    if (error) throw error;
  }

  if (photos !== undefined) {
    await supabase().from("entry_photos").delete().eq("entry_id", id);
    if (photos.length > 0) {
      await supabase()
        .from("entry_photos")
        .insert(
          photos.map((url, i) => ({
            entry_id: id,
            url,
            position: i,
          }))
        );
    }
  }

  return getJournalEntry(id);
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const { error } = await supabase()
    .from("journal_entries")
    .delete()
    .eq("id", id);

  return !error;
}

// ─── Reactions (toggle behavior) ──────────────────────────────────────

export async function addReaction(
  entryId: string,
  reaction: Omit<Reaction, "id">
): Promise<Reaction | null> {
  const { emoji, by } = reaction;

  const { data: existing } = await supabase()
    .from("reactions")
    .select("id")
    .eq("entry_id", entryId)
    .eq("emoji", emoji)
    .eq("author", by)
    .maybeSingle();

  if (existing) {
    await supabase().from("reactions").delete().eq("id", existing.id);
    return null;
  }

  const { data: created, error } = await supabase()
    .from("reactions")
    .insert({ entry_id: entryId, emoji, author: by })
    .select("*")
    .single();

  if (error) throw error;
  return { id: created.id, emoji, by };
}

// ─── Comments ─────────────────────────────────────────────────────────

export async function addComment(
  entryId: string,
  comment: Omit<Comment, "id" | "date">
): Promise<Comment | null> {
  const { data: created, error } = await supabase()
    .from("comments")
    .insert({
      entry_id: entryId,
      author: comment.by,
      text: comment.text,
    })
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: created.id,
    by: created.author as Author,
    text: created.text,
    date: created.created_at,
  };
}

// ─── Gallery Photos ───────────────────────────────────────────────────

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase()
    .from("gallery_photos")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    url: p.url,
    width: p.width,
    height: p.height,
    caption: p.caption ?? "",
    date: p.date,
  }));
}

// ─── Plans ────────────────────────────────────────────────────────────

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase()
    .from("plans")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    location: p.location ?? undefined,
    note: p.note ?? undefined,
    status: p.status as Plan["status"],
  }));
}

export async function addPlan(plan: Omit<Plan, "id">): Promise<Plan> {
  const { data, error } = await supabase()
    .from("plans")
    .insert(plan)
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    location: data.location ?? undefined,
    note: data.note ?? undefined,
    status: data.status as Plan["status"],
  };
}

export async function updatePlan(
  id: string,
  updates: Partial<Plan>
): Promise<Plan | undefined> {
  const { data, error } = await supabase()
    .from("plans")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return undefined;
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    location: data.location ?? undefined,
    note: data.note ?? undefined,
    status: data.status as Plan["status"],
  };
}

// ─── Important Dates ──────────────────────────────────────────────────

export async function getDates(): Promise<DateInfo[]> {
  const { data, error } = await supabase()
    .from("important_dates")
    .select("*");

  if (error) throw error;
  return (data ?? []).map((d) => ({
    id: d.id,
    emoji: d.emoji,
    label: d.label,
    date: d.date,
    type: d.type as DateInfo["type"],
    person: d.person ?? undefined,
  }));
}

export async function addDateEntry(
  data: Omit<DateInfo, "id">
): Promise<DateInfo> {
  const { data: created, error } = await supabase()
    .from("important_dates")
    .insert(data)
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: created.id,
    emoji: created.emoji,
    label: created.label,
    date: created.date,
    type: created.type as DateInfo["type"],
    person: created.person ?? undefined,
  };
}

export async function updateDateEntry(
  id: string,
  updates: Partial<DateInfo>
): Promise<DateInfo | undefined> {
  const { data, error } = await supabase()
    .from("important_dates")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return undefined;
  return {
    id: data.id,
    emoji: data.emoji,
    label: data.label,
    date: data.date,
    type: data.type as DateInfo["type"],
    person: data.person ?? undefined,
  };
}

export async function getDateEntry(id: string): Promise<DateInfo | undefined> {
  const dates = await getDates();
  return dates.find((d) => d.id === id);
}

// ─── Couple Prompts ───────────────────────────────────────────────────

export async function getTodayPrompt(): Promise<CouplePrompt | undefined> {
  const today = getTodayStr();
  const { data, error } = await supabase()
    .from("couple_prompts")
    .select("*, prompt_answers(*)")
    .eq("date", today)
    .limit(1)
    .maybeSingle();

  if (error || !data) return undefined;
  const prompt = mapPrompt(data);
  return prompt.answers.length < 2 ? prompt : undefined;
}

export async function getAllPrompts(): Promise<CouplePrompt[]> {
  const { data, error } = await supabase()
    .from("couple_prompts")
    .select("*, prompt_answers(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPrompt);
}

export async function getPrompt(
  id: string
): Promise<CouplePrompt | undefined> {
  const { data, error } = await supabase()
    .from("couple_prompts")
    .select("*, prompt_answers(*)")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return mapPrompt(data);
}

export async function answerPrompt(
  promptId: string,
  answer: Omit<PromptAnswer, "date">
): Promise<CouplePrompt | undefined> {
  const { error } = await supabase().from("prompt_answers").upsert(
    {
      prompt_id: promptId,
      author: answer.by,
      text: answer.text,
    },
    { onConflict: "prompt_id, author" }
  );

  if (error) throw error;
  return getPrompt(promptId);
}

export async function addPrompt(
  question: string,
  emoji: string
): Promise<CouplePrompt> {
  const { data, error } = await supabase()
    .from("couple_prompts")
    .insert({
      question,
      emoji,
      date: getTodayStr(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPrompt(data);
}
