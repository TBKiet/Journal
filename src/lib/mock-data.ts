// ─── Journal Entries ────────────────────────────────────────────────

export type Author = 'BK' | 'Bi';

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

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const journalEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'Buổi hẹn đầu tiên',
    date: '2026-03-14',
    mood: '🥰',
    body: 'Hôm nay là buổi hẹn đầu tiên của hai đứa mình. Anh đưa em đi ăn phở sáng rồi dạo quanh Hồ Gươm. Trời se lạnh, em mặc chiếc áo len màu kem trông dễ thương lắm. Anh đã rất hồi hộp nhưng mọi thứ diễn ra thật tự nhiên. Chúng mình nói chuyện suốt 4 tiếng không biết chán. Anh biết đây sẽ là khởi đầu của một điều gì đó thật đặc biệt.',
    photos: [
      'https://picsum.photos/seed/journal1a/400/400',
      'https://picsum.photos/seed/journal1b/400/300',
    ],
    author: 'BK',
    reactions: [
      { id: 'rxn_1', emoji: '❤️', by: 'Bi' },
      { id: 'rxn_2', emoji: '🥺', by: 'Bi' },
    ],
    comments: [
      { id: 'cmt_1', by: 'Bi', text: 'Em cũng nhớ buổi hẹn đó lắm 💕 Ngày hôm đó thật đặc biệt với em.', date: '2026-03-15T10:30:00' },
      { id: 'cmt_2', by: 'BK', text: 'Sau hôm đó anh biết là anh đã tìm đúng người rồi.', date: '2026-03-15T11:00:00' },
    ],
  },
  {
    id: '2',
    title: 'Món bò sốt vang của Em',
    date: '2026-04-22',
    mood: '😋',
    body: 'Cuối tuần em quyết định thử nấu món bò sốt vang lần đầu tiên. Em xem YouTube học công thức rồi ra chợ mua nguyên liệu. Nấu mất 3 tiếng đồng hồ mà bếp thì bừa bộn hết lên. Nhưng mà lúc dọn ra, anh nếm thử rồi khen "ngon hơn ngoài hàng" làm em vui muốn xỉu. Từ giờ mỗi cuối tuần em sẽ nấu cho anh ăn nha.',
    photos: [
      'https://picsum.photos/seed/journal2a/400/300',
      'https://picsum.photos/seed/journal2b/400/400',
      'https://picsum.photos/seed/journal2c/400/300',
    ],
    author: 'Bi',
    reactions: [
      { id: 'rxn_3', emoji: '😍', by: 'BK' },
      { id: 'rxn_4', emoji: '👨‍🍳', by: 'BK' },
      { id: 'rxn_5', emoji: '❤️', by: 'Bi' },
    ],
    comments: [
      { id: 'cmt_3', by: 'BK', text: 'Anh hứa sẽ làm phụ bếp, không để em vất vả một mình đâu!', date: '2026-04-23T09:00:00' },
      { id: 'cmt_4', by: 'Bi', text: 'Tuần sau em nấu món mới cho anh thử nha~', date: '2026-04-23T10:00:00' },
    ],
  },
  {
    id: '3',
    title: 'Trời mưa và nỗi nhớ',
    date: '2026-05-03',
    mood: '😢',
    body: 'Hôm nay hai đứa cãi nhau. Chỉ là chuyện nhỏ thôi, về việc anh quên mất giờ hẹn đi café cuối tuần. Em giận không thèm nhắn tin cả buổi. Anh biết lỗi rồi, anh xin lỗi em. Giờ Sài Gòn mưa to quá, ngồi một mình trong phòng mà nhớ em da diết. Thương em thật nhiều mà đôi lúc anh vụng về quá.',
    photos: [],
    author: 'BK',
    reactions: [
      { id: 'rxn_6', emoji: '🥺', by: 'Bi' },
      { id: 'rxn_7', emoji: '💕', by: 'Bi' },
    ],
    comments: [
      { id: 'cmt_5', by: 'Bi', text: 'Em cũng xin lỗi vì đã giận anh lâu như vậy. Em cũng nhớ anh nhiều lắm.', date: '2026-05-03T22:00:00' },
      { id: 'cmt_6', by: 'BK', text: 'Mai anh qua đón em đi ăn sáng nha. Anh hứa không quên nữa.', date: '2026-05-03T22:15:00' },
      { id: 'cmt_7', by: 'Bi', text: 'Dạ, mai em chờ anh. Yêu anh~ 💕', date: '2026-05-03T22:20:00' },
    ],
  },
  {
    id: '4',
    title: 'Chuyến đi Vũng Tàu bất ngờ',
    date: '2026-05-11',
    mood: '🤩',
    body: 'Sáng thứ 7 anh rủ em đi Vũng Tàu chơi. Hai đứa chất đồ lên xe máy rồi phi ra bến phà. Chưa kịp chuẩn bị gì nhiều nhưng chuyến đi vui lắm. Tắm biển xong lên bờ mua hải sản nướng, ngồi ghế đá vừa ăn vừa ngắm hoàng hôn. Anh còn chụp được tấm hình em cười tươi dưới nắng chiều, đẹp muốn khóc luôn. Lần sau mình đi Phan Thiết nha em.',
    photos: [
      'https://picsum.photos/seed/journal4a/400/300',
      'https://picsum.photos/seed/journal4b/400/500',
      'https://picsum.photos/seed/journal4c/400/300',
      'https://picsum.photos/seed/journal4d/400/400',
    ],
    author: 'BK',
    reactions: [
      { id: 'rxn_8', emoji: '🏖️', by: 'Bi' },
      { id: 'rxn_9', emoji: '😍', by: 'Bi' },
      { id: 'rxn_10', emoji: '🥰', by: 'Bi' },
    ],
    comments: [
      { id: 'cmt_8', by: 'Bi', text: 'Tấm hình anh chụp em đẹp thật. Em để làm hình nền điện thoại luôn đó.', date: '2026-05-12T08:00:00' },
      { id: 'cmt_9', by: 'BK', text: 'Lần sau đi Phan Thiết anh sẽ chụp em nhiều hơn nữa nha!', date: '2026-05-12T09:00:00' },
    ],
  },
  {
    id: '5',
    title: 'Tối thứ 7 lười biếng',
    date: '2026-05-17',
    mood: '😴',
    body: 'Lăn lộn ở nhà cả ngày. Đặt pizza về. Coi Netflix. Nằm gối đầu lên đùi anh. Không muốn làm gì hết. Best Saturday ever.',
    photos: [
      'https://picsum.photos/seed/journal5a/400/300',
    ],
    author: 'Bi',
    reactions: [
      { id: 'rxn_11', emoji: '🍕', by: 'BK' },
      { id: 'rxn_12', emoji: '😴', by: 'BK' },
    ],
    comments: [
      { id: 'cmt_10', by: 'BK', text: 'Anh thích nhất mấy hôm lười biếng với em vậy đó. Đơn giản mà hạnh phúc.', date: '2026-05-18T07:00:00' },
    ],
  },
];

let _currentUser: Author = 'BK';

export function getCurrentUser(): Author {
  return _currentUser;
}

export function setCurrentUser(user: Author): void {
  _currentUser = user;
}

export function getJournalEntries(): JournalEntry[] {
  return [...journalEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getJournalEntry(id: string): JournalEntry | undefined {
  return journalEntries.find((e) => e.id === id);
}

export function addJournalEntry(
  data: Omit<JournalEntry, 'id' | 'reactions' | 'comments'>
): JournalEntry {
  const entry: JournalEntry = {
    ...data,
    id: genId('entry'),
    reactions: [],
    comments: [],
  };
  journalEntries.push(entry);
  return entry;
}

export function updateJournalEntry(
  id: string,
  data: Partial<Omit<JournalEntry, 'id'>>
): JournalEntry | undefined {
  const idx = journalEntries.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  journalEntries[idx] = { ...journalEntries[idx], ...data };
  return journalEntries[idx];
}

export function deleteJournalEntry(id: string): boolean {
  const idx = journalEntries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  journalEntries.splice(idx, 1);
  return true;
}

export function addReaction(
  entryId: string,
  reaction: Omit<Reaction, 'id'>
): Reaction | null {
  const entry = journalEntries.find((e) => e.id === entryId);
  if (!entry) return null;
  const existing = entry.reactions.find(
    (r) => r.emoji === reaction.emoji && r.by === reaction.by
  );
  if (existing) {
    entry.reactions = entry.reactions.filter((r) => r.id !== existing.id);
    return null;
  }
  const newReaction: Reaction = { ...reaction, id: genId('rxn') };
  entry.reactions.push(newReaction);
  return newReaction;
}

export function addComment(
  entryId: string,
  comment: Omit<Comment, 'id' | 'date'>
): Comment | null {
  const entry = journalEntries.find((e) => e.id === entryId);
  if (!entry) return null;
  const newComment: Comment = {
    ...comment,
    id: genId('cmt'),
    date: new Date().toISOString(),
  };
  entry.comments.push(newComment);
  return newComment;
}

// ─── Photos ─────────────────────────────────────────────────────────

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
  type: "first-meet" | "first-date" | "anniversary" | "birthday-him" | "birthday-her";
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

let plans: Plan[] = [
  {
    id: "1",
    title: "Đi Đà Lạt",
    date: "2026-06-15",
    location: "Đà Lạt",
    note: "Đặt vé máy bay, khách sạn 2 đêm, thuê xe máy đi tham quan vườn hoa",
    status: "planned",
  },
  {
    id: "2",
    title: "Xem phim Love Story",
    date: "2026-05-25",
    location: "CGV Vincom",
    note: "Suất 7h tối, mua bắp + nước",
    status: "planned",
  },
  {
    id: "3",
    title: "Nấu lẩu tại nhà",
    date: "2026-05-10",
    location: "Nhà",
    note: "Mua thịt bò, rau, nấm, nước lẩu Thái",
    status: "done",
  },
  {
    id: "4",
    title: "Đi spa couple",
    date: "2026-07-01",
    location: "Spa Lan Hương, Q1",
    note: "Đặt gói couple 90 phút, massage đá nóng",
    status: "planned",
  },
  {
    id: "5",
    title: "Học nấu bánh",
    date: "2026-04-20",
    location: "Savours, Q2",
    note: "Lớp làm bánh tiramisu 2 tiếng",
    status: "cancelled",
  },
];

const dateEntries: DateInfo[] = [
  {
    id: "first-meet",
    emoji: "💫",
    label: "Ngày đầu gặp nhau",
    date: "2024-11-15",
    type: "first-meet",
  },
  {
    id: "first-date",
    emoji: "💘",
    label: "Ngày đầu hẹn hò",
    date: "2024-12-01",
    type: "first-date",
  },
  {
    id: "anniversary",
    emoji: "💍",
    label: "Kỷ niệm",
    date: "2025-06-10",
    type: "anniversary",
  },
  {
    id: "birthday-him",
    emoji: "🎂",
    label: "Sinh nhật",
    date: "1998-03-15",
    type: "birthday-him",
    person: "BK",
  },
  {
    id: "birthday-her",
    emoji: "🎂",
    label: "Sinh nhật",
    date: "1999-08-22",
    type: "birthday-her",
    person: "Bi",
  },
];

export function getDates(): DateInfo[] {
  return [...dateEntries];
}

export function updateDateEntry(id: string, updates: Partial<DateInfo>): DateInfo | undefined {
  const idx = dateEntries.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  dateEntries[idx] = { ...dateEntries[idx], ...updates };
  return dateEntries[idx];
}

export function addDateEntry(data: Omit<DateInfo, "id">): DateInfo {
  const entry: DateInfo = { ...data, id: genId("date") };
  dateEntries.push(entry);
  return entry;
}

export function getDateEntry(id: string): DateInfo | undefined {
  return dateEntries.find((d) => d.id === id);
}

export function getPlans(): Plan[] {
  return [...plans];
}

export function addPlan(plan: Omit<Plan, "id">): Plan {
  const newPlan: Plan = {
    ...plan,
    id: String(Date.now()),
  };
  plans = [newPlan, ...plans];
  return newPlan;
}

export function updatePlan(id: string, updates: Partial<Plan>): Plan | undefined {
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  plans[idx] = { ...plans[idx], ...updates };
  return plans[idx];
}

// ─── Couple Prompts ─────────────────────────────────────────────────

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

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const prompts: CouplePrompt[] = [
  {
    id: "prompt_1",
    question: "Khoảnh khắc nào trong ngày hôm nay khiến bạn nghĩ đến đối phương nhất?",
    date: getTodayStr(),
    emoji: "💭",
    answers: [],
  },
  {
    id: "prompt_2",
    question: "Nếu có thể dành một ngày trọn vẹn bên nhau ngày mai, bạn muốn làm gì nhất?",
    date: getTodayStr(),
    emoji: "🌈",
    answers: [
      { by: "BK", text: "Anh muốn đưa em đi ăn sáng, rồi dạo quanh hồ, chiều đi xem phim và tối nấu ăn cùng nhau. Một ngày bình dị nhưng trọn vẹn.", date: "2026-05-18T09:30:00" },
      { by: "Bi", text: "Em muốn đi picnic ở công viên, mang theo đồ ăn tự nấu, nằm đọc sách cùng anh dưới bóng cây. Hoặc là đi biển ngắm hoàng hôn cũng được~", date: "2026-05-18T11:00:00" },
    ],
  },
  {
    id: "prompt_3",
    question: "Bạn thích điều gì nhất ở đối phương?",
    date: "2026-05-15",
    emoji: "💝",
    answers: [
      { by: "BK", text: "Anh thích nhất nụ cười của em. Mỗi lần em cười làm anh thấy cả thế giới sáng bừng lên. Và cách em quan tâm đến anh từ những điều nhỏ nhặt nhất.", date: "2026-05-15T20:00:00" },
      { by: "Bi", text: "Em thích sự kiên nhẫn của anh. Dù em có giận dỗi vô lý cỡ nào anh cũng nhẹ nhàng dỗ dành. Và đôi mắt anh mỗi lần nhìn em, nó ấm áp lắm.", date: "2026-05-16T08:00:00" },
    ],
  },
  {
    id: "prompt_4",
    question: "Kỷ niệm vui nhất của hai đứa từ trước đến giờ là gì?",
    date: "2026-05-08",
    emoji: "🎬",
    answers: [
      { by: "Bi", text: "Lần đầu anh dẫn em đi Vũng Tàu. Xe máy hết xăng giữa đường, hai đứa dắt bộ 2km dưới trời nắng. Mệt muốn xỉu mà giờ nghĩ lại thấy vui không tả được.", date: "2026-05-08T15:00:00" },
      { by: "BK", text: "Lần em tập nấu bò sốt vang cho anh, làm bếp loạn hết lên mà món ăn thì siêu ngon. Nhìn em lăng xăng trong bếp mà anh thấy thương vô cùng.", date: "2026-05-09T09:00:00" },
    ],
  },
  {
    id: "prompt_5",
    question: "Món quà ý nghĩa nhất bạn từng nhận được từ đối phương là gì?",
    date: "2026-05-01",
    emoji: "🎁",
    answers: [
      { by: "BK", text: "Là lá thư tay em viết hồi Valentine đầu tiên. Em viết 3 trang giấy, còn vẽ hình hai đứa ở góc. Anh giữ trong ví tới giờ.", date: "2026-05-01T10:00:00" },
      { by: "Bi", text: "Cái ôm của anh mỗi lúc em buồn. Không cần quà gì to tát, chỉ cần anh ở bên lặng lẽ lau nước mắt cho em là đủ rồi.", date: "2026-05-02T22:00:00" },
    ],
  },
  {
    id: "prompt_6",
    question: "Nếu có siêu năng lực, bạn sẽ dùng nó để làm gì cho đối phương?",
    date: "2026-04-26",
    emoji: "🦸",
    answers: [
      { by: "Bi", text: "Em sẽ dịch chuyển tức thời để mỗi lúc anh mệt mỏi, em có thể xuất hiện bên cạnh anh ngay lập tức. Không cần phải chờ cuối tuần mới gặp nhau nữa.", date: "2026-04-26T19:00:00" },
    ],
  },
];

export function getTodayPrompt(): CouplePrompt | undefined {
  const today = getTodayStr();
  return prompts.find((p) => p.date === today && p.answers.length < 2);
}

export function getAllPrompts(): CouplePrompt[] {
  return [...prompts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPrompt(id: string): CouplePrompt | undefined {
  return prompts.find((p) => p.id === id);
}

export function answerPrompt(promptId: string, answer: Omit<PromptAnswer, "date">): CouplePrompt | undefined {
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) return undefined;
  const existing = prompt.answers.find((a) => a.by === answer.by);
  if (existing) {
    existing.text = answer.text;
  } else {
    prompt.answers.push({ ...answer, date: new Date().toISOString() });
  }
  return prompt;
}

export function addPrompt(question: string, emoji: string): CouplePrompt {
  const prompt: CouplePrompt = {
    id: genId("prompt"),
    question,
    date: getTodayStr(),
    emoji,
    answers: [],
  };
  prompts.unshift(prompt);
  return prompt;
}

export function getPhotos(): Photo[] {
  return [
    { id: "p1", url: "https://picsum.photos/seed/oj1/600/800", width: 600, height: 800, caption: "Hoàng hôn Đà Nẵng", date: "2025-04-12" },
    { id: "p2", url: "https://picsum.photos/seed/oj2/600/600", width: 600, height: 600, caption: "Cà phê sáng cuối tuần", date: "2025-04-10" },
    { id: "p3", url: "https://picsum.photos/seed/oj3/600/900", width: 600, height: 900, caption: "Dạo phố Sài Gòn", date: "2025-03-28" },
    { id: "p4", url: "https://picsum.photos/seed/oj4/600/700", width: 600, height: 700, caption: "Bữa tối lãng mạn", date: "2025-03-15" },
    { id: "p5", url: "https://picsum.photos/seed/oj5/600/650", width: 600, height: 650, caption: "Chuyến đi Vũng Tàu", date: "2025-02-14" },
    { id: "p6", url: "https://picsum.photos/seed/oj6/600/850", width: 600, height: 850, caption: "Cùng nhau nấu ăn", date: "2025-02-01" },
    { id: "p7", url: "https://picsum.photos/seed/oj7/600/550", width: 600, height: 550, caption: "Dã ngoại công viên", date: "2025-01-20" },
    { id: "p8", url: "https://picsum.photos/seed/oj8/600/750", width: 600, height: 750, caption: "Kỷ niệm 1 năm", date: "2025-06-10" },
    { id: "p9", url: "https://picsum.photos/seed/oj9/600/620", width: 600, height: 620, caption: "Cafe sáng mưa", date: "2025-01-05" },
    { id: "p10", url: "https://picsum.photos/seed/oj10/600/880", width: 600, height: 880, caption: "Đêm pháo hoa", date: "2024-12-31" },
  ];
}
