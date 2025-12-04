# ⌨️ Keyboard Shortcuts & Tips

## General Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette (planned) |
| `Escape` | Close modal/panel |
| `Tab` | Navigate through interactive elements |
| `Shift + Tab` | Navigate backwards |
| `Enter` | Submit forms, activate buttons |

## Video Room Controls

| Shortcut | Action |
|----------|--------|
| `M` | Toggle microphone |
| `V` | Toggle video |
| `S` | Toggle screen share |
| `C` | Toggle chat panel |
| `W` | Toggle whiteboard |
| `D` | Toggle document editor |
| `L` | Leave meeting |
| `Space` | Push-to-talk (planned) |
| `1-4` | Quick emoji reactions |

## Chat Panel

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Ctrl + E` | Open emoji picker (planned) |
| `↑` | Edit last message (planned) |

## Whiteboard

| Shortcut | Action |
|----------|--------|
| `P` | Pen tool |
| `E` | Eraser tool |
| `L` | Line tool |
| `C` | Circle tool |
| `R` | Rectangle tool |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo (planned) |
| `Delete` | Clear canvas (with confirmation) |
| `Ctrl + S` | Save/export |

## Document Editor

| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + H` | Heading |
| `Ctrl + K` | Insert link (planned) |
| `Ctrl + Shift + 8` | Bullet list |
| `Ctrl + Shift + 7` | Numbered list |
| `Ctrl + S` | Save (auto-save active) |
| `Ctrl + E` | Code block |

## Dashboard

| Shortcut | Action |
|----------|--------|
| `N` | New meeting |
| `/` | Search meetings (planned) |
| `1-9` | Quick access to recent meetings |

## Pro Tips 💡

### Video Quality
- **Good lighting** is more important than camera quality
- Position camera at eye level
- Use headphones to avoid echo
- Mute when not speaking in large meetings

### Chat Etiquette
- Use reactions instead of short replies
- @mention specific people for clarity
- Use threads for side discussions (planned)

### Whiteboard Tips
- Use **different colors** for different topics
- **Larger brush** for titles
- **Smaller brush** for details
- Save frequently when collaborating

### Document Collaboration
- Use **headings** for structure
- **Bold** important points
- Leave comments for questions (planned)
- Save before switching tools

### Performance Tips
- Close unused browser tabs
- Use hardware acceleration in browser
- Limit video quality if bandwidth is low
- Disable video when sharing screen

### Accessibility
- Use keyboard navigation
- Screen reader compatible (planned)
- High contrast mode (planned)
- Text size adjustments (planned)

## Browser Support

✅ **Recommended:**
- Chrome 90+
- Edge 90+
- Safari 14+
- Firefox 88+

⚠️ **Limited Support:**
- Opera
- Brave
- Vivaldi

❌ **Not Supported:**
- Internet Explorer
- Legacy Edge

## Mobile Gestures (Progressive Web App)

| Gesture | Action |
|---------|--------|
| Swipe right | Open sidebar |
| Swipe left | Close sidebar |
| Pinch | Zoom (whiteboard) |
| Long press | Context menu |
| Pull down | Refresh |

## Advanced Features

### URL Parameters

```
/meeting/[roomId]?video=off    - Join with video off
/meeting/[roomId]?audio=off    - Join muted
/meeting/[roomId]?name=John    - Set display name
```

### Developer Console

Press `F12` and use these commands in console:

```javascript
// Toggle debug mode
localStorage.setItem('debug', 'true')

// Clear cache
localStorage.clear()

// Get room info
window.__ROOM_STATE__

// Get user info
window.__USER_STATE__
```

## Hidden Features 🎁

- **Easter Egg**: Type "konami" in any input for surprise
- **Dark Mode**: Auto-detects system preference
- **Animations**: Respects `prefers-reduced-motion`
- **Themes**: More themes coming soon

## Planned Features 🚀

- [ ] Global keyboard shortcuts overlay (`?` key)
- [ ] Customizable shortcuts
- [ ] Voice commands
- [ ] Gesture controls
- [ ] Screen reader improvements
- [ ] Keyboard-only navigation mode
- [ ] Command palette (CMD+K)

---

**Master these shortcuts to become a power user! ⚡**
