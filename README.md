# 🍅 Pomodoro Timer

A beautiful, minimalistic Pomodoro timer to boost your productivity with the proven Pomodoro Technique.

## ✨ Features

- **Clean & Minimal Design** - Distraction-free interface
- **Customizable Timers** - Adjust focus and break durations
- **Focus Sessions** - Default 25-minute work intervals
- **Short Breaks** - Default 5-minute rest periods
- **Long Breaks** - 15-minute breaks after 4 sessions
- **Visual Progress** - Elegant progress ring animation with color coding
- **Audio Notifications** - Subtle completion sounds (toggleable)
- **Session Counter** - Track completed pomodoros
- **Statistics** - View completed sessions and total focus time
- **Settings Panel** - Customize timer durations and sound preferences
- **Keyboard Shortcuts** - Spacebar to start/pause, R to reset
- **State Persistence** - Remembers your progress and settings
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid/Flexbox, CSS Animations, Custom Components
- **Audio**: Web Audio API for notification sounds
- **Storage**: localStorage for session and settings persistence
- **Icons**: Emoji and custom CSS styling
- **Fonts**: Inter (Google Fonts)

## 📋 Requirements

### System Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript enabled
- Audio playback capability (optional)

### Development Requirements
- Code editor (VS Code recommended)
- Live server extension or local server
- Git for version control

## 🎯 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pomodoro-timer
   ```

2. **Open in browser**
   - Open `index.html` in your browser
   - Or use a live server for development

3. **Start focusing!**
   - Click start to begin a focus session
   - Customize timer durations in the settings
   - Take breaks when prompted
   - Complete 4 sessions for a long break

## ⚙️ Settings & Customization

### Timer Settings
- **Focus Time**: Adjust from 1-60 minutes (default: 25 minutes)
- **Break Time**: Adjust from 1-30 minutes (default: 5 minutes)
- **Sound Notifications**: Toggle completion sounds on/off

### Keyboard Shortcuts
- **Spacebar**: Start/Pause timer
- **R**: Reset current timer

### Data Persistence
- Your settings are automatically saved to localStorage
- Timer state persists for up to 1 hour if you close/refresh the browser
- Statistics track your total completed sessions and focus time

## 🎨 Design Principles

- **Minimalism**: Clean interface with essential elements only
- **Focus**: Calming gradient background and colors that don't distract
- **Visual Feedback**: Color-coded progress rings (red for focus, green for short breaks, purple for long breaks)
- **Accessibility**: High contrast text and keyboard navigation support
- **Responsiveness**: Seamless experience across all device sizes

## 🔧 Customization

The timer can be easily customized by modifying the default values in `script.js`:

```javascript
// Default timer settings (in minutes)
this.DEFAULT_FOCUS_TIME = 25;
this.DEFAULT_SHORT_BREAK = 5;
this.DEFAULT_LONG_BREAK = 15;
```

Colors and styling can be adjusted in `style.css` for the different session types:

```css
.focus-time { stroke: #ef4444; }      /* Red for focus */
.short-break { stroke: #10b981; }     /* Green for short break */
.long-break { stroke: #8b5cf6; }      /* Purple for long break */
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use and modify as needed.

---

*Built with ❤️ for productivity enthusiasts* 