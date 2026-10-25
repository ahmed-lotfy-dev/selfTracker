export const projectsData = [
  {
    "title_en": "SelfTracker",
    "title_ar": "SelfTracker",
    "slug": "self-tracker",
    "short_description_en": "A cross-platform (Mobile, Desktop, Web) personal tracking app with AI-powered nutrition analysis, local-first architecture, and optimistic updates for instant UX.",
    "short_description_ar": "تطبيق شامل متعدد المنصات (جوال، سطح المكتب، ويب) لتتبع النمو الشخصي مع تحليل التغذية بالذكاء الاصطناعي، وهندسة محلية أولاً، وتحديثات فورية.",
    "content_en": "# The Vision\nI needed a single, unified place to track my personal growth metrics—weight, workouts, nutrition, habits, and daily tasks. Existing apps were either too bloated, fragmented, or locked behind subscriptions. My goal was to build a **high-performance, cross-platform app** with AI-powered features that I would actually enjoy using every day.\n\n# The Challenge\nBuilding a unified tracker across Mobile, Desktop, and Web with thousands of data points presents multiple challenges:\n- **Performance**: Standard lists struggle with years of workout/weight history\n- **Offline-First**: Must work seamlessly in gyms with poor signal\n- **Cross-Platform**: Native feel on iOS, Android, macOS, Linux, and Windows\n- **AI Integration**: Fast, accurate food recognition without expensive API costs\n- **Real-Time Sync**: Instant updates across all devices without conflicts\n\n# The Solution\nI architected a modern, local-first application with cutting-edge tech:\n\n## 🎯 Key Features\n- **AI Nutrition Analysis**: Integrated Groq's Llama 3.2 Vision model for lightning-fast food recognition (~1000 requests/day free tier)\n- **Optimistic Updates**: Instant UI responses with background API sync for seamless UX\n- **Local-First Architecture**: ElectricSQL + SQLite/MMKV for 0-latency reads and offline capability\n- **Cross-Platform**: Single codebase serving Mobile (Expo), Desktop (Tauri v2), and Web\n- **High-Performance Lists**: FlashList for 60fps scrolling even with 10k+ entries\n- **Real-Time Sync**: Automatic conflict resolution and background synchronization\n\n## 🛠️ Technical Highlights\n- **Backend**: Bun + Hono for blazing fast API (5x faster than Node)\n- **Mobile**: React Native + Expo with NativeWind (TailwindCSS)\n- **Desktop**: Tauri v2 (Rust) for native performance with web tech\n- **Database**: PostgreSQL + Drizzle ORM + ElectricSQL sync\n- **Auth**: Better Auth with secure session management\n- **AI**: Groq Cloud API with Llama 3.2 Vision (11B/90B models)\n\n## 📊 Results  \n- **Performance**: 60 FPS scrolling with 10,000+ log entries\n- **Offline**: Fully functional without internet connection\n- **Speed**: Sub-100ms API responses, instant UI updates\n- **Cost**: Zero AI costs with Groq's generous free tier\n- **UX**: Native feel across all platforms with optimistic updates",
    "content_ar": "# الرؤية\nكنت بحاجة إلى مكان موحد لتتبع مقاييس نموي الشخصي - الوزن، التمارين، التغذية، العادات، والمهام اليومية. التطبيقات الموجودة كانت إما معقدة للغاية، مجزأة، أو مغلقة خلف اشتراكات. كان هدفي بناء **تطبيق عالي الأداء ومتعدد المنصات** مع ميزات الذكاء الاصطناعي.\n\n# التحدي\nبناء متتبع موحد عبر الجوال وسطح المكتب والويب مع آلاف نقاط البيانات يقدم تحديات متعددة:\n- **الأداء**: القوائم العادية تعاني مع سنوات من سجلات التمارين\n- **دون اتصال أولاً**: يجب أن يعمل بسلاسة في الصالات الرياضية ذات الإشارة الضعيفة\n- **متعدد المنصات**: شعور أصلي على iOS، Android، macOS، Linux، وWindows\n- **تكامل الذكاء الاصطناعي**: التعرف السريع والدقيق على الطعام دون تكاليف API باه ظة\n- **المزامنة الفورية**: تحديثات فورية عبر جميع الأجهزة دون تعارضات\n\n# الحل\nقمت بهندسة تطبيق حديث محلي أولاً مع تقنيات متقدمة:\n\n## 🎯 الميزات الرئيسية\n- **تحليل التغذية بالذكاء الاصطناعي**: تكامل نموذج Llama 3.2 Vision من Groq للتعرف الفائق السرعة على الطعام\n- **التحديثات الفورية**: استجابات واجهة مستخدم فورية مع مزامنة API في الخلفية\n- **هندسة محلية أولاً**: ElectricSQL + SQLite/MMKV للقراءة بدون تأخير والعمل دون اتصال\n- **متعدد المنصات**: قاعدة كود واحدة تخدم الجوال (Expo)، سطح المكتب (Tauri v2)، والويب\n- **قوائم عالية الأداء**: FlashList لتمرير 60fps حتى مع 10k+ إدخال\n- **المزامنة الفورية**: حل تلقائي للتعارضات ومزامنة في الخلفية\n\n## 🛠️ النقاط الفنية البارزة\n- **الواجهة الخلفية**: Bun + Hono لأداء API فائق السرعة (5x أسرع من Node)\n- **الجوال**: React Native + Expo مع NativeWind (TailwindCSS)\n- **سطح المكتب**: Tauri v2 (Rust) للأداء الأصلي مع تقنيات الويب\n- **قاعدة البيانات**: PostgreSQL + Drizzle ORM + مزامنة ElectricSQL\n- **المصادقة**: Better Auth مع إدارة جلسات آمنة\n- **الذكاء الاصطناعي**: Groq Cloud API مع Llama 3.2 Vision\n\n## 📊 النتائج\n- **الأداء**: تمرير 60 FPS مع 10,000+ سجل\n- **دون اتصال**: عمل كامل دون اتصال بالإنترنت\n- **السرعة**: استجابات API أقل من 100ms، تحديثات واجهة مستخدم فورية\n- **التكلفة**: تكاليف AI صفرية مع المستوى المجاني السخي من Groq\n- **تجربة المستخدم**: شعور أصلي عبر جميع المنصات مع تحديثات فورية",
    "categories": [
      "React Native",
      "Expo",
      "TypeScript",
      "Hono",
      "Bun",
      "Drizzle ORM",
      "ElectricSQL",
      "Tauri",
      "Groq AI",
      "Mobile",
      "Desktop",
      "Cross-Platform"
    ],
    "published": true,
    "repo_link": "https://github.com/ahmed-lotfy-dev/selfTracker",
    "live_link": "https://selftracker.alotfy.site",
    "cover_image": "self-tracker.jpg"
  }
];
