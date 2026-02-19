// Password protection for weekly pages
const PASSWORDS = {
    'week1': 'learner2024',
    'week2': 'learner2024',
    'week3': 'learner2024',
    'week4': 'learner2024',
    'week5': 'learner2024'
};

// ===== PROGRESS TRACKING SYSTEM =====

// Initialize progress data
function initializeProgress() {
    if (!localStorage.getItem('aiReadinessProgress')) {
        const initialProgress = {
            unlockedWeeks: [],
            completedWeeks: [],
            weekProgress: {
                week1: 0,
                week2: 0,
                week3: 0,
                week4: 0,
                week5: 0
            },
            lastVisit: new Date().toISOString(),
            streakCount: 1,
            startDate: new Date().toISOString()
        };
        localStorage.setItem('aiReadinessProgress', JSON.stringify(initialProgress));
    }
    return JSON.parse(localStorage.getItem('aiReadinessProgress'));
}

// Get progress data
function getProgress() {
    return JSON.parse(localStorage.getItem('aiReadinessProgress') || '{}');
}

// Save progress data
function saveProgress(progressData) {
    localStorage.setItem('aiReadinessProgress', JSON.stringify(progressData));
}

// Mark week as unlocked
function unlockWeek(weekNumber) {
    const progress = getProgress();
    if (!progress.unlockedWeeks.includes(`week${weekNumber}`)) {
        progress.unlockedWeeks.push(`week${weekNumber}`);
        saveProgress(progress);
    }
}

// Mark week as completed
function completeWeek(weekNumber) {
    const progress = getProgress();
    const weekKey = `week${weekNumber}`;

    // Check if already completed
    if (progress.completedWeeks && progress.completedWeeks.includes(weekKey)) {
        alert('You\'ve already completed this week!');
        return;
    }

    // Mark as completed
    if (!progress.completedWeeks) {
        progress.completedWeeks = [];
    }
    if (!progress.completedWeeks.includes(weekKey)) {
        progress.completedWeeks.push(weekKey);
    }
    progress.weekProgress[weekKey] = 100;
    saveProgress(progress);

    // Disable the button
    const button = document.querySelector('.complete-week-btn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-check-circle"></i> Week Completed!';
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    }

    // Show completion badge
    showCompletionBadge(weekNumber);

    // Check if all weeks complete - show certificate prompt
    setTimeout(function() {
        const overallProgress = calculateOverallProgress();
        if (overallProgress === 100) {
            setTimeout(function() {
                if (confirm('Congratulations! You\'ve completed all 5 weeks!\n\nWould you like to download your certificate now?')) {
                    generateCertificate();
                }
            }, 3500);
        }
    }, 1000);
}

// Update week progress (0-100)
function updateWeekProgress(weekNumber, percentage) {
    const progress = getProgress();
    progress.weekProgress[`week${weekNumber}`] = Math.min(100, Math.max(0, percentage));
    saveProgress(progress);
}

// Calculate overall progress
function calculateOverallProgress() {
    const progress = getProgress();
    const weekProgresses = Object.values(progress.weekProgress || {});
    if (weekProgresses.length === 0) return 0;
    const total = weekProgresses.reduce((sum, val) => sum + val, 0);
    return Math.round(total / weekProgresses.length);
}

// Update streak
function updateStreak() {
    const progress = getProgress();
    const now = new Date();
    const lastVisit = new Date(progress.lastVisit);
    const hoursDiff = (now - lastVisit) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
        // Same day or within 24 hours - maintain streak
        progress.streakCount = progress.streakCount || 1;
    } else if (hoursDiff < 48) {
        // Next day - increment streak
        progress.streakCount = (progress.streakCount || 0) + 1;
    } else {
        // Streak broken - reset
        progress.streakCount = 1;
    }
    
    progress.lastVisit = now.toISOString();
    saveProgress(progress);
}

// Export progress as JSON
function exportProgress() {
    const progress = getProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-readiness-sprint-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Reset all progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        localStorage.removeItem('aiReadinessProgress');
        location.reload();
    }
}

// ===== COMPLETION BADGE WITH EMOJI BURST =====
function showCompletionBadge(weekNumber) {
    // Create emoji burst
    createEmojiBurst();

    const badge = document.createElement('div');
    badge.className = 'completion-badge-popup';
    badge.innerHTML = `
        <div class="badge-content">
            <div class="badge-icon">🎉</div>
            <h3>Week ${weekNumber} Complete!</h3>
            <p>Great work! You're building the muscle.</p>
        </div>
    `;
    document.body.appendChild(badge);

    setTimeout(() => {
        badge.classList.add('show');
    }, 100);

    setTimeout(() => {
        badge.classList.remove('show');
        setTimeout(() => badge.remove(), 300);
    }, 3000);
}

// ===== EMOJI BURST CELEBRATION =====
function createEmojiBurst() {
    const emojis = ['🎉', '🎊', '✨', '🌟', '⭐', '💫', '🚀', '🔥', '💪', '👏', '🎯', '💯'];
    const burstCount = 30;

    for (let i = 0; i < burstCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-burst';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Random starting position along the bottom
        const startX = Math.random() * 100;
        emoji.style.left = startX + '%';

        // Random animation delay
        emoji.style.animationDelay = (Math.random() * 0.3) + 's';

        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 200;
        emoji.style.setProperty('--drift', drift + 'px');

        document.body.appendChild(emoji);

        // Remove after animation completes
        setTimeout(() => emoji.remove(), 2000);
    }
}

// ===== WIZARD STEPPER =====
function initWizardStepper() {
    var sections = document.querySelectorAll('.main-content > .content-section');
    var tabs = document.querySelectorAll('.step-tab');
    var geekCorner = document.querySelector('.geek-corner-standalone');
    var weekNav = document.querySelector('.week-navigation');
    if (!sections.length) return;

    var stepIds = [];
    sections.forEach(function(s) { stepIds.push(s.id); });

    var currentStep = 0;

    function goToStep(index) {
        if (index < 0 || index >= stepIds.length) return;
        currentStep = index;

        // Mark section as visited for progress tracking
        var sectionId = stepIds[index];
        var body = document.body;
        var weekNum = body.getAttribute('data-week');
        if (weekNum) {
            var weekKey = 'week' + weekNum;
            var visited = JSON.parse(localStorage.getItem('visitedSections_' + weekKey) || '[]');
            if (visited.indexOf(sectionId) === -1) {
                visited.push(sectionId);
                localStorage.setItem('visitedSections_' + weekKey, JSON.stringify(visited));
                var milestones = { welcome: 10, video: 30, experiment: 50, eko: 80 };
                var milestone = milestones[sectionId] || 0;
                var currentPct = 0;
                try { currentPct = getProgress().weekProgress[weekKey] || 0; } catch(e) {}
                if (milestone > currentPct) {
                    try { updateWeekProgress(parseInt(weekNum), milestone); } catch(e) {}
                }
            }
        }

        // Show/hide sections
        sections.forEach(function(s, i) {
            s.classList.remove('wizard-active');
            if (i === index) s.classList.add('wizard-active');
        });

        // Update tabs
        tabs.forEach(function(tab, i) {
            tab.classList.remove('active');
            if (i < index) tab.classList.add('visited');
            if (i === index) tab.classList.add('active');
        });

        // Show geek corner + bottom nav on last step
        var isLast = (index === stepIds.length - 1);
        if (geekCorner) geekCorner.classList.toggle('wizard-visible', isLast);
        if (weekNav) weekNav.classList.toggle('wizard-visible', isLast);

        // Scroll to top of content area
        var content = document.querySelector('.week-content');
        if (content) {
            var top = content.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }

    // Add wizard nav buttons to each section
    sections.forEach(function(section, i) {
        var nav = document.createElement('div');
        nav.className = 'wizard-nav';

        if (i > 0) {
            var back = document.createElement('button');
            back.className = 'wizard-btn wizard-btn-back';
            back.innerHTML = '&larr; Back';
            back.addEventListener('click', function() { goToStep(i - 1); });
            nav.appendChild(back);
        }

        if (i < sections.length - 1) {
            var next = document.createElement('button');
            next.className = 'wizard-btn wizard-btn-next';
            next.innerHTML = 'Continue &rarr;';
            next.addEventListener('click', function() { goToStep(i + 1); });
            nav.appendChild(next);
        }

        section.appendChild(nav);
    });

    // Wire up tab clicks
    tabs.forEach(function(tab, i) {
        tab.removeAttribute('onclick');
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep(i);
        });
    });

    // Expose globally so inline scripts can use it
    window.goToWizardStep = goToStep;

    // Start at step 0
    goToStep(0);
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWizardStepper);
} else {
    initWizardStepper();
}

// ===== CERTIFICATE GENERATION =====
function generateCertificate() {
    const progress = getProgress();
    const overallProgress = calculateOverallProgress();
    
    if (overallProgress < 100) {
        alert('Complete all 5 weeks to generate your certificate!');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // White certificate box
    ctx.fillStyle = 'white';
    ctx.fillRect(100, 100, 1000, 600);
    
    // Border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 10;
    ctx.strokeRect(120, 120, 960, 560);
    
    // Text
    ctx.fillStyle = '#2d2d2d';
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 600, 220);
    
    ctx.font = '32px -apple-system, sans-serif';
    ctx.fillText('AI Readiness Sprint', 600, 300);
    
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('This certifies that you have successfully completed', 600, 380);
    ctx.fillText('all 5 weeks of the AI Readiness Sprint', 600, 420);
    
    const completionDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    ctx.fillText(`Completed on ${completionDate}`, 600, 520);
    
    // Badge
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(600, 600, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('✓', 600, 615);
    
    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'AI-Readiness-Sprint-Certificate.png';
        link.click();
    });
}

// ===== PASSWORD PROTECTION =====
function checkPassword(weekNumber) {
    const passwordKey = `week${weekNumber}`;
    const storedPassword = localStorage.getItem('pwd_' + passwordKey);

    if (storedPassword === PASSWORDS[passwordKey]) {
        unlockWeek(weekNumber);
        return true;
    }
    return false;
}

function showPasswordPrompt(weekNumber, weekTitle) {
    const overlay = document.createElement('div');
    overlay.className = 'password-overlay';
    overlay.id = 'password-overlay';
    
    overlay.innerHTML = `
        <div class="password-modal">
            <h2>Week ${weekNumber}: ${weekTitle}</h2>
            <p>Enter the password to unlock this week's content</p>
            <form id="password-form">
                <input 
                    type="password" 
                    id="password-input" 
                    class="password-input" 
                    placeholder="Enter password"
                    autocomplete="off"
                >
                <button type="submit" class="password-submit">Unlock Week ${weekNumber}</button>
                <div class="password-error" id="password-error">
                    Incorrect password. Please try again.
                </div>
            </form>
            <button class="password-back-btn" onclick="window.location.href='index.html'">&larr; Back to Home</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.getElementById('password-input').focus();
    
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('password-input').value;
        const passwordKey = `week${weekNumber}`;
        
        if (input === PASSWORDS[passwordKey]) {
            localStorage.setItem('pwd_' + passwordKey, input);
            unlockWeek(weekNumber);
            overlay.remove();
            revealContent();
        } else {
            document.getElementById('password-error').classList.add('show');
            document.getElementById('password-input').value = '';
            document.getElementById('password-input').focus();
        }
    });
}

function revealContent() {
    // Show the Eko disclaimer once on Week 1 only
    var weekNumber = document.body.getAttribute('data-week');
    if (weekNumber === '1' && !localStorage.getItem('ekoAgreed')) {
        showEkoDisclaimer();
        return;
    }
    const content = document.querySelector('.week-content');
    if (content) {
        content.style.display = 'block';
    }
}

// ===== EKO DISCLAIMER MODAL =====
function showEkoDisclaimer() {
    const overlay = document.createElement('div');
    overlay.className = 'eko-disclaimer-overlay';
    overlay.id = 'eko-disclaimer-overlay';

    overlay.innerHTML = `
        <div class="eko-disclaimer-modal">
            <div class="eko-disclaimer-header">
                <div class="eko-disclaimer-avatar">🤖</div>
                <div>
                    <h2>Meet Eko — your reflection partner</h2>
                    <p class="eko-disclaimer-tagline">A quick read before we begin</p>
                </div>
            </div>

            <div class="eko-disclaimer-body">
                <p class="eko-disclaimer-intro">Your reflection partner for making sense of what you just learned. I'm here for brief, focused conversations using the prompts you've been given — helping you connect new concepts to your actual work and lock in those capabilities.</p>

                <h3 class="eko-disclaimer-subhead">A few things to know:</h3>
                <ul class="eko-disclaimer-list">
                    <li>I work best when you use the reflection prompts provided in your course</li>
                    <li>I'm designed for short conversations (around 5–10 minutes) to process what's fresh</li>
                    <li>I don't store our conversations or your data — they're anonymous, so capture anything useful in your own notes</li>
                    <li>I'm not a career coach, therapist, or general AI assistant — just a practical tool for this specific learning moment</li>
                    <li>For deeper career guidance or personal support, connect with your manager, HR, or an appropriate professional</li>
                </ul>

                <p class="eko-disclaimer-closing">Ready to reflect? Start with one of your prompts and let's make this learning stick.</p>
            </div>

            <div class="eko-disclaimer-footer">
                <label class="eko-disclaimer-check">
                    <input type="checkbox" id="ekoAgreeCheckbox">
                    <span>I've read and understand what Eko is and isn't</span>
                </label>
                <button class="eko-disclaimer-btn" id="ekoAgreeBtn" disabled>
                    Let's begin <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Enable button only when checkbox is ticked
    const checkbox = document.getElementById('ekoAgreeCheckbox');
    const btn = document.getElementById('ekoAgreeBtn');
    checkbox.addEventListener('change', function() {
        btn.disabled = !this.checked;
    });

    btn.addEventListener('click', function() {
        if (checkbox.checked) {
            localStorage.setItem('ekoAgreed', 'true');
            overlay.classList.add('eko-disclaimer-hiding');
            setTimeout(() => {
                overlay.remove();
                const content = document.querySelector('.week-content');
                if (content) content.style.display = 'block';
            }, 300);
        }
    });
}

function hideContent() {
    const content = document.querySelector('.week-content');
    if (content) {
        content.style.display = 'none';
    }
}

// Initialize password check on page load for weekly pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    initializeProgress();
    updateStreak();

    // Only check password on actual week pages (data-week on <body>, not on card elements)
    const body = document.body;
    if (body.hasAttribute('data-week')) {
        const weekNumber = body.getAttribute('data-week');
        const weekTitle = body.getAttribute('data-week-title');

        if (!checkPassword(weekNumber)) {
            hideContent();
            showPasswordPrompt(weekNumber, weekTitle);
        } else {
            revealContent();
        }
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== SOCIAL SHARING FUNCTIONS =====

function shareWeekCompletion(weekNumber, platform) {
    const weekTitles = {
        1: "The Learner's Posture",
        2: "Experiment Like You Mean It",
        3: "Learning Out Loud",
        4: "Integration & Consolidation",
        5: "Your New Operating System"
    };
    
    const text = `Just completed Week ${weekNumber}: ${weekTitles[weekNumber]} of the AI Readiness Sprint! 🚀 #AILearning #ProfessionalDevelopment`;
    const url = window.location.origin;
    
    if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=600');
    }
}

function shareSprintCompletion(platform) {
    const text = `🎉 I just completed the entire AI Readiness Sprint! 5 weeks of learning agility, iteration, and workflow transformation. #AILearning #ProfessionalDevelopment #Upskilling`;
    const url = window.location.origin;
    
    if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=600');
    }
}

function shareToTwitter() {
    const progress = getProgress();
    const completedCount = progress.completedWeeks ? progress.completedWeeks.length : 0;
    const text = `Making progress on the AI Readiness Sprint! ${completedCount}/5 weeks completed. Building the muscle for AI-powered work. 🚀 #AILearning`;
    const url = window.location.origin;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function shareToLinkedIn() {
    const url = window.location.origin;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
}

function copyShareLink() {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    });
}

// ===== HOMEPAGE DASHBOARD UPDATE =====

function updateDashboard() {
    const progress = getProgress();
    
    // Update stats
    const overallProgress = calculateOverallProgress();
    const completedCount = progress.completedWeeks ? progress.completedWeeks.length : 0;
    const unlockedCount = progress.unlockedWeeks ? progress.unlockedWeeks.length : 0;
    const streak = progress.streakCount || 0;
    
    // Update DOM elements
    const totalProgressEl = document.getElementById('totalProgress');
    const unlockedWeeksEl = document.getElementById('unlockedWeeks');
    const streakEl = document.getElementById('streak');
    const progressPercentEl = document.getElementById('progressPercent');
    const overallProgressBar = document.getElementById('overallProgressBar');
    
    if (totalProgressEl) totalProgressEl.textContent = `${overallProgress}%`;
    if (unlockedWeeksEl) unlockedWeeksEl.textContent = `${unlockedCount}/5`;
    if (streakEl) streakEl.textContent = `${streak}`;
    if (progressPercentEl) progressPercentEl.textContent = `${overallProgress}%`;
    if (overallProgressBar) overallProgressBar.style.width = `${overallProgress}%`;
    
    // Update week card progress bars
    for (let i = 1; i <= 5; i++) {
        const weekProgress = progress.weekProgress[`week${i}`] || 0;
        const progressBar = document.querySelector(`[data-week-progress="${i}"]`);
        const progressText = document.querySelector(`[data-week-text="${i}"]`);
        
        if (progressBar) progressBar.style.width = `${weekProgress}%`;
        if (progressText) progressText.textContent = `${weekProgress}%`;
    }
    
    // Show certificate button if 100% complete
    const certificateBtn = document.getElementById('certificateBtn');
    if (certificateBtn && overallProgress === 100) {
        certificateBtn.style.display = 'inline-flex';
    }
    
    // Show social share section if any week completed
    const socialShareSection = document.getElementById('socialShareSection');
    if (socialShareSection && completedCount > 0) {
        socialShareSection.style.display = 'block';
    }
}


// Initialize dashboard on homepage load
if (window.location.pathname.indexOf('index') !== -1 || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateDashboard, 100);
    });
}


// Check if week is already completed on page load
function checkWeekCompletion() {
    const body = document.body;
    if (body.hasAttribute('data-week')) {
        const weekNumber = body.getAttribute('data-week');
        const progress = getProgress();
        const weekKey = `week${weekNumber}`;

        if (progress.completedWeeks && progress.completedWeeks.includes(weekKey)) {
            // Disable the complete button
            const button = document.querySelector('.complete-week-btn');
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-check-circle"></i> Week Completed!';
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            }
        }
    }
}

// Run check on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkWeekCompletion, 100);
});

// Listen for progress updates from other windows
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'updateProgress') {
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
});


// Auto-refresh dashboard when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof updateDashboard === 'function') {
        updateDashboard();
    }
});

// Refresh dashboard when window gains focus
window.addEventListener('focus', function() {
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
});

// ===== TRACK SELECTOR (IC vs Leader) =====
function initTrackSelector() {
    var selector = document.querySelector('.track-selector');
    if (!selector) return;

    var tracksContainer = document.querySelector('.tracks-container');
    if (!tracksContainer) return;

    var trackCards = tracksContainer.querySelectorAll('.track-card');
    if (trackCards.length < 2) return;

    // Load saved preference
    var savedTrack = localStorage.getItem('sprintTrack');
    if (savedTrack) {
        applyTrackSelection(savedTrack, trackCards, selector);
    }

    // Handle clicks
    var buttons = selector.querySelectorAll('.track-selector-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function() {
            var track = this.getAttribute('data-track');
            localStorage.setItem('sprintTrack', track);
            applyTrackSelection(track, trackCards, selector);
        });
    }
}

function applyTrackSelection(track, trackCards, selector) {
    // Update button states
    var buttons = selector.querySelectorAll('.track-selector-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
        if (buttons[i].getAttribute('data-track') === track) {
            buttons[i].classList.add('active');
        }
    }

    // Show/hide tracks
    if (track === 'ic') {
        trackCards[0].style.display = 'block';
        trackCards[1].style.display = 'none';
    } else {
        trackCards[0].style.display = 'none';
        trackCards[1].style.display = 'block';
    }
}

// ===== COPY TO CLIPBOARD FOR EKO PROMPTS =====
function initCopyButtons() {
    var starterTexts = document.querySelectorAll('.starter-text');
    for (var i = 0; i < starterTexts.length; i++) {
        var text = starterTexts[i];
        var btn = document.createElement('button');
        btn.className = 'copy-prompt-btn';
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
        btn.setAttribute('data-text', text.textContent.trim());
        btn.addEventListener('click', function() {
            var self = this;
            var promptText = self.getAttribute('data-text');
            navigator.clipboard.writeText(promptText).then(function() {
                self.innerHTML = '<i class="fas fa-check"></i> Copied!';
                self.classList.add('copied');
                setTimeout(function() {
                    self.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                    self.classList.remove('copied');
                }, 2000);
            }).catch(function() {
                // Fallback for older browsers
                var textarea = document.createElement('textarea');
                textarea.value = promptText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                self.innerHTML = '<i class="fas fa-check"></i> Copied!';
                self.classList.add('copied');
                setTimeout(function() {
                    self.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                    self.classList.remove('copied');
                }, 2000);
            });
        });
        text.parentNode.insertBefore(btn, text.nextSibling);
    }
}

// Initialize UX enhancements on week pages
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.hasAttribute('data-week')) {
        initTrackSelector();
        initCopyButtons();
        initWeekPageFeatures();
    }
});

// ===== IN-PAGE PROGRESS BAR + "I'VE DONE THIS" + BACK TO TOP =====

function initWeekPageFeatures() {
    var body = document.body;
    if (!body.hasAttribute('data-week')) return;

    var weekNumber = parseInt(body.getAttribute('data-week'));
    var weekKey = 'week' + weekNumber;

    // 1. Inject reading progress bar inside step-nav
    var stepNav = document.getElementById('stepNav');
    if (stepNav) {
        var bar = document.createElement('div');
        bar.className = 'week-read-progress-bar';
        bar.id = 'weekReadProgress';
        stepNav.appendChild(bar);
    }

    // 2. Inject "I've done this" CTA after .tracks-container in #experiment
    var experimentSection = document.getElementById('experiment');
    if (experimentSection) {
        var tracksContainer = experimentSection.querySelector('.tracks-container');
        if (tracksContainer) {
            var doneCta = document.createElement('div');
            doneCta.className = 'done-experiment-cta';
            doneCta.id = 'doneExperimentCta';

            var experimentDone = localStorage.getItem('experimentDone_' + weekKey);
            if (experimentDone) {
                doneCta.innerHTML = '<div class="done-experiment-confirmed">' +
                    '<span class="done-icon">&#x2705;</span>' +
                    '<div><strong>Experiment completed!</strong>' +
                    '<p>You\'ve marked this experiment as done. Head to the Reflect section to debrief with Eko.</p></div>' +
                    '</div>';
            } else {
                doneCta.innerHTML = '<p class="done-experiment-prompt">Tried the experiment?</p>' +
                    '<button class="done-experiment-btn" id="doneExperimentBtn">' +
                    '<i class="fas fa-check-circle"></i> I\'ve done this</button>' +
                    '<p class="done-experiment-hint">Mark your experiment complete to track your progress</p>';
            }

            tracksContainer.parentNode.insertBefore(doneCta, tracksContainer.nextSibling);

            // Wire up button click
            doneCta.addEventListener('click', function(e) {
                if (e.target.closest('#doneExperimentBtn')) {
                    markExperimentDone(weekNumber);
                }
            });
        }
    }

    // 3. Inject "Mark Week Complete" button after Eko section
    var ekoSection = document.getElementById('eko');
    if (ekoSection) {
        var completeBtn = document.createElement('div');
        completeBtn.className = 'complete-week-container';
        completeBtn.id = 'completeWeekContainer';

        var progress = getProgress();
        var weekProgress = progress.weekProgress[weekKey] || 0;
        var isCompleted = progress.completedWeeks && progress.completedWeeks.includes(weekKey);

        if (isCompleted) {
            completeBtn.innerHTML = '<button class="complete-week-btn completed" disabled>' +
                '<i class="fas fa-check-circle"></i> Week Completed!</button>';
        } else {
            completeBtn.innerHTML = '<button class="complete-week-btn" id="completeWeekBtn">' +
                '<i class="fas fa-trophy"></i> Mark Week Complete</button>' +
                '<p class="complete-hint">Click when you\'ve finished all steps</p>';
        }

        ekoSection.parentNode.insertBefore(completeBtn, ekoSection.nextSibling);

        // Wire up button click
        var btn = document.getElementById('completeWeekBtn');
        if (btn) {
            btn.addEventListener('click', function() {
                completeWeek(weekNumber);
            });
        }
    }

    // 4. Inject back-to-top floating button
    var backToTop = document.createElement('button');
    backToTop.className = 'back-to-top-btn';
    backToTop.id = 'backToTopBtn';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(backToTop);

    // 5. Load visited sections and update tab states on load
    var sections = ['welcome', 'video', 'experiment', 'eko'];
    var visitedSections = JSON.parse(localStorage.getItem('visitedSections_' + weekKey) || '[]');

    // Welcome is visited the moment the user opens the page
    if (!visitedSections.includes('welcome')) {
        visitedSections.push('welcome');
        localStorage.setItem('visitedSections_' + weekKey, JSON.stringify(visitedSections));
        var current = getProgress().weekProgress[weekKey] || 0;
        if (current < 10) updateWeekProgress(weekNumber, 10);
    }

    // If experiment was already marked done, ensure its tab shows completed
    if (localStorage.getItem('experimentDone_' + weekKey) && !visitedSections.includes('experiment')) {
        visitedSections.push('experiment');
        localStorage.setItem('visitedSections_' + weekKey, JSON.stringify(visitedSections));
    }

    updateStepTabStates(visitedSections);

    // 6. Run a one-time scan on load to catch sections already in viewport
    // Only runs when content is visible (returning visitor whose password is already stored).
    // First-time visitors will have content hidden; sections get detected as they scroll.
    var weekContentEl = document.querySelector('.week-content');
    if (weekContentEl && weekContentEl.style.display !== 'none') {
        updateReadingProgress(sections, visitedSections, weekKey, weekNumber);
    }

    // 7. Check if auto-complete conditions already met (returning visitor who did everything)
    checkAutoComplete(weekKey, weekNumber, visitedSections);

    // 8. Scroll listener
    window.addEventListener('scroll', function() {
        updateReadingProgress(sections, visitedSections, weekKey, weekNumber);
        updateBackToTopVisibility();
    });
}

// Auto-complete a week when both eko is visited AND experiment is done
function checkAutoComplete(weekKey, weekNumber, visitedSections) {
    var progress = getProgress();
    // Already complete — nothing to do
    if (progress.completedWeeks && progress.completedWeeks.includes(weekKey)) return;

    var ekoVisited = visitedSections.indexOf('eko') !== -1;
    var experimentDone = !!localStorage.getItem('experimentDone_' + weekKey);

    if (ekoVisited && experimentDone) {
        completeWeek(weekNumber);
    }
}

function updateReadingProgress(sections, visitedSections, weekKey, weekNumber) {
    // Update thin progress bar
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    var progressBar = document.getElementById('weekReadProgress');
    if (progressBar) progressBar.style.width = scrollPct + '%';

    // Milestones: mark section visited when it enters viewport
    var milestones = { welcome: 10, video: 30, experiment: 50, eko: 80 };
    var changed = false;
    for (var i = 0; i < sections.length; i++) {
        var id = sections[i];
        if (visitedSections.indexOf(id) === -1) {
            var el = document.getElementById(id);
            if (el) {
                var rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) {
                    visitedSections.push(id);
                    changed = true;
                    var currentPct = getProgress().weekProgress[weekKey] || 0;
                    var milestone = milestones[id] || 0;
                    if (milestone > currentPct) updateWeekProgress(weekNumber, milestone);
                }
            }
        }
    }
    if (changed) {
        localStorage.setItem('visitedSections_' + weekKey, JSON.stringify(visitedSections));
        updateStepTabStates(visitedSections);
        // Check if auto-complete conditions are now met
        checkAutoComplete(weekKey, weekNumber, visitedSections);
    }
}

function updateStepTabStates(visitedSections) {
    var tabs = document.querySelectorAll('.step-tab');
    for (var i = 0; i < tabs.length; i++) {
        var target = tabs[i].getAttribute('data-target');
        if (visitedSections.indexOf(target) !== -1 && !tabs[i].classList.contains('completed')) {
            tabs[i].classList.add('completed');
            var stepNum = tabs[i].querySelector('.step-num');
            if (stepNum) stepNum.innerHTML = '<i class="fas fa-check"></i>';
        }
    }
}

function updateBackToTopVisibility() {
    var btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    if (window.pageYOffset > 400) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
}

function markExperimentDone(weekNumber) {
    var weekKey = 'week' + weekNumber;
    localStorage.setItem('experimentDone_' + weekKey, 'true');

    // Update progress to 75% if not already higher
    var currentPct = getProgress().weekProgress[weekKey] || 0;
    if (currentPct < 75) updateWeekProgress(weekNumber, 75);

    // Update visited sections so the tab gets a checkmark
    var visitedSections = JSON.parse(localStorage.getItem('visitedSections_' + weekKey) || '[]');
    if (visitedSections.indexOf('experiment') === -1) {
        visitedSections.push('experiment');
        localStorage.setItem('visitedSections_' + weekKey, JSON.stringify(visitedSections));
    }
    updateStepTabStates(visitedSections);

    // Swap button to confirmed state
    var cta = document.getElementById('doneExperimentCta');
    if (cta) {
        cta.innerHTML = '<div class="done-experiment-confirmed">' +
            '<span class="done-icon">&#x2705;</span>' +
            '<div><strong>Experiment completed!</strong>' +
            '<p>You\'ve marked this experiment as done. Head to the Reflect section to debrief with Eko.</p></div>' +
            '</div>';
    }

    // If the user has already visited the eko section, auto-complete the week
    checkAutoComplete(weekKey, weekNumber, visitedSections);
}

