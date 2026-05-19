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
  isPinned: boolean;
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
  entryId?: string;
  entryTitle?: string;
  entryMood?: string;
  author?: Author;
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

export interface WishlistPlace {
  id: string;
  title: string;
  category: "travel" | "food" | "cafe" | "stay" | "other";
  plannedDate?: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  mapUrl?: string;
  status: "want_to_go" | "booked" | "visited" | "archived";
  createdBy?: Author;
  createdAt?: string;
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
    isPinned: Boolean(row.is_pinned),
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
    .order("is_pinned", { ascending: false })
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
  const { title, date, mood, body, photos, author, isPinned } = data;

  const { data: entry, error } = await supabase()
    .from("journal_entries")
    .insert({ title, date, mood, body, author, is_pinned: isPinned ?? false })
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
  const [entryPhotoResult, galleryPhotoResult] = await Promise.allSettled([
    supabase()
      .from("entry_photos")
      .select("id, url, position, journal_entries!inner(id, title, mood, author, date)")
      .order("position", { ascending: true }),
    supabase()
      .from("gallery_photos")
      .select("*")
      .order("date", { ascending: false }),
  ]);

  const entryPhotos =
    entryPhotoResult.status === "fulfilled" && !entryPhotoResult.value.error
      ? (entryPhotoResult.value.data ?? []).map((p) => {
          const entry = Array.isArray(p.journal_entries)
            ? p.journal_entries[0]
            : p.journal_entries;

          return {
            id: `entry_${p.id}`,
            url: p.url,
            width: 600,
            height: 800,
            caption: (entry?.title as string | undefined) ?? "",
            date: (entry?.date as string | undefined) ?? "",
            entryId: (entry?.id as string | undefined) ?? undefined,
            entryTitle: (entry?.title as string | undefined) ?? "",
            entryMood: (entry?.mood as string | undefined) ?? undefined,
            author: (entry?.author as Author | undefined) ?? undefined,
          } satisfies Photo;
        })
      : [];

  const galleryPhotos =
    galleryPhotoResult.status === "fulfilled" && !galleryPhotoResult.value.error
      ? (galleryPhotoResult.value.data ?? []).map((p) => ({
          id: `gallery_${p.id}`,
          url: p.url,
          width: p.width,
          height: p.height,
          caption: p.caption ?? "",
          date: p.date,
        }))
      : [];

  return [...entryPhotos, ...galleryPhotos].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function toggleJournalEntryPin(
  id: string,
  isPinned: boolean
): Promise<JournalEntry | undefined> {
  const { data, error } = await supabase()
    .from("journal_entries")
    .update({ is_pinned: isPinned })
    .eq("id", id)
    .select("*, entry_photos(*), reactions(*), comments(*)")
    .single();

  if (error) return undefined;
  return mapEntry(data);
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

export async function getUpcomingPlans(limit = 3): Promise<Plan[]> {
  const { data, error } = await supabase()
    .from("plans")
    .select("*")
    .eq("status", "planned")
    .order("date", { ascending: true })
    .limit(limit);

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

// ─── Wishlist ────────────────────────────────────────────────────────

export async function getWishlistPlaces(): Promise<WishlistPlace[]> {
  const { data, error } = await supabase()
    .from("wishlist_places")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category as WishlistPlace["category"],
    plannedDate: item.planned_date ?? undefined,
    address: item.address ?? undefined,
    description: item.description ?? undefined,
    imageUrl: item.image_url ?? undefined,
    mapUrl: item.map_url ?? undefined,
    status: item.status as WishlistPlace["status"],
    createdBy: item.created_by as Author | undefined,
    createdAt: item.created_at ?? undefined,
  }));
}

export async function addWishlistPlace(
  place: Omit<WishlistPlace, "id" | "createdAt">
): Promise<WishlistPlace> {
  const payload = {
    title: place.title,
    category: place.category,
    planned_date: place.plannedDate ?? null,
    address: place.address ?? null,
    description: place.description ?? null,
    image_url: place.imageUrl ?? null,
    map_url: place.mapUrl ?? null,
    status: place.status,
    created_by: place.createdBy ?? null,
  };

  const { data, error } = await supabase()
    .from("wishlist_places")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category as WishlistPlace["category"],
    plannedDate: data.planned_date ?? undefined,
    address: data.address ?? undefined,
    description: data.description ?? undefined,
    imageUrl: data.image_url ?? undefined,
    mapUrl: data.map_url ?? undefined,
    status: data.status as WishlistPlace["status"],
    createdBy: data.created_by as Author | undefined,
    createdAt: data.created_at ?? undefined,
  };
}

export async function updateWishlistPlace(
  id: string,
  updates: Partial<WishlistPlace>
): Promise<WishlistPlace | undefined> {
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.plannedDate !== undefined) payload.planned_date = updates.plannedDate ?? null;
  if (updates.address !== undefined) payload.address = updates.address ?? null;
  if (updates.description !== undefined) payload.description = updates.description ?? null;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl ?? null;
  if (updates.mapUrl !== undefined) payload.map_url = updates.mapUrl ?? null;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.createdBy !== undefined) payload.created_by = updates.createdBy ?? null;

  const { data, error } = await supabase()
    .from("wishlist_places")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return undefined;

  return {
    id: data.id,
    title: data.title,
    category: data.category as WishlistPlace["category"],
    plannedDate: data.planned_date ?? undefined,
    address: data.address ?? undefined,
    description: data.description ?? undefined,
    imageUrl: data.image_url ?? undefined,
    mapUrl: data.map_url ?? undefined,
    status: data.status as WishlistPlace["status"],
    createdBy: data.created_by as Author | undefined,
    createdAt: data.created_at ?? undefined,
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

const POOL_EMOJIS = ["💭", "💕", "🌈", "✨", "🎯", "🌙", "💝", "🎬", "🦋", "🌸", "💫", "🌟", "🎵", "📖", "☕", "🎁", "🌻", "🍀", "💎", "🔥"];

const QUESTION_POOL: string[] = [
  // ── Về tình yêu & cảm xúc ──
  "Khoảnh khắc nào trong ngày hôm nay khiến bạn nghĩ đến đối phương nhất?",
  "Bạn đã yêu đối phương từ khoảnh khắc nào? Hãy kể lại cảm giác lúc đó.",
  "Điều gì ở đối phương khiến bạn cảm thấy an toàn và bình yên nhất?",
  "Nếu phải dùng 3 từ để miêu tả tình yêu của hai đứa, bạn sẽ chọn từ gì?",
  "Lần gần nhất bạn cảm thấy thật sự tự hào về đối phương là khi nào?",
  "Có điều gì bạn muốn nói với đối phương từ lâu nhưng chưa dám nói không?",
  "Bạn nghĩ tình yêu của hai đứa đã thay đổi như thế nào kể từ lúc mới quen?",
  "Làm thế nào bạn biết đối phương đang buồn dù họ không nói ra?",
  "Điều gì khiến bạn cười nhiều nhất khi ở bên đối phương?",
  "Khoảnh khắc nào bạn nhận ra 'đây chính là người mình muốn ở bên'?",

  // ── Về quá khứ & kỷ niệm ──
  "Kỷ niệm nào về lần đầu gặp mặt khiến bạn nhớ mãi?",
  "Chuyến đi chơi nào của hai đứa để lại ấn tượng sâu sắc nhất trong lòng bạn?",
  "Lần đối phương khiến bạn bất ngờ nhất là gì?",
  "Có khoảnh khắc ngượng ngùng hay hài hước nào giữa hai đứa mà giờ nghĩ lại vẫn cười không?",
  "Món quà đầu tiên đối phương tặng bạn là gì? Bạn còn giữ không?",
  "Hai đứa đã cùng nhau vượt qua khó khăn gì? Bài học rút ra là gì?",
  "Kỷ niệm nào của hai đứa mà bạn muốn kể cho con cháu nghe nhất?",
  "Một lần bạn đã làm sai và được đối phương tha thứ — chuyện gì đã xảy ra?",
  "Lần đầu bạn khóc vì đối phương là khi nào?",
  "Bài hát nào gắn liền với một kỷ niệm của hai đứa? Đó là kỷ niệm gì?",

  // ── Về hiện tại & đời sống ──
  "Nếu ngày mai thức dậy và bạn có một ngày hoàn toàn rảnh rỗi bên đối phương, bạn muốn làm gì?",
  "Điều nhỏ nhặt nhất đối phương làm hôm nay khiến bạn thấy vui là gì?",
  "Bữa ăn nào hai đứa cùng nấu hoặc cùng ăn gần đây khiến bạn nhớ nhất?",
  "Gần đây bạn có phát hiện điều gì mới mẻ về đối phương không?",
  "Hôm nay bạn đã nghĩ về đối phương bao nhiêu lần? Lần nào rõ nhất?",
  "Có thói quen hàng ngày nào của đối phương khiến bạn thấy dễ thương không?",
  "Nếu có một ngày hoán đổi vai trò cho đối phương, bạn nghĩ điều gì sẽ bất ngờ nhất?",
  "Một điều bạn muốn cám ơn đối phương vì đã làm hôm nay là gì?",
  "Khung giờ nào trong ngày bạn thấy nhớ đối phương nhất?",
  "Thời tiết hôm nay khiến bạn liên tưởng đến kỷ niệm nào với đối phương?",

  // ── Về tương lai & ước mơ ──
  "Bạn hình dung cuộc sống của hai đứa 10 năm nữa sẽ như thế nào?",
  "Nếu trúng số 10 tỷ, hai đứa sẽ làm gì đầu tiên?",
  "Đám cưới trong mơ của bạn sẽ như thế nào? Có bao nhiêu khách mời? Ở đâu?",
  "Bạn muốn cùng đối phương đi du lịch đến đâu nhất? Vì sao?",
  "Có điều gì bạn muốn cùng đối phương học hoặc trải nghiệm trong năm nay?",
  "Nếu hai đứa có một ngôi nhà chung, nó sẽ ở đâu và có gì đặc biệt?",
  "Bạn muốn đối phương sẽ trở thành người như thế nào trong 5 năm tới?",
  "Có một ước mơ nào từ nhỏ mà bạn muốn kể cho đối phương nghe không?",
  "Nếu có thể cùng nhau làm một dự án chung (kinh doanh, từ thiện, sáng tạo...), bạn muốn làm gì?",
  "Bạn muốn khi về già, hai đứa sẽ sống ở đâu và làm gì mỗi ngày?",

  // ── Về đối phương ──
  "Đặc điểm ngoại hình nào của đối phương khiến bạn mê nhất?",
  "Tính cách nào của đối phương khiến bạn nể phục và yêu nhất?",
  "Nụ cười của đối phương có gì đặc biệt với bạn?",
  "Nếu có thể chọn một siêu năng lực cho đối phương, bạn sẽ chọn gì?",
  "Thói quen xấu nào của đối phương mà bạn vẫn yêu vì nó là một phần của họ?",
  "Giọng nói của đối phương có gì khiến bạn thấy dễ chịu?",
  "Bạn có bí mật nào muốn nói với đối phương nhưng chưa có dịp không?",
  "Món ăn hay đồ uống nào khiến bạn nhớ đến đối phương ngay lập tức?",
  "Đối phương giỏi nhất điều gì mà có thể chính họ cũng không nhận ra?",
  "Nếu dùng một loài hoa để so sánh với đối phương, bạn sẽ chọn hoa gì?",

  // ── Về giao tiếp & thấu hiểu ──
  "Ngôn ngữ tình yêu của bạn là gì? Và bạn nghĩ của đối phương là gì?",
  "Có điều gì bạn mong đối phương hiểu về bạn hơn không?",
  "Khi hai đứa cãi nhau, bạn muốn đối phương làm gì để mọi thứ dịu lại?",
  "Cách đối phương thể hiện tình yêu có gì khác với cách bạn mong đợi không?",
  "Bạn có câu 'code word' hay tín hiệu riêng nào giữa hai đứa không?",
  "Làm sao bạn biết đối phương đang thật sự hạnh phúc?",
  "Đối phương đã dạy cho bạn điều gì về bản thân mà trước đây bạn chưa từng nhận ra?",
  "Có lời nói nào của đối phương khiến bạn nhớ mãi không?",
  "Bạn thích được đối phương an ủi theo cách nào khi bạn buồn?",
  "Nếu có một điều bạn có thể thay đổi trong cách hai đứa giao tiếp, đó là gì?",

  // ── Vui vẻ & ngẫu hứng ──
  "Nếu hai đứa là nhân vật hoạt hình, bạn nghĩ mỗi người sẽ là ai?",
  "Bạn nghĩ đối phương sẽ làm gì nếu bỗng nhiên có thể bay?",
  "Món ăn kỳ lạ nhất mà bạn muốn thử cùng đối phương là gì?",
  "Nếu hai đứa cùng tham gia một cuộc thi nhảy, điệu nhảy nào sẽ là 'vũ khí bí mật'?",
  "Bạn nghĩ ai là người 'hậu đậu' hơn trong hai đứa? Cho ví dụ~",
  "Nếu đối phương là một món đồ ăn, bạn nghĩ họ sẽ là món gì?",
  "Thử thách nào bạn muốn đối phương làm trong 24h tới?",
  "Một bộ phim hoặc show TV nào khiến bạn nghĩ 'giá mà được xem cùng đối phương'?",
  "Nếu có một ngày 'nói ngược', bạn nghĩ hai đứa sẽ gặp tình huống vui gì?",
  "Bạn muốn thử cùng đối phương trải nghiệm món ăn nước ngoài nào nhất?",

  // ── Sâu sắc & triết lý ──
  "Bạn nghĩ bí quyết để giữ một mối quan hệ bền lâu là gì?",
  "Có câu nói hay trích dẫn nào về tình yêu mà bạn tâm đắc không?",
  "Theo bạn, yêu và được yêu — điều gì quan trọng hơn?",
  "Bạn nghĩ gì về câu 'khoảng cách làm tình yêu thêm bền chặt'?",
  "Nếu cuộc đời là một cuốn sách, bạn muốn chương về hai đứa có tiêu đề gì?",
  "Điều gì khiến bạn tin rằng hai đứa thuộc về nhau?",
  "Bạn nghĩ tình yêu thay đổi thế nào theo thời gian? Hai đứa đã trải qua những giai đoạn nào?",
  "Có một kỷ niệm buồn nào của hai đứa mà sau này lại trở thành bài học quý giá không?",
  "Bạn nghĩ 'nhà' là một nơi chốn hay là một con người?",
  "Nếu mai này không còn yêu nhau nữa, bạn muốn được nhớ về điều gì nhất?",

  // ── Mùa & thời gian ──
  "Bạn thích mùa nào nhất để hẹn hò cùng đối phương? Vì sao?",
  "Một ngày mưa lý tưởng bên đối phương sẽ như thế nào?",
  "Giáng sinh này bạn muốn làm gì đặc biệt cho đối phương?",
  "Mùa hè sắp tới, bạn muốn cùng đối phương đi đâu?",
  "Tết năm nay bạn muốn cùng đối phương làm gì khác biệt?",
  "Nếu hai đứa cùng đón bình minh ở một nơi xa, bạn muốn đó là ở đâu?",
  "Thời điểm nào trong năm khiến bạn yêu đời và yêu đối phương nhất?",
  "Một buổi tối mùa đông lạnh, bạn muốn làm gì cùng đối phương?",
  "Ngày sinh nhật lý tưởng mà bạn muốn đối phương tổ chức cho bạn là gì?",
  "Valentine năm nay bạn muốn nhận được gì từ đối phương?",

  // ── Âm nhạc & nghệ thuật ──
  "Nếu hai đứa cùng viết một bài hát, nó sẽ có tựa đề là gì?",
  "Bộ phim nào khiến bạn khóc và muốn ôm đối phương ngay lập tức?",
  "Nếu được chọn một bài hát làm 'nhạc nền' cho chuyện tình hai đứa, bạn chọn bài gì?",
  "Thể loại phim nào hai đứa thường xem cùng nhau nhất?",
  "Có cuốn sách nào bạn muốn giới thiệu cho đối phương đọc không?",
  "Nếu vẽ một bức tranh về đối phương, bạn sẽ vẽ gì?",
  "Bài thơ hay câu hát nào khiến bạn nhớ đến đối phương?",
  "Bạn nghĩ đối phương sẽ thích thể loại nhạc gì nếu họ chưa từng nghe thử?",
  "Nếu hai đứa cùng tập một bài nhảy TikTok, bạn nghĩ ai sẽ học nhanh hơn?",
  "Một concert hoặc live show nào bạn muốn cùng đối phương đi xem nhất?",
];

function pickPoolQuestion(): { question: string; emoji: string } {
  // Hash the date to pick a deterministic question for both users
  const today = getTodayStr();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % QUESTION_POOL.length;
  const emojiIdx = Math.abs(hash) % POOL_EMOJIS.length;
  return { question: QUESTION_POOL[idx], emoji: POOL_EMOJIS[emojiIdx] };
}

export async function ensureTodayPrompt(): Promise<CouplePrompt | undefined> {
  const today = getTodayStr();

  // Check existing
  const { data: existing } = await supabase()
    .from("couple_prompts")
    .select("*, prompt_answers(*)")
    .eq("date", today)
    .limit(1)
    .maybeSingle();

  if (existing) return mapPrompt(existing);

  // Create one from the pool
  const { question, emoji } = pickPoolQuestion();
  const { data: created, error } = await supabase()
    .from("couple_prompts")
    .insert({ question, emoji, date: today })
    .select("*, prompt_answers(*)")
    .single();

  if (error) return undefined;
  return mapPrompt(created);
}

export async function getTodayPrompt(): Promise<CouplePrompt | undefined> {
  const prompt = await ensureTodayPrompt();
  if (!prompt) return undefined;
  return prompt.answers.length < 2 ? prompt : undefined;
}

export async function getAnsweredPrompts(): Promise<CouplePrompt[]> {
  const { data, error } = await supabase()
    .from("couple_prompts")
    .select("*, prompt_answers(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  const mapped = (data ?? []).map(mapPrompt);
  // Only return prompts that have at least one answer
  return mapped.filter((p) => p.answers.length > 0);
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
