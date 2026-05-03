# 🔥 BBQ Item Splitter

חלוקת פריטים לברביקיו — אפליקציה משותפת עם סנכרון בזמן אמת.

## הפעלה מקומית

```bash
npm install

# הגדר משתנה סביבה לדאטאבייס
export DATABASE_URL=postgresql://user:password@localhost:5432/bbq

npm start
```

פתח בדפדפן: http://localhost:3000

---

## פריסה ב-Railway

### שלב 1 — צור חשבון ופרויקט
1. היכנס ל-[railway.com](https://railway.com) וצור חשבון
2. לחץ **New Project**

### שלב 2 — הוסף דאטאבייס PostgreSQL
1. בתוך הפרויקט לחץ **+ Add Service → Database → PostgreSQL**
2. המתן שיעלה

### שלב 3 — פרוס את הקוד
1. דחוף את הקוד ל-GitHub repo
2. בפרויקט ב-Railway לחץ **+ Add Service → GitHub Repo**
3. בחר את ה-repo
4. Railway יזהה אוטומטית Node.js ויבנה

### שלב 4 — חבר את הדאטאבייס
1. לחץ על ה-service של האפליקציה
2. לך ל-**Variables**
3. לחץ **+ Add Variable Reference**
4. בחר `DATABASE_URL` מה-Postgres service

### שלב 5 — קבל URL
1. לך ל-**Settings → Networking → Generate Domain**
2. Railway יתן לך URL — שלח אותו לכל המשפחות!

---

## מבנה הפרויקט

```
bbq-splitter/
├── server.js          # Express backend + API
├── schema.sql         # הגדרת הדאטאבייס + נתוני ברירת מחדל
├── package.json
└── public/
    └── index.html     # ממשק בעברית (RTL)
```

## API

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/state` | כל הפריטים והשיוכים |
| POST | `/api/assign` | שיוך פריט למשפחה |
| DELETE | `/api/assign/:item` | ביטול שיוך |
| POST | `/api/items` | הוספת פריט |
| PUT | `/api/items/:item` | שינוי שם פריט |
| DELETE | `/api/items/:item` | מחיקת פריט |
