# Desktop App Roadmap

## 🎯 High Priority - Core Functionality

### Complete Offline-First Architecture
- Review and potentially refactor `CollectionsProvider` sync logic
- Ensure seamless sync between authenticated users (Electric SQL) and guest users (Zustand)
- Test edge cases: going offline → making changes → coming back online

### Backend Schema Alignment
- Create missing `habits.ts` schema in the backend
- Audit all schemas for consistency between frontend and backend
- Ensure enum values, field types, and validation rules match

---

## 📱 Medium Priority - UX Enhancements

### Add Keyboard Shortcuts Across the App
- ✅ Ctrl+A for tasks (already implemented)
- Add shortcuts for other pages (e.g., Ctrl+W for weight, Ctrl+H for habits)
- Add shortcut for quick navigation between pages
- Add escape key to close dialogs

### Data Export/Import Feature
- Allow users to export their data (JSON/CSV)
- Import functionality for backup restoration
- Useful for users who want to migrate or backup their data

### Charts & Analytics Improvements
- Add date range filters to charts
- Show trends and insights (e.g., "You've logged 5 more workouts this month!")
- Add more chart types (bar charts, pie charts for habit completion)

---

## ✨ Nice to Have - Polish

### Settings Page
- Theme customization (already have dark mode, could add accent colors)
- Data management (clear all data, reset to defaults)
- Notification preferences

### Onboarding Experience (IN PROGRESS)
- First-time user tutorial
- Sample data to demonstrate features
- Quick setup wizard
- Offline-first messaging (login/signup as optional, not required)

---

## 📝 Completed
- ✅ Zustand store migration with persistence
- ✅ Cross-platform desktop builds (Windows, macOS, Linux)
- ✅ Auto-updater integration
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Date pickers for logging past entries
- ✅ Shadcn UI component integration
