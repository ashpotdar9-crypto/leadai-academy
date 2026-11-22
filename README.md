# LeadAI Academy

An interactive, open-access learning app built from the 29 class summaries (Classes 3 to 31) of the CDAIO programme, Pillar 1: Strategic Leadership.

It is a **static website**: plain HTML, CSS and JavaScript. There is no server, no database, no login and **no AI or API calls**, so it costs nothing to run and nothing per visitor.

## What's inside

| Feature | Details |
|---|---|
| Learning path | 9 modules, 29 lessons, shown as a visual path with progress rings |
| Bite-sized lessons | Each class split into 4 to 8 short steps with the original diagrams (tap to enlarge) |
| Class videos | Each lesson plays its summary video; position is remembered |
| Quizzes | 174 multiple-choice questions with instant feedback and explanations |
| Flashcards | 203 cards with spaced repetition (Again / Good / Easy) |
| Practice | Daily challenge, "fix your mistakes", module tests, 25-question full exam |
| Motivation | XP, levels, daily goal, day streak, 12 badges, confetti and sound effects |
| Search | Full-text search across lessons, takeaways and flashcards |
| Notes | Personal reflections per lesson, plus the original PDF summary |
| Progress | 14-day XP chart, accuracy, module mastery |
| Comfort | Dark mode, mobile layout with bottom tabs, keyboard shortcuts, works offline once loaded |

Progress is saved in each visitor's own browser (localStorage). Visitors can export and import a backup from Settings.

## Try it on your computer

Double-click `index.html`. Everything works directly from the folder, including the videos.

(Offline caching only turns on when the app is served over http/https, which is what happens once it's published.)

## Publish it free

The folder is about 220 MB, almost all of it videos (`media/videos`). Every file is under 10 MB.

**Netlify (easiest, no account setup beyond sign-in):**
1. Go to app.netlify.com/drop.
2. Drag this whole folder onto the page.
3. You get a public link in about a minute. You can rename the site in Site settings.

**GitHub Pages:**
1. Create a new public repository and upload the contents of this folder (GitHub Desktop handles the size easily).
2. In the repository go to Settings, Pages, and pick "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Your app appears at `https://<your-username>.github.io/<repo-name>/`.

**Cloudflare Pages** also works: create a project, choose "Direct upload" and upload the folder.

If you would rather not host the videos, delete `media/videos`. The Watch tab then shows a friendly "video not available" note and everything else keeps working.

## Folder layout

```
index.html            the app
css/app.css           styles (light and dark themes)
js/app.js             app logic (router, quizzes, flashcards, XP, search)
data/course.js        all lesson content, quizzes and flashcards
assets/figures/       diagrams cropped from the class summaries
media/notes/          original summary PDFs
media/videos/         class videos
sw.js, manifest.webmanifest   offline support and "install as app"
```

## Editing content

All text lives in `data/course.js` (`window.COURSE = {...}`). Each lesson has `sections`, `takeaways`, `quiz` items (`q` question, `a` correct answer, `w` wrong answers, `x` explanation) and `cards` (`f` front, `b` back). Answers are shuffled automatically.
To rename the app, change "LeadAI Academy" in `index.html`, `manifest.webmanifest` and `js/app.js`.

Before publishing to the open web, make sure you're comfortable sharing the class materials (videos and summaries) publicly.
