export const projectsData = [
  {
    "title_en": "SelfTracker",
    "title_ar": "SelfTracker",
    "slug": "self-tracker",
    "short_description_en": "A minimalist, high-performance mobile app for tracking personal growth metrics (weight, workouts, tasks) built with React Native and Hono.",
    "short_description_ar": "تطبيق جوال بسيط وعالي الأداء لتتبع مقاييس النمو الشخصي (الوزن، التمارين، المهام) تم بناؤه باستخدام React Native و Hono.",
    "content_en": "# The Vision\nI needed a single, unified place to track my personal growth metrics—weight, workout logs, and daily productivity tasks. Existing apps were either too bloated, fragmented, or locked behind subscriptions. My goal was to build a **minimalist, high-performance mobile app** that I would actually enjoy using every day.\n\n# The Challenge\nTracking workouts and weight over years creates massive lists of data that can lag a standard mobile UI. The challenge was ensuring 60 FPS performance even with thousands of log entries, and ensuring reliability in gyms with poor signal.\n- **Performance**: Standard `FlatList` struggles with complex, long histories.\n- **Offline Usage**: The app needed to work seamlessly without an internet connection.\n\n# The Solution\nI architected a performance-first, offline-first mobile application:\n- **High Performance List**: Implemented **FlashList** (by Shopify) to recycle views efficiently.\n- **Offline Implementation**: Using `AsyncStorage` and local-first architecture for instant UI updates.\n- **Modern Stack**: Leveraged **Expo** and **React Native** for the frontend, and **Bun** with **Hono** for a blazing fast backend.",
    "content_ar": "# الرؤية\nكنت بحاجة إلى مكان موحد لتتبع مقاييس نموي الشخصي - الوزن، سجلات التمارين، ومهام الإنتاجية اليومية. التطبيقات الموجودة كانت إما معقدة للغاية أو مجزأة. كان هدفي بناء **تطبيق جوال بسيط وعالي الأداء** أستمتع باستخدامه يوميًا.\n\n# التحدي\nتتبع التمارين والوزن على مدى سنوات ينشئ قوائم ضخمة من البيانات التي يمكن أن تبطئ واجهة المستخدم. كان التحدي هو ضمان أداء 60 إطارًا في الثانية حتى مع آلاف السجلات، وضمان الموثوقية في الصالات الرياضية ذات الإشارة الضعيفة.\n- **الأداء**: تعاني القوائم العادية `FlatList` مع السجلات الطويلة والمعقدة.\n- **الاستخدام دون اتصال**: كان التطبيق بحاجة للعمل بسلاسة دون اتصال بالإنترنت.\n\n# الحل\nقمت بهندسة تطبيق جوال يركز على الأداء ويعمل دون اتصال أولاً:\n- **قائمة عالية الأداء**: طبقت **FlashList** (من Shopify) لإعادة تدوير العروض بكفاءة.\n- **التنفيذ دون اتصال**: استخدام `AsyncStorage` وهندسة المحل أولاً (local-first) لتحديثات واجهة المستخدم الفورية.\n- **حزمة حديثة**: الاستفادة من **Expo** و **React Native** للواجهة الأمامية، و **Bun** مع **Hono** لواجهة خلفية فائقة السرعة.",
    "categories": [
      "React Native",
      "Expo",
      "TypeScript",
      "Hono",
      "Bun",
      "Drizzle ORM",
      "Mobile"
    ],
    "published": true,
    "repo_link": "https://github.com/ahmed-lotfy-dev/selfTracker",
    "live_link": "",
    "cover_image": "self-tracker.jpg"
  }
];
