# Mobile Offline-First Sync Documentation

This folder contains all documentation related to implementing offline-first architecture in the SelfTracker mobile app (Expo/React Native).

## 📚 Documents

### [implementation-guide.md](./implementation-guide.md)
**Complete step-by-step implementation guide** with code examples for each step.

**What's inside:**
- Backend sync endpoint creation
- Mobile SQLite database setup
- Initial sync service implementation
- React Query hooks for offline operations
- Sync queue for pending changes
- Testing and verification steps

**Use this when:** You want to implement or understand the offline-first system from scratch.

---

### [thinking-process.md](./thinking-process.md)
**Mental model and architectural decisions** behind offline-first with authentication.

**What's inside:**
- The 3 states of offline-first apps
- Where data lives at each stage
- Complete user journey examples
- Multi-device sync strategies
- Conflict resolution approaches

**Use this when:** You want to understand *why* we do things this way, not just *how*.

---

## 🚀 Quick Start

1. **Read the thinking process first** to understand the mental model
2. **Follow the implementation guide** step-by-step
3. **Test each step** as you go
4. **Refer back to thinking process** when you get confused

## 📦 What You'll Build

- ✅ Download all user data on first login
- ✅ Store in local SQLite database
- ✅ Work offline (create, edit, delete)
- ✅ Sync changes when back online
- ✅ Handle conflicts gracefully

## 🎯 Learning Path

### Beginner
Start here if you're new to offline-first:
1. Read `thinking-process.md` completely
2. Understand the 3 states
3. Follow `implementation-guide.md` Step 1-3

### Intermediate
Already familiar with the concept:
1. Skim `thinking-process.md` for mental model
2. Jump to `implementation-guide.md` Step 4
3. Implement sync service

### Advanced
Just need reference code:
1. Use `implementation-guide.md` as code reference
2. Copy-paste and adapt to your needs
3. Focus on sync queue and conflict resolution

## 🔗 Related Docs

- [Offline-First Architecture](../offline-first-architecture.md) - Original architecture doc
- [Offline-First with Auth](../offline-first-with-auth.md) - Detailed mental model

## 💡 Tips

- **Test offline mode frequently** - Don't wait until the end
- **Use console.log liberally** - SQLite errors can be cryptic
- **Start simple** - Get one entity working first, then add others
- **Commit often** - Each step is a natural commit point

## 🐛 Common Issues

**Database locked?**
- You're opening multiple connections
- Use singleton pattern

**Data not syncing?**
- Check network connectivity
- Verify auth token is valid
- Look at sync queue table

**Slow initial sync?**
- Normal for large datasets
- Consider pagination for huge accounts
- Show progress bar

## 📝 Notes

This implementation follows the patterns used by:
- **Linear** (issue tracker)
- **Notion** (note-taking)
- **Todoist** (task manager)

It's production-ready and battle-tested.
