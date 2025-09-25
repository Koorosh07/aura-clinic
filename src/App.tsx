import React, { useState } from "react";

// Brand colors (Tailwind tokens)
const BRAND_GREEN = "emerald-700";
const BRAND_GOLD = "yellow-500";

const CLINIC_NAME_FA = "کلینیک آئورا";
const CLINIC_NAME_EN = "Aura Clinic";
const WHATSAPP_NUMBER = "+989981604441";
const PHONE_NUMBER = "02122621416";
const ADDRESS_FA = "تهران - بزرگراه صدر - بعد از شریعتی - قلندری جنوبی - کوچه دهم";
const WORKING_HOURS = "همه‌روزها ۹ صبح تا ۱۱ شب";

const BOOKING_ENDPOINT: string = "";
const PAYMENT_ENDPOINT: string = "";

const BOOKING_PRICE = 300000;
const SLOT_START = "09:00";
const SLOT_END = "23:00";
const SLOT_STEP_MIN = 90;

const SERVICES = [
  { title: "بوتاکس", desc: "رفع خطوط و چین‌وچروک و ایجاد طراوت" },
  { title: "فیشیال تخصصی", desc: "پاکسازی و تغذیه عمقی پوست" },
  { title: "لیزر موهای زائد", desc: "لیزر نسل جدید برای همه تیپ‌های پوستی" },
  { title: "مزوتراپی (درمان ریزش مو)", desc: "تقویت ریشه و کاهش ریزش مو" },
  { title: "جوان‌سازی پوست", desc: "روش‌های متنوع برای بازگرداندن شادابی پوست" },
  { title: "لیفت و فرم‌دهی چهره", desc: "روش‌های مدرن برای زیبایی طبیعی صورت" },
  { title: "طراحی اختصاصی درمان پوست و مو", desc: "برنامه درمانی ویژه برای هر فرد" }
];

const GALLERY_IMAGES = [
  { src: "/gallery1.jpg", alt: "دکتر خشایار نمدچی - ایستاده" },
  { src: "/gallery2.jpg", alt: "دکتر خشایار نمدچی - در حال تزریق" },
  { src: "/gallery3.jpg", alt: "دکتر خشایار نمدچی - لبخند" },
  { src: "/gallery4.jpg", alt: "دکتر خشایار نمدچی - پشت میز" },
  { src: "/gallery5.jpg", alt: "دکتر خشایار نمدچی - ایستاده نمای کامل" }
];

const normalizePhone = (s: string) => (s || "").toString().replace(/\s+/g, "").replace(/[^\d+]/g, "");
const onlyDigits = (s: string) => (s || "").toString().replace(/\D+/g, "");
const buildWaUrl = ({ waNumber, text }: { waNumber: string; text: string }) => {
  const num = onlyDigits(waNumber);
  const msg = encodeURIComponent(text || "");
  return `https://wa.me/${num}?text=${msg}`;
};
const isFutureDateTime = (date: string, time: string) => {
  try {
    const dt = new Date(`${date}T${time}:00`);
    return isFinite(dt.getTime()) && dt.getTime() > Date.now();
  } catch { return false; }
};
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toMinutes = (hhmm: string) => { const [h,m] = hhmm.split(":").map(Number); return h*60 + m; };
const fromMinutes = (min: number) => `${pad2(Math.floor(min/60))}:${pad2(min%60)}`;
const generateSlots = (dateStr: string) => {
  const result: string[] = [];
  for (let t=toMinutes(SLOT_START); t<=toMinutes(SLOT_END); t+=SLOT_STEP_MIN) result.push(fromMinutes(t));
  const today = new Date();
  const sel = new Date(`${dateStr}T00:00:00`);
  const isToday = sel.getFullYear()===today.getFullYear() && sel.getMonth()===today.getMonth() && sel.getDate()===today.getDate();
  if (isToday) {
    const nowMin = today.getHours()*60 + today.getMinutes();
    return result.filter(t => toMinutes(t) > nowMin);
  }
  return result;
};

const cn = (...arr: (string | undefined | false)[]) => arr.filter(Boolean).join(" ");

const Button = ({ as = "button", className = "", children, ...props }: any) => {
  const Cmp: any = as;
  return (
    <Cmp
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border shadow-sm",
        `bg-${BRAND_GREEN} text-white hover:bg-${BRAND_GOLD} focus:outline-none focus:ring`,
        className
      )}
      {...props}
    >
      {children}
    </Cmp>
  );
};
const ButtonOutline = ({ as = "button", className = "", children, ...props }: any) => {
  const Cmp: any = as;
  return (
    <Cmp
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
        `text-${BRAND_GREEN} border-${BRAND_GREEN} hover:bg-${BRAND_GOLD} hover:text-white`,
        className
      )}
      {...props}
    >
      {children}
    </Cmp>
  );
};
const Card = ({ className = "", children }: any) => (
  <div className={cn("rounded-2xl border bg-white shadow-sm", className)}>{children}</div>
);
const CardHeader = ({ className = "", children }: any) => (
  <div className={cn("p-6 border-b", className)}>{children}</div>
);
const CardTitle = ({ className = "", children }: any) => (
  <h3 className={cn("font-bold text-lg", className)}>{children}</h3>
);
const CardContent = ({ className = "", children }: any) => (
  <div className={cn("p-6", className)}>{children}</div>
);
const Input = ({ className = "", ...props }: any) => (
  <input
    className={cn(
      "w-full rounded-xl border px-3 py-2 text-sm outline-none",
      "focus:ring focus:ring-emerald-200",
      className
    )}
    {...props}
  />
);

function Carousel({ images = [] as { src: string; alt: string }[] }) {
  const [index, setIndex] = React.useState(0);
  const count = images.length;
  const clamp = (i: number) => (i + count) % count;
  const next = () => setIndex((i) => clamp(i + 1));
  const prev = () => setIndex((i) => clamp(i - 1));
  const start = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { start.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { if (start.current == null) return; const dx = e.touches[0].clientX - start.current; if (Math.abs(dx) > 60) { dx > 0 ? prev() : next(); start.current = null; } };
  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "ArrowLeft") next(); if (e.key === "ArrowRight") prev(); };
  return (
    <div className="select-none" onKeyDown={onKeyDown} tabIndex={0}>
      <div className="relative overflow-hidden rounded-2xl border">
        <div className="whitespace-nowrap transition-transform duration-500" style={{ transform: `translateX(-${index * 100}%)` }} onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
          {images.map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} className="inline-block align-top w-full h-[480px] object-cover" loading={i===0?"eager":"lazy"} />
          ))}
        </div>
        <button aria-label="قبلی" onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 hover:bg-white rounded-xl px-3 py-2 border shadow">‹</button>
        <button aria-label="بعدی" onClick={next} className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 hover:bg-white rounded-xl px-3 py-2 border shadow">›</button>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button key={i} aria-label={`رفتن به اسلاید ${i+1}`} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full ${i===index?"bg-emerald-600":"bg-slate-300"}`} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3 mt-4">
        {images.map((img, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`overflow-hidden rounded-xl border ${i===index?"ring-2 ring-emerald-600":""}`}>
            <img src={img.src} alt={img.alt} className="w-full h-24 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductsPage({ setView }: { setView: (v: 'home'|'products'|'booking') => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">محصولات {CLINIC_NAME_FA}</h1>
        <ButtonOutline as="button" onClick={() => setView('home')}>بازگشت به صفحه اصلی</ButtonOutline>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle className="text-xl">کرم مراقبت پوست</CardTitle><p className="text-slate-600 mt-1">مناسب انواع پوست، ضد چروک و مرطوب‌کننده</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-xl">سرم ویتامین C</CardTitle><p className="text-slate-600 mt-1">روشن‌کننده و تقویت‌کننده پوست</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-xl">پکیج درمان مو</CardTitle><p className="text-slate-600 mt-1">ترکیب شامپو و سرم برای کاهش ریزش مو</p></CardHeader></Card>
      </div>
    </div>
  );
}

function BookingPage({ setView, submitBooking, booking, setBooking, bookingStatus }: {
  setView: (v: 'home'|'products'|'booking') => void;
  submitBooking: () => void;
  booking: any;
  setBooking: any;
  bookingStatus: string | null;
}) {
  const [slots, setSlots] = React.useState<string[]>([]);
  React.useEffect(() => { if (booking.date) setSlots(generateSlots(booking.date)); else setSlots([]); }, [booking.date]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">نوبت‌دهی آنلاین</h1>
        <ButtonOutline as="button" onClick={() => setView('home')}>بازگشت</ButtonOutline>
      </div>
      <div className="mb-4 text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
        هزینه رزرو: <b>{BOOKING_PRICE.toLocaleString('fa-IR')}</b> تومان — پس از «ثبت نوبت آنلاین» به‌صورت خودکار به صفحه پرداخت هدایت می‌شوید (درگاه پس از فعال‌سازی).
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-3 max-w-md">
          <Input placeholder="نام و نام خانوادگی" value={booking.name} onChange={(e: any)=>setBooking({ ...booking, name: e.target.value })} />
          <Input placeholder="شماره تماس" value={booking.phone} onChange={(e: any)=>setBooking({ ...booking, phone: e.target.value })} />
          <select className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-200" value={booking.service} onChange={(e: any)=>setBooking({ ...booking, service: e.target.value })}>
            {SERVICES.map((s)=> (<option key={s.title} value={s.title}>{s.title}</option>))}
          </select>
          <Input type="date" value={booking.date} onChange={(e: any)=>setBooking({ ...booking, date: e.target.value, slot: '' })} />

          <div className="mt-2">
            <div className="text-sm text-slate-600 mb-2">ساعات خالی با فاصله‌ٔ ۱:۳۰</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.length === 0 && <div className="col-span-full text-slate-500 text-sm">ابتدا تاریخ را انتخاب کنید.</div>}
              {slots.map((t) => (
                <button key={t} onClick={()=>setBooking({ ...booking, slot: t })}
                  className={`px-3 py-2 rounded-xl border text-sm ${booking.slot===t? 'bg-emerald-700 text-white border-emerald-700':'bg-white hover:bg-slate-50'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={submitBooking}>ثبت نوبت آنلاین</Button>
            <ButtonOutline as="button" onClick={()=>setView('home')}>انصراف</ButtonOutline>
          </div>
          {bookingStatus && (<div className="text-sm text-slate-700">{bookingStatus}</div>)}
        </div>
        <div>
          <h3 className="font-bold mb-2">راهنما</h3>
          <ul className="text-sm text-slate-600 list-disc pr-5 space-y-1">
            <li>پس از انتخاب تاریخ، ساعت‌های در دسترس با فاصلهٔ ۹۰ دقیقه نمایش داده می‌شوند.</li>
            <li>برای امروز، زمان‌های گذشته نمایش داده نمی‌شوند.</li>
            <li>هزینه رزرو {BOOKING_PRICE.toLocaleString('fa-IR')} تومان است.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'home'|'products'|'booking'>('home');
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [booking, setBooking] = useState({ name: "", phone: "", service: SERVICES[0]?.title || "", date: "", slot: "" });
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const submitBooking = async () => {
    setBookingStatus(null);
    const onlyDigits = (s: string) => (s || "").toString().replace(/\D+/g, "");
    const isValidPhone = (s: string) => onlyDigits(s).length >= 10;

    if (!booking.name || !isValidPhone(booking.phone) || !booking.service || !booking.date || !booking.slot) {
      setBookingStatus("لطفاً همه فیلدها را کامل و شماره‌تماس معتبر وارد کنید.");
      return;
    }
    if (!isFutureDateTime(booking.date, booking.slot)) {
      setBookingStatus("تاریخ/ساعت معتبر آینده را انتخاب کنید.");
      return;
    }

    const payload: any = { ...booking, price: BOOKING_PRICE, createdAt: new Date().toISOString() };
    let bookingId: string | null = null;

    if (BOOKING_ENDPOINT) {
      try {
        const res = await fetch(BOOKING_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        bookingId = (data && (data.id || data.bookingId)) || null;
        setBookingStatus("✅ درخواست نوبت ثبت شد.");
      } catch (e) {
        console.warn("Booking POST failed", e);
      }
    }

    if (PAYMENT_ENDPOINT) {
      try {
        const payRes = await fetch(PAYMENT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          bookingId,
          amount: BOOKING_PRICE,
          description: `پرداخت رزرو ${booking.service} - ${CLINIC_NAME_FA}`,
          customer: { name: booking.name, phone: booking.phone },
          meta: { date: booking.date, time: booking.slot }
        }) });
        if (!payRes.ok) throw new Error(`HTTP ${payRes.status}`);
        const payData = await payRes.json();
        const url = payData?.paymentUrl || payData?.url;
        if (url) { window.location.href = url; return; }
        else throw new Error("No paymentUrl in response");
      } catch (e) {
        console.warn("Payment create failed", e);
        setBookingStatus("⚠️ اتصال به درگاه پرداخت ناموفق بود.");
      }
    }

    // Fallback: WhatsApp
    const text = `رزرو آنلاین ${CLINIC_NAME_FA}%0A`+
      `نام: ${booking.name}%0A`+
      `شماره: ${booking.phone}%0A`+
      `خدمت: ${booking.service}%0A`+
      `تاریخ: ${booking.date}%0A`+
      `ساعت: ${booking.slot}%0A`+
      `مبلغ: ${BOOKING_PRICE.toLocaleString('fa-IR')} تومان`;
    const waUrl = buildWaUrl({ waNumber: WHATSAPP_NUMBER, text });
    window.open(waUrl, "_self");
    setBookingStatus((s) => s || "✅ پیام واتس‌اپ برای رزرو آماده شد.");
  };

  const normalizePhone = (s: string) => (s || "").toString().replace(/\s+/g, "").replace(/[^\d+]/g, "");

  return (
    <div dir="rtl" className="min-h-screen text-slate-800">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/90 border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button className="flex items-center gap-3" onClick={() => setView('home')}>
            <img src="/Aura-Gold.png" alt="لوگوی آئورا" className="h-10 w-auto" />
            <span className={`font-bold text-lg text-emerald-700`}>{CLINIC_NAME_FA}</span>
          </button>
          <div className="flex items-center gap-2">
            <ButtonOutline as="button" onClick={() => setView('products')}>🧴 محصولات</ButtonOutline>
            <Button onClick={() => setView('booking')}>📅 نوبت آنلاین</Button>
            <ButtonOutline as="a" href={`tel:${normalizePhone(PHONE_NUMBER)}`}>☎ تماس</ButtonOutline>
          </div>
        </div>
      </header>

      {view === 'products' ? (
        <ProductsPage setView={setView} />
      ) : view === 'booking' ? (
        <BookingPage setView={setView} submitBooking={submitBooking} booking={booking} setBooking={setBooking} bookingStatus={bookingStatus} />
      ) : (
        <>
          <section className="relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />
            <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                  زیبایی طبیعی، با رویکرد پزشکی نوین در <span className="text-emerald-700">{CLINIC_NAME_FA}</span>
                </h1>
                <p className="text-slate-600 mb-6">
                  مشاوره تخصصی، تجهیزات پیشرفته، و تیمی از پزشکان مجرب برای ارائه درمان‌های امن و اثربخش در حوزه پوست، مو و زیبایی.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setView('booking')} className="px-5 py-3 text-base">📅 نوبت مشاوره</Button>
                  <ButtonOutline as="a" href="#services" className="px-5 py-3 text-base">مشاهده خدمات</ButtonOutline>
                </div>
              </div>
              <div className="md:justify-self-end">
                <div className="aspect-[4/3] w-full max-w-md bg-white rounded-3xl shadow-xl border overflow-hidden grid place-items-center">
                  <div className="text-center p-6">
                    <h3 className="font-bold text-xl mb-2 text-emerald-700">کلینیک مجهز و مدرن</h3>
                    <p className="text-slate-600">اینجا تصویر/ویدئوی سالن یا قبل/بعد درمان قرار می‌گیرد.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 py-14">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-emerald-700">گالری تصاویر</h2>
              <p className="text-slate-600">مروری سریع بر تصاویر دکتر خشایار نمدچی</p>
            </div>
            <Carousel images={GALLERY_IMAGES} />
          </section>

          <section id="services" className="max-w-6xl mx-auto px-4 py-14">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-emerald-700">خدمات ما</h2>
              <p className="text-slate-600">لیست کامل خدمات ارائه شده در {CLINIC_NAME_FA}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SERVICES.map((s, idx) => (
                <div key={idx} className="rounded-2xl border bg-white shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="font-bold text-xl">{s.title}</h3>
                    <p className="text-slate-600 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border-t">
            <div className="max-w-6xl mx-auto px-4 py-14">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-emerald-700">آدرس و ساعات کاری</h2>
                <p className="text-slate-600">{ADDRESS_FA}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="rounded-2xl border bg-white shadow-sm p-6">
                  <div className="mb-3 text-slate-700">🗺️ مسیر روی نقشه</div>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border">
                    <iframe title="map" src="https://maps.google.com" className="w-full h-full border-0"></iframe>
                  </div>
                </div>
                <div className="rounded-2xl border bg-white shadow-sm p-6">
                  <div className="space-y-3 text-slate-700">
                    <div>⏰ {WORKING_HOURS}</div>
                    <div>☎ {PHONE_NUMBER}</div>
                    <div>{CLINIC_NAME_EN} | {CLINIC_NAME_FA}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} {CLINIC_NAME_FA}. همه حقوق محفوظ است.</p>
          <div className="text-xs text-slate-500">طراحی اولیه • آماده اتصال به دامنه</div>
        </div>
      </footer>
    </div>
  );
}
