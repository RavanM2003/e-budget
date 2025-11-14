# e-budget

e-budget şəxsi maliyyə davranışını izləmək, büdcələri idarə etmək və qənaət hədəflərini rəqəmsal mühitdə görselleşdirmək üçün hazırlanmış müasir React tətbiqidir. Layihə Vite ilə qurulub, Tailwind CSS ilə stilizə olunub və bütün funksionallıq tam lokal (localStorage) üzərində işlədiyi üçün server tələb etmir.

## Mündəricat

- [Ümumi baxış](#ümumi-baxış)
- [Əsas xüsusiyyətlər](#əsas-xüsusiyyətlər)
- [Texnoloji stack](#texnoloji-stack)
- [Qovluq strukturu](#qovluq-strukturu)
- [Tələblər](#tələblər)
- [Qurulum və işlətmə](#qurulum-və-işlətmə)
- [Faydalı skriptlər](#faydalı-skriptlər)
- [Demo məlumatları](#demo-məlumatları)
- [Məlumatların saxlanması](#məlumatların-saxlanması)
- [Beynəlmiləlləşmə və valyuta](#beynəlmiləlləşmə-və-valyuta)
- [Dizayn və mövzu parametrləri](#dizayn-və-mövzu-parametrləri)
- [GitHub və deploy](#github-və-deploy)
- [Töhfələr](#töhfələr)

## Ümumi baxış

Tətbiq iki əsas hissədən ibarətdir: autentifikasiya (giriş/qeydiyyat/şifrəni unutdum) və qorunan dashboard modulları. İstifadəçilər gəlir/xərc əməliyyatlarını əlavə edir, kateqoriyalar yaradır, aylıq büdcələr və uzunmüddətli məqsədlər üçün limitlər təyin edir. Dashboard real vaxtda yenilənən statistik kartlar, xətt/sahə/sütun qrafikləri və paylanma dianqramları ilə məlumatları vizuallaşdırır.

## Əsas xüsusiyyətlər

- **Analitika paneli:** Gəlir, xərc, xalis nəticə və əməliyyat sayını aylar üzrə müqayisə edən statistik kartlar; Recharts əsasında xətt, sahə, bar və pie qrafikləri; tez-tez istifadə olunan hərəkətlər üçün `Quick actions`.
- **Əməliyyat menecmenti:** Axtarış, tip və tarix filtrasiya­sı, çeşidləmə, səhifələmə, kateqoriya insaytları və modal dialoqlarla əməliyyat əlavə/yenilə/silmə imkanı.
- **Kateqoriya konstrukturu:** Gəlir və xərc kateqoriyalarını rəng kodları ilə yaratmaq, hər kateqoriyanın aylıq performansını izləmək, localStorage üzərindən idarə etmək.
- **Büdcələr və məqsədlər:** Limit/spent göstəricisi olan proqress barlı büdcə kartları, qənaət məqsədləri üçün hədəf, toplanmış məbləğ və tarix izləmə; sürətli xərc/qənaət əlavə etmək üçün interaktiv düymələr.
- **Hesabatlar:** Günlükdən illiyə qədər qruplaşdırma, metric (income/expense/net) və chart növü seçimi, kateqoriya və tip filtrasiya­sı, həm qrafik, həm də cədvəl görünüşü.
- **Autentifikasiya və seans:** Mock `authService` ilə giriş/qeydiyyat/şifrəni bərpa axınları, token & istifadəçi məlumatının localStorage-də saxlanması, `ProtectedRoute` ilə marşrutların qorunması.
- **Parametrlər:** Dil, valyuta, kompakt rejim, animasiya və mövzu (light/dark) seçimləri; istifadəçinin seçimləri `eb:settings` və `eb:theme` açarları ilə yadda saxlanılır.
- **Animasiya və UI:** Framer Motion animasiyaları, Lucide ikon seti, Tailwind CSS 3.x əsasında responsive dizayn.

## Texnoloji stack

- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [React Router DOM 6](https://reactrouter.com)
- [Tailwind CSS 3](https://tailwindcss.com) və PostCSS
- [Recharts](https://recharts.org) (qrafik və diaqramlar)
- [Framer Motion](https://www.framer.com/motion/) (mikro-animasiya)
- [i18next](https://www.i18next.com) + `react-i18next`
- LocalStorage əsaslı kontekst providerləri (Auth, Data, Settings, Theme)
- ESLint 9 + React Hooks & React Refresh plaginləri

## Qovluq strukturu

```text
├─ public/                # statik fayllar və əsas index.html
├─ src/
│  ├─ assets/             # şəkillər və digər resurslar
│  ├─ components/         # UI komponentləri (common, dashboard, transactions və s.)
│  ├─ contexts/           # Auth, Data, Settings, Theme providerləri
│  ├─ data/               # statik dataset və konfiqurasiya faylları
│  ├─ hooks/              # xüsusi hook-lar (məs. useLocalStorage, usePrefersColorScheme)
│  ├─ i18n/               # tərcümə konfiqurasiyası və `az` lokallaşdırması
│  ├─ layouts/            # AuthLayout, DashboardLayout
│  ├─ pages/              # auth və dashboard səviyyəli səhifələr
│  ├─ routes/             # marşrutlar və qoruma komponentləri
│  ├─ services/           # `authService`, digər API/mock servislər
│  ├─ styles/             # Tailwind və qlobal stil faylları
│  └─ utils/              # köməkçi funksiyalar (məs. tarix formatlama)
├─ package.json
└─ vite.config.js
```

## Tələblər

- Node.js **18.0.0** və ya daha yeni (Vite 5 bunu tələb edir)
- `npm`, `pnpm` və ya `yarn` paket menecerlərindən biri
- Modern brauzer (Chrome, Edge, Firefox, Safari) — tətbiq tamamilə front-end-dir

## Qurulum və işlətmə

1. Reponu klonlayın:
   ```bash
   git clone https://github.com/RavanM2003/e-budget.git
   ```
2. Layihə qovluğuna keçin:
   ```bash
   cd e-budget
   ```
3. Asılılıqları quraşdırın:
   ```bash
   npm install
   ```
4. İnkişaf serverini başladın:
   ```bash
   npm run dev
   ```
5. Brauzerdə `http://localhost:5173` ünvanını açın.

> `pnpm` və ya `yarn` istifadə edirsinizsə, yuxarıdakı əmrlərdə `npm` əvəzinə uyğun əmr yazın.

## Faydalı skriptlər

| Əmr             | İzah |
|-----------------|------|
| `npm run dev`   | Vite inkişaf serveri (HMR aktivdir) |
| `npm run build` | Proqramı istehsal rejimində `dist/` qovluğuna qurur |
| `npm run preview` | Qurulan `dist/` mərkəzini lokal serverdə yoxlayır |
| `npm run lint`  | ESLint ilə mənbə kodunu analiz edir |

## Demo məlumatları

- **Giriş** – `demo@ebudget.az` və istənilən şifrə ilə daxil ola bilərsiniz (mock servis yalnız boş sahə olmadığını yoxlayır).
- **Qeydiyyat** – öz adınız/e-poçtunuzla test istifadəçi yarada bilərsiniz; məlumat localStorage-da saxlanılacaq.
- **Şifrəni unutdum** – demo axını e-poçt daxil olduqda uğurlu cavab qaytarır.

## Məlumatların saxlanması

- Əməliyyatlar, kateqoriyalar, büdcələr və məqsədlər `localStorage` daxilində `eb:data` açarı altında saxlanılır.
- Qlobal parametrlər (`dil`, `valyuta`, `compactMode`, `enableAnimations`) `eb:settings` açarıyla, tema seçimi isə `eb:theme` açarıyla çıxarılır.
- Auth məlumatları (`eb:user`, `eb:token`) çıxış edildikdə təmizlənir.
- Tətbiqi sıfırlamaq üçün brauzerin localStorage yaddaşından bu açarları silmək kifayətdir.

## Beynəlmiləlləşmə və valyuta

- `i18next` konfiqurasiyası `src/i18n` qovluğunda saxlanılır; hazırda `az` lokalı tam tərcümə olunub.
- Pul vahidləri `Intl.NumberFormat` ilə formatlanır; `AZN` daxildir, əlavə valyuta sadəcə `settings.currency`-ə yeni kod yazmaqla aktivləşir.

## Dizayn və mövzu parametrləri

- Tailwind konfiqurasiyası (`tailwind.config.js`) komponent əsaslı dizayn sistemi üçün fərdiləşdirilib.
- `ThemeContext` istifadəçinin seçimindən asılı olaraq `html` tag-inə `light`/`dark` klassı əlavə edir.

## GitHub və deploy

1. Kod dəyişikliklərini yoxlayın (`npm run lint` və ya istəyə görə vizual test).
2. İstehsal build-i yaradın:
   ```bash
   npm run build
   ```
3. `dist/` qovluğunu statik hostinqə (GitHub Pages, Netlify, Vercel və s.) yükləyə bilərsiniz. GitHub Pages üçün `dist` məzmununu `gh-pages` branch-ına deploy etmək kifayətdir.
4. Repo-da `node_modules/` və `dist/` kimi generasiya olunan qovluqlar `.gitignore`-da artıq bloklanıb.

## Töhfələr

1. Fork yaradın və `feat/<mövzu>` şəklində branch açın.
2. Kod standartlarına əməl edin (`npm run lint`).
3. Əhəmiyyətli UI dəyişiklikləri üçün lazım gələrsə, README-yə ekran görüntüləri əlavə edin.
4. Pull request açarkən dəyişiklikləri və test addımlarını izah edin.