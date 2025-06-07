class PomodoroTimer {
    constructor() {
        // Default timer settings (in minutes)
        this.DEFAULT_FOCUS_TIME = 25;
        this.DEFAULT_SHORT_BREAK = 5;
        this.DEFAULT_LONG_BREAK = 15;
        
        // Current settings (will be loaded from storage or defaults)
        this.FOCUS_TIME = this.DEFAULT_FOCUS_TIME;
        this.SHORT_BREAK = this.DEFAULT_SHORT_BREAK;
        this.LONG_BREAK = this.DEFAULT_LONG_BREAK;
        this.SOUND_ENABLED = true;
        
        // State
        this.currentTime = this.FOCUS_TIME * 60; // in seconds
        this.isRunning = false;
        this.currentSession = 1;
        this.sessionType = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        this.completedSessions = 0;
        this.totalTime = 0; // in minutes
        this.timer = null;
        this.currentTask = '';
        this.tasks = [];
        this.todayTotalTime = 0; // in seconds
        
        // DOM elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionLabel = document.getElementById('sessionLabel');
        this.readyText = document.getElementById('readyText');
        this.startSessionBtn = document.getElementById('startSessionBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.timerContent = document.querySelector('.timer-content');
        this.focusInput = document.getElementById('focusInput');
        this.taskInput = document.getElementById('taskInput');
        this.startTaskBtn = document.getElementById('startTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.todayTotalTimeDisplay = document.getElementById('todayTotalTime');
        
        // Tab elements
        this.listTab = document.getElementById('listTab');
        this.pomodoroTab = document.getElementById('pomodoroTab');
        this.listContent = document.getElementById('listContent');
        this.pomodoroContent = document.getElementById('pomodoroContent');
        
        // Settings modal elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.pomodoroSettingsLink = document.getElementById('pomodoroSettingsLink');
        this.modalFocusTime = document.getElementById('modalFocusTime');
        this.modalBreakTime = document.getElementById('modalBreakTime');
        this.modalSoundNotifications = document.getElementById('modalSoundNotifications');
        
        // Progress ring calculations
        this.circumference = 2 * Math.PI * 130; // radius = 130
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = this.circumference;
        
        this.initializeEventListeners();
        this.loadStateFromStorage();
        this.loadSettingsFromStorage();
        this.loadTasksFromStorage();
        this.updateDisplay();
        this.updateProgress();
        this.updateTaskList();
        this.updateTodayTime();
    }
    
    initializeEventListeners() {
        // Timer controls
        this.startSessionBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Tab switching
        this.listTab.addEventListener('click', () => this.switchTab('list'));
        this.pomodoroTab.addEventListener('click', () => this.switchTab('pomodoro'));
        
        // Task management
        this.startTaskBtn.addEventListener('click', () => this.startTaskTimer());
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.startTaskTimer();
            }
        });
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.pomodoroSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openSettings();
        });
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
        
        // Settings inputs
        this.modalFocusTime.addEventListener('change', () => this.updateSettings());
        this.modalBreakTime.addEventListener('change', () => this.updateSettings());
        this.modalSoundNotifications.addEventListener('change', () => this.updateSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.code === 'KeyR' && !e.target.matches('input')) {
                e.preventDefault();
                this.resetTimer();
            }
        });
        
        // Save state when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.saveStateToStorage();
            this.saveSettingsToStorage();
            this.saveTasksToStorage();
        });
    }
    
    resetTimer() {
        // Stop the timer if it's running
        this.pauseTimer();
        
        // Reset the current time to the session duration
        this.currentTime = this.getSessionDuration() * 60;
        
        // Update the display and progress
        this.updateDisplay();
        this.updateProgress();
        
        // Reset the ready text
        this.readyText.textContent = 'Ready?';
        
        // Save the state
        this.saveStateToStorage();
    }
    
    switchTab(tab) {
        // Update tab buttons
        this.listTab.classList.toggle('active', tab === 'list');
        this.pomodoroTab.classList.toggle('active', tab === 'pomodoro');
        
        // Update tab content
        this.listContent.classList.toggle('active', tab === 'list');
        this.pomodoroContent.classList.toggle('active', tab === 'pomodoro');
    }
    
    updateSettings() {
        // Get new values from inputs
        const newFocusTime = parseInt(this.modalFocusTime.value) || this.DEFAULT_FOCUS_TIME;
        const newBreakTime = parseInt(this.modalBreakTime.value) || this.DEFAULT_SHORT_BREAK;
        const soundEnabled = this.modalSoundNotifications.checked;
        
        // Validate inputs
        const focusTime = Math.max(1, Math.min(60, newFocusTime));
        const breakTime = Math.max(1, Math.min(30, newBreakTime));
        
        // Update input values if they were corrected
        this.modalFocusTime.value = focusTime;
        this.modalBreakTime.value = breakTime;
        
        // Update settings
        this.FOCUS_TIME = focusTime;
        this.SHORT_BREAK = breakTime;
        this.SOUND_ENABLED = soundEnabled;
        
        // If timer is not running and we're in a focus session, update current time
        if (!this.isRunning && this.sessionType === 'focus') {
            this.currentTime = this.FOCUS_TIME * 60;
            this.updateDisplay();
            this.updateProgress();
        }
        
        // If timer is not running and we're in a short break, update current time
        if (!this.isRunning && this.sessionType === 'shortBreak') {
            this.currentTime = this.SHORT_BREAK * 60;
            this.updateDisplay();
            this.updateProgress();
        }
        
        // Save settings
        this.saveSettingsToStorage();
    }
    
    openSettings() {
        this.settingsModal.classList.add('show');
    }
    
    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }
    
    startTaskTimer() {
        const taskName = this.taskInput.value.trim();
        if (!taskName) return;
        
        this.currentTask = taskName;
        this.focusInput.value = taskName;
        this.taskInput.value = '';
        
        // Switch to pomodoro tab and start timer
        this.switchTab('pomodoro');
        this.startTimer();
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startSessionBtn.textContent = 'Pause';
        this.readyText.textContent = 'Running...';
        this.timerContent.classList.add('pulsing');
        
        // Update body class for progress color
        document.body.className = this.sessionType === 'focus' ? 'focus-mode' : 
                                 this.sessionType === 'shortBreak' ? 'short-break-mode' : 'long-break-mode';
        
        this.timer = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.startSessionBtn.textContent = 'Start session';
        this.readyText.textContent = 'Ready?';
        this.timerContent.classList.remove('pulsing');
        clearInterval(this.timer);
    }
    
    completeSession() {
        this.pauseTimer();
        if (this.SOUND_ENABLED) {
            this.playNotificationSound();
        }
        
        if (this.sessionType === 'focus') {
            this.completedSessions++;
            this.totalTime += this.FOCUS_TIME;
            this.todayTotalTime += this.FOCUS_TIME * 60;
            
            // Add completed task to list
            if (this.currentTask || this.focusInput.value.trim()) {
                const taskName = this.currentTask || this.focusInput.value.trim();
                this.addCompletedTask(taskName, this.FOCUS_TIME);
            }
            
            if (this.currentSession % 4 === 0) {
                this.startLongBreak();
            } else {
                this.startShortBreak();
            }
        } else {
            // Break completed, start new focus session
            this.currentSession++;
            this.startFocusSession();
        }
        
        this.updateDisplay();
        this.updateProgress();
        this.updateTaskList();
        this.updateTodayTime();
        this.saveStateToStorage();
        this.saveTasksToStorage();
    }
    
    addCompletedTask(taskName, duration) {
        const task = {
            id: Date.now(),
            title: taskName,
            duration: duration,
            completedAt: new Date(),
            project: 'Personal',
            tags: ['focus']
        };
        
        this.tasks.unshift(task);
        
        // Keep only today's tasks
        const today = new Date();
        this.tasks = this.tasks.filter(task => {
            const taskDate = new Date(task.completedAt);
            return taskDate.toDateString() === today.toDateString();
        });
    }
    
    updateTaskList() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        
        const duration = this.formatDuration(task.duration * 60);
        
        taskDiv.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <div class="project-indicator"></div>
                    <span class="project-name">${task.project}</span>
                </div>
                <div class="task-tags">
                    ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="task-duration">${duration}</div>
            <button class="task-play-btn">▶</button>
        `;
        
        // Add event listener to play button
        const playBtn = taskDiv.querySelector('.task-play-btn');
        playBtn.addEventListener('click', () => {
            this.currentTask = task.title;
            this.focusInput.value = task.title;
            this.switchTab('pomodoro');
            this.startTimer();
        });
        
        return taskDiv;
    }
    
    updateTodayTime() {
        const formatted = this.formatDuration(this.todayTotalTime);
        this.todayTotalTimeDisplay.textContent = formatted;
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    startFocusSession() {
        this.sessionType = 'focus';
        this.currentTime = this.FOCUS_TIME * 60;
        this.updateSessionDisplay();
        document.body.className = 'focus-mode';
    }
    
    startShortBreak() {
        this.sessionType = 'shortBreak';
        this.currentTime = this.SHORT_BREAK * 60;
        this.updateSessionDisplay();
        document.body.className = 'short-break-mode';
    }
    
    startLongBreak() {
        this.sessionType = 'longBreak';
        this.currentTime = this.LONG_BREAK * 60;
        this.updateSessionDisplay();
        document.body.className = 'long-break-mode';
    }
    
    getSessionDuration() {
        switch (this.sessionType) {
            case 'focus': return this.FOCUS_TIME;
            case 'shortBreak': return this.SHORT_BREAK;
            case 'longBreak': return this.LONG_BREAK;
            default: return this.FOCUS_TIME;
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateSessionDisplay() {
        const sessionTexts = {
            'focus': 'Focus',
            'shortBreak': 'Short Break',
            'longBreak': 'Long Break'
        };
        
        this.sessionLabel.textContent = sessionTexts[this.sessionType];
    }
    
    updateProgress() {
        const totalSeconds = this.getSessionDuration() * 60;
        const remainingSeconds = this.currentTime;
        const progress = (totalSeconds - remainingSeconds) / totalSeconds;
        const offset = this.circumference - (progress * this.circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not available');
        }
    }
    
    saveStateToStorage() {
        const state = {
            currentTime: this.currentTime,
            currentSession: this.currentSession,
            sessionType: this.sessionType,
            completedSessions: this.completedSessions,
            totalTime: this.totalTime,
            todayTotalTime: this.todayTotalTime,
            currentTask: this.currentTask,
            timestamp: Date.now()
        };
        
        localStorage.setItem('pomodoroState', JSON.stringify(state));
    }
    
    loadStateFromStorage() {
        const savedState = localStorage.getItem('pomodoroState');
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const timeDiff = (Date.now() - state.timestamp) / 1000; // seconds
                
                // Only restore state if less than 1 hour has passed
                if (timeDiff < 3600) {
                    this.currentSession = state.currentSession;
                    this.sessionType = state.sessionType;
                    this.completedSessions = state.completedSessions;
                    this.totalTime = state.totalTime;
                    this.todayTotalTime = state.todayTotalTime || 0;
                    this.currentTask = state.currentTask || '';
                    
                    // Adjust current time based on elapsed time
                    this.currentTime = Math.max(0, state.currentTime - Math.floor(timeDiff));
                    
                    if (this.currentTime === 0) {
                        this.currentTime = this.getSessionDuration() * 60;
                    }
                } else {
                    // Reset to default state if too much time has passed
                    this.resetToDefault();
                }
            } catch (error) {
                this.resetToDefault();
            }
        } else {
            this.resetToDefault();
        }
        
        this.updateSessionDisplay();
        document.body.className = this.sessionType === 'focus' ? 'focus-mode' : 
                                 this.sessionType === 'shortBreak' ? 'short-break-mode' : 'long-break-mode';
        
        if (this.currentTask) {
            this.focusInput.value = this.currentTask;
        }
    }
    
    saveSettingsToStorage() {
        const settings = {
            focusTime: this.FOCUS_TIME,
            shortBreak: this.SHORT_BREAK,
            longBreak: this.LONG_BREAK,
            soundEnabled: this.SOUND_ENABLED
        };
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    loadSettingsFromStorage() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.FOCUS_TIME = settings.focusTime || this.DEFAULT_FOCUS_TIME;
                this.SHORT_BREAK = settings.shortBreak || this.DEFAULT_SHORT_BREAK;
                this.LONG_BREAK = settings.longBreak || this.DEFAULT_LONG_BREAK;
                this.SOUND_ENABLED = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
            } catch (error) {
                // Use default settings if parsing fails
                this.FOCUS_TIME = this.DEFAULT_FOCUS_TIME;
                this.SHORT_BREAK = this.DEFAULT_SHORT_BREAK;
                this.LONG_BREAK = this.DEFAULT_LONG_BREAK;
                this.SOUND_ENABLED = true;
            }
        }
        
        // Update input values
        this.modalFocusTime.value = this.FOCUS_TIME;
        this.modalBreakTime.value = this.SHORT_BREAK;
        this.modalSoundNotifications.checked = this.SOUND_ENABLED;
        
        // Update current time if we're starting fresh
        if (this.sessionType === 'focus') {
            this.currentTime = this.FOCUS_TIME * 60;
        }
    }
    
    saveTasksToStorage() {
        localStorage.setItem('pomodoroTasks', JSON.stringify(this.tasks));
    }
    
    loadTasksFromStorage() {
        const savedTasks = localStorage.getItem('pomodoroTasks');
        
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
                
                // Filter only today's tasks
                const today = new Date();
                this.tasks = this.tasks.filter(task => {
                    const taskDate = new Date(task.completedAt);
                    return taskDate.toDateString() === today.toDateString();
                });
                
                // Calculate today's total time
                this.todayTotalTime = this.tasks.reduce((total, task) => total + (task.duration * 60), 0);
            } catch (error) {
                this.tasks = [];
            }
        } else {
            this.tasks = [];
        }
    }
    
    resetToDefault() {
        this.currentTime = this.FOCUS_TIME * 60;
        this.currentSession = 1;
        this.sessionType = 'focus';
        this.completedSessions = 0;
        this.totalTime = 0;
        this.todayTotalTime = 0;
        this.currentTask = '';
    }
}

// Initialize the timer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Add some helpful keyboard shortcuts info (optional)
console.log('🍅 Pomodoro Timer Shortcuts:');
console.log('• Spacebar: Start/Pause timer');
console.log('• R: Reset timer'); 