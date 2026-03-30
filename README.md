# Focus — Todo prototype

## What this app does

**Focus** is a small React todo list with local persistence, task management, and a **category-based suggestion** feature. You can add tasks, mark them complete, delete individual items, clear all completed tasks, and filter the list by **All**, **Active**, or **Completed**. While you type, the app matches keywords to curated “theme” buckets (for example breakfast shopping, travel prep, or coding) and suggests related sub-tasks you might otherwise forget. You can add the top suggestion with **Confirm add**, pick others one by one, or use **Add all** to insert every remaining suggestion in that group in one go.

## What problem it solves

In day-to-day planning, a single high-level task often hides several smaller steps. A classic example is grocery shopping: you write **“buy eggs”** but only later remember you also needed **bread** or **milk**. The same happens for trips (**passport**, **adapter**, **boarding pass**) or development work (**tests**, **docs**, **push**). The suggestion strip appears **while I’m already in the input**, so I can flesh out a goal into a checklist without opening another app or breaking flow. Filters and delete/clear keep the list usable once it grows.

## If I had more time

I would connect the suggestion engine to a **live LLM via an API**, with a **small backend** so API keys stay off the client. That would let suggestions adapt to arbitrary tasks and phrasing instead of relying only on a static word bank, while keeping secrets safe.

## Run locally

From `my-todo-app`:

```bash
npm install
npm start
```

## Run on Vercel

https://to-do-list-ae4c.vercel.app/ 

The app opens in the browser; tasks are stored in `localStorage` under `focus-tasks`.
