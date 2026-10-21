// --- Munch Melody Synthesizer & Visualizer Engine v1.3 ---

document.addEventListener('DOMContentLoaded', () => {
    const keyboardEl = document.getElementById('pianoKeyboard');
    const canvas = document.getElementById('fallingCanvas');
    const ctx = canvas.getContext('2d');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playIcon = document.getElementById('playIcon');
    const playBtnText = document.getElementById('playBtnText');
    const presetSelect = document.getElementById('presetSelect');
    const songTitleEl = document.getElementById('currentSongTitle');
    const songInfoEl = document.getElementById('currentSongInfo');
    const loadBtn = document.getElementById('loadBtn');
    const ytUrlInput = document.getElementById('ytUrlInput');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const speedSelect = document.getElementById('speedSelect');
    const speedLabel = document.getElementById('speedLabel');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    let currentDifficulty = 'medium';
    let playbackSpeed = 1.0;
    let isPlaying = false;
    let animationFrameId = null;
    let songProgress = 0;
    let audioCtx = null;

    // Master note frequency lookup table (C3 to C6)
    const masterNotes = {
        'C3': { midi: 48, freq: 130.81, type: 'white' },
        'C#3': { midi: 49, freq: 138.59, type: 'black' },
        'D3': { midi: 50, freq: 146.83, type: 'white' },
        'D#3': { midi: 51, freq: 155.56, type: 'black' },
        'E3': { midi: 52, freq: 164.81, type: 'white' },
        'F3': { midi: 53, freq: 174.61, type: 'white' },
        'F#3': { midi: 54, freq: 185.00, type: 'black' },
        'G3': { midi: 55, freq: 196.00, type: 'white' },
        'G#3': { midi: 56, freq: 207.65, type: 'black' },
        'A3': { midi: 57, freq: 220.00, type: 'white' },
        'A#3': { midi: 58, freq: 233.08, type: 'black' },
        'B3': { midi: 59, freq: 246.94, type: 'white' },
        'C4': { midi: 60, freq: 261.63, type: 'white' },
        'C#4': { midi: 61, freq: 277.18, type: 'black' },
        'D4': { midi: 62, freq: 293.66, type: 'white' },
        'D#4': { midi: 63, freq: 311.13, type: 'black' },
        'E4': { midi: 64, freq: 329.63, type: 'white' },
        'F4': { midi: 65, freq: 349.23, type: 'white' },
        'F#4': { midi: 66, freq: 369.99, type: 'black' },
        'G4': { midi: 67, freq: 392.00, type: 'white' },
        'G#4': { midi: 68, freq: 415.30, type: 'black' },
        'A4': { midi: 69, freq: 440.00, type: 'white' },
        'A#4': { midi: 70, freq: 466.16, type: 'black' },
        'B4': { midi: 71, freq: 493.88, type: 'white' },
        'C5': { midi: 72, freq: 523.25, type: 'white' },
        'C#5': { midi: 73, freq: 554.37, type: 'black' },
        'D5': { midi: 74, freq: 587.33, type: 'white' },
        'D#5': { midi: 75, freq: 622.25, type: 'black' },
        'E5': { midi: 76, freq: 659.25, type: 'white' },
        'F5': { midi: 77, freq: 698.46, type: 'white' },
        'G5': { midi: 79, freq: 783.99, type: 'white' }
    };

    // Preset Songs Database with Multi-Difficulty Arrangements
    const songs = {
        fairouz: {
            title: "Fairouz - قديش كان في ناس (Qadish Kan Fi Nas)",
            arrangements: {
                easy: [
                    { time: 1.0, note: 'C4', duration: 0.8 },
                    { time: 3.0, note: 'E4', duration: 1.2 },
                    { time: 5.5, note: 'G4', duration: 0.8 },
                    { time: 8.5, note: 'C4', duration: 1.5 },
                ],
                medium: [
                    { time: 1.0, note: 'C4', duration: 0.8 },
                    { time: 2.0, note: 'E4', duration: 0.8 },
                    { time: 3.0, note: 'G4', duration: 1.2 },
                    { time: 4.5, note: 'F4', duration: 0.8 },
                    { time: 5.5, note: 'E4', duration: 0.8 },
                    { time: 6.5, note: 'D4', duration: 1.5 },
                    { time: 8.5, note: 'C4', duration: 1.0 },
                    { time: 10.0, note: 'G4', duration: 0.8 },
                    { time: 11.0, note: 'A4', duration: 0.8 },
                    { time: 12.0, note: 'G4', duration: 1.5 },
                ],
                hard: [
                    { time: 0.5, note: 'C3', duration: 2.0 },
                    { time: 1.0, note: 'C4', duration: 0.8 },
                    { time: 1.5, note: 'D4', duration: 0.4 },
                    { time: 2.0, note: 'E4', duration: 0.8 },
                    { time: 2.5, note: 'F4', duration: 0.4 },
                    { time: 3.0, note: 'G4', duration: 1.2 },
                    { time: 4.0, note: 'G3', duration: 1.5 },
                    { time: 4.5, note: 'F4', duration: 0.8 },
                    { time: 5.5, note: 'E4', duration: 0.8 },
                    { time: 6.5, note: 'D4', duration: 1.5 },
                    { time: 7.5, note: 'G3', duration: 1.0 },
                    { time: 8.5, note: 'C4', duration: 1.0 },
                    { time: 10.0, note: 'G4', duration: 0.8 },
                    { time: 10.5, note: 'B4', duration: 0.5 },
                    { time: 11.0, note: 'A4', duration: 0.8 },
                    { time: 12.0, note: 'G4', duration: 1.5 },
                    { time: 13.0, note: 'C5', duration: 1.5 }
                ]
            }
        },
        fur_elise: {
            title: "Beethoven - Für Elise",
            arrangements: {
                easy: [
                    { time: 1.0, note: 'E5', duration: 0.5 },
                    { time: 2.0, note: 'D#5', duration: 0.5 },
                    { time: 3.0, note: 'E5', duration: 0.5 },
                    { time: 4.0, note: 'B4', duration: 0.5 },
                    { time: 5.2, note: 'A4', duration: 1.2 },
                ],
                medium: [
                    { time: 1.0, note: 'E5', duration: 0.5 },
                    { time: 1.5, note: 'D#5', duration: 0.5 },
                    { time: 2.0, note: 'E5', duration: 0.5 },
                    { time: 2.5, note: 'D#5', duration: 0.5 },
                    { time: 3.0, note: 'E5', duration: 0.5 },
                    { time: 3.5, note: 'B4', duration: 0.5 },
                    { time: 4.0, note: 'D5', duration: 0.5 },
                    { time: 4.5, note: 'C5', duration: 0.5 },
                    { time: 5.2, note: 'A4', duration: 1.2 },
                ],
                hard: [
                    { time: 0.8, note: 'A3', duration: 1.5 },
                    { time: 1.0, note: 'E5', duration: 0.5 },
                    { time: 1.5, note: 'D#5', duration: 0.5 },
                    { time: 2.0, note: 'E5', duration: 0.5 },
                    { time: 2.5, note: 'D#5', duration: 0.5 },
                    { time: 3.0, note: 'E5', duration: 0.5 },
                    { time: 3.2, note: 'C3', duration: 1.5 },
                    { time: 3.5, note: 'B4', duration: 0.5 },
                    { time: 4.0, note: 'D5', duration: 0.5 },
                    { time: 4.5, note: 'C5', duration: 0.5 },
                    { time: 5.0, note: 'E3', duration: 1.5 },
                    { time: 5.2, note: 'A4', duration: 1.2 },
                    { time: 6.0, note: 'C4', duration: 0.5 },
                    { time: 6.5, note: 'E4', duration: 0.5 },
                    { time: 7.0, note: 'A4', duration: 0.5 },
                    { time: 7.5, note: 'B4', duration: 1.0 }
                ]
            }
        },
        canon: {
            title: "Pachelbel - Canon in D",
            arrangements: {
                easy: [
                    { time: 1.0, note: 'D4', duration: 1.0 },
                    { time: 3.0, note: 'A3', duration: 1.0 },
                    { time: 5.0, note: 'G3', duration: 1.0 },
                    { time: 7.0, note: 'F3', duration: 1.5 },
                ],
                medium: [
                    { time: 1.0, note: 'D4', duration: 1.0 },
                    { time: 2.5, note: 'B3', duration: 1.0 },
                    { time: 4.0, note: 'A3', duration: 1.0 },
                    { time: 5.5, note: 'G3', duration: 1.0 },
                    { time: 7.0, note: 'F3', duration: 1.0 },
                    { time: 8.5, note: 'G3', duration: 1.0 },
                    { time: 10.0, note: 'A3', duration: 1.5 },
                ],
                hard: [
                    { time: 0.5, note: 'D3', duration: 2.0 },
                    { time: 1.0, note: 'D4', duration: 1.0 },
                    { time: 1.5, note: 'F#4', duration: 0.5 },
                    { time: 2.0, note: 'A4', duration: 0.5 },
                    { time: 2.5, note: 'B3', duration: 1.0 },
                    { time: 3.0, note: 'D4', duration: 0.5 },
                    { time: 3.5, note: 'F#4', duration: 0.5 },
                    { time: 4.0, note: 'A3', duration: 1.0 },
                    { time: 4.5, note: 'C#4', duration: 0.5 },
                    { time: 5.0, note: 'E4', duration: 0.5 },
                    { time: 5.5, note: 'G3', duration: 1.0 },
                    { time: 6.0, note: 'B3', duration: 0.5 },
                    { time: 6.5, note: 'D4', duration: 0.5 },
                    { time: 7.0, note: 'F3', duration: 1.0 },
                    { time: 8.5, note: 'G3', duration: 1.0 },
                    { time: 10.0, note: 'A3', duration: 1.5 }
                ]
            }
        }
    };

    let activeSongKey = 'fairouz';
    let activeSong = songs[activeSongKey];
    let keyElements = {};

    // Get current active notes based on difficulty
    function getActiveNotes() {
        return activeSong.arrangements[currentDifficulty] || activeSong.arrangements['medium'];
    }

    // Build Keyboard Dynamically based on the current difficulty arrangement
    function initKeyboardForSong() {
        keyboardEl.innerHTML = '';
        keyElements = {};

        const currentNotes = getActiveNotes();
        const songNoteNames = [...new Set(currentNotes.map(n => n.note))];
        
        const keysToRender = Object.keys(masterNotes);
        let whiteKeyIndex = 0;
        let lastBlackOffset = 0;

        keysToRender.forEach(noteName => {
            const k = masterNotes[noteName];
            const keyDiv = document.createElement('div');
            keyDiv.className = `piano-key ${k.type === 'white' ? 'white-key' : 'black-key'}`;
            
            if (k.type === 'white') {
                keyDiv.style.left = `${whiteKeyIndex * 38}px`;
                lastBlackOffset = whiteKeyIndex * 38;
                whiteKeyIndex++;
            } else {
                keyDiv.style.left = `${lastBlackOffset - 12}px`;
            }

            keyDiv.dataset.note = noteName;
            keyDiv.dataset.freq = k.freq;

            if (songNoteNames.includes(noteName)) {
                keyDiv.classList.add('song-active-key');
            }

            keyDiv.addEventListener('mousedown', () => playNote(k.freq, keyDiv));
            keyboardEl.appendChild(keyDiv);
            keyElements[noteName] = keyDiv;
        });

        keyboardEl.style.width = `${whiteKeyIndex * 38}px`;
    }

    // Web Audio Synthesizer
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playNote(freq, element) {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);

        if (element) {
            element.classList.add('active');
            setTimeout(() => element.classList.remove('active'), 250);
        }
    }

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    // Render Falling Notes Waterfall
    function drawVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isPlaying) {
            songProgress += 0.03 * playbackSpeed;
        }

        const pianoWidth = keyboardEl.clientWidth;
        const startX = (canvas.width - pianoWidth) / 2;
        const currentNotes = getActiveNotes();

        currentNotes.forEach(item => {
            const timeDiff = item.time - songProgress;
            const keyboardY = canvas.height - 20;
            const speed = 70;
            const noteY = keyboardY - (item.time - songProgress) * speed;

            const keyEl = keyElements[item.note];
            if (keyEl) {
                const keyLeft = startX + keyEl.offsetLeft;
                const keyWidth = keyEl.offsetWidth;

                if (noteY > -50 && noteY < keyboardY) {
                    ctx.fillStyle = currentDifficulty === 'easy' ? '#34d399' : (currentDifficulty === 'hard' ? '#f43f5e' : '#10b981');
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.fillRect(keyLeft + 2, noteY, keyWidth - 4, item.duration * 40);
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = '#090d16';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.fillText(item.note, keyLeft + 4, noteY + 14);
                }

                if (Math.abs(timeDiff) < (0.02 * playbackSpeed) && isPlaying) {
                    const freq = parseFloat(keyEl.dataset.freq);
                    playNote(freq, keyEl);
                }
            }
        });

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(drawVisualizer);
        }
    }

    // Event Listeners
    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            playBtnText.textContent = 'Pause';
            statusText.textContent = `Playing tutorial (${currentDifficulty} • ${playbackSpeed}x)`;
            statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            drawVisualizer();
        } else {
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playBtnText.textContent = 'Resume';
            statusText.textContent = "Paused";
            statusDot.className = "w-2 h-2 rounded-full bg-amber-500";
            cancelAnimationFrame(animationFrameId);
        }
    });

    stopBtn.addEventListener('click', () => {
        isPlaying = false;
        songProgress = 0;
        cancelAnimationFrame(animationFrameId);
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        playBtnText.textContent = 'Play Tutorial';
        statusText.textContent = "Synthesia Waterfall Engine Active";
        statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
        drawVisualizer();
    });

    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (songs[val]) {
            activeSongKey = val;
            activeSong = songs[val];
            songTitleEl.textContent = activeSong.title;
            songInfoEl.textContent = `Ready to play • ${currentDifficulty} difficulty • ${playbackSpeed}x Speed`;
            songProgress = 0;
            isPlaying = false;
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playBtnText.textContent = 'Play Tutorial';
            initKeyboardForSong();
            resizeCanvas();
            drawVisualizer();
        }
    });

    // YouTube Link Conversion Simulation
    loadBtn.addEventListener('click', () => {
        const url = ytUrlInput.value.trim();
        if (!url) {
            alert('Please paste a valid YouTube link!');
            return;
        }

        statusText.textContent = "Extracting audio & transcribing notes with AI...";
        statusDot.className = "w-2 h-2 rounded-full bg-yellow-400 animate-ping";

        setTimeout(() => {
            songs.custom = {
                title: `YouTube Custom Import (${url.slice(0, 30)}...)`,
                arrangements: {
                    easy: [
                        { time: 1.0, note: 'C4', duration: 0.8 },
                        { time: 3.0, note: 'E4', duration: 1.0 },
                        { time: 6.0, note: 'G4', duration: 1.2 }
                    ],
                    medium: [
                        { time: 1.0, note: 'C4', duration: 0.8 },
                        { time: 2.0, note: 'D4', duration: 0.8 },
                        { time: 3.0, note: 'E4', duration: 1.0 },
                        { time: 4.5, note: 'G4', duration: 0.8 },
                        { time: 6.0, note: 'C5', duration: 1.2 },
                        { time: 8.0, note: 'B4', duration: 0.8 },
                        { time: 9.5, note: 'G4', duration: 1.5 }
                    ],
                    hard: [
                        { time: 0.5, note: 'C3', duration: 2.0 },
                        { time: 1.0, note: 'C4', duration: 0.8 },
                        { time: 1.5, note: 'D4', duration: 0.5 },
                        { time: 2.0, note: 'E4', duration: 0.8 },
                        { time: 2.5, note: 'F4', duration: 0.5 },
                        { time: 3.0, note: 'G4', duration: 1.0 },
                        { time: 4.5, note: 'A4', duration: 0.8 },
                        { time: 6.0, note: 'C5', duration: 1.2 },
                        { time: 7.0, note: 'D5', duration: 0.5 },
                        { time: 8.0, note: 'B4', duration: 0.8 },
                        { time: 9.5, note: 'G4', duration: 1.5 }
                    ]
                }
            };

            activeSongKey = 'custom';
            activeSong = songs.custom;
            songTitleEl.textContent = activeSong.title;
            songInfoEl.textContent = `Custom YouTube track loaded • ${currentDifficulty} difficulty • ${playbackSpeed}x Speed`;
            statusText.textContent = "Transcription complete! Generating visual keys...";
            statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";

            initKeyboardForSong();
            songProgress = 0;
            isPlaying = true;
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            playBtnText.textContent = 'Pause';
            drawVisualizer();
        }, 1200);
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-slate-950', 'font-bold', 'shadow');
                b.classList.add('text-slate-400');
            });
            btn.classList.add('bg-emerald-500', 'text-slate-950', 'font-bold', 'shadow');
            btn.classList.remove('text-slate-400');
            currentDifficulty = btn.dataset.level;
            
            songInfoEl.textContent = `Ready to play • ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} difficulty • ${playbackSpeed}x Speed`;
            
            // Re-render keyboard and notes for the selected difficulty level
            initKeyboardForSong();
            songProgress = 0;
            isPlaying = false;
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playBtnText.textContent = 'Play Tutorial';
            drawVisualizer();
        });
    });

    speedSelect.addEventListener('change', (e) => {
        playbackSpeed = parseFloat(e.target.value);
        speedLabel.textContent = `${playbackSpeed}x`;
        songInfoEl.textContent = `Ready to play • ${currentDifficulty} difficulty • ${playbackSpeed}x Speed`;
    });

    // Initialize
    initKeyboardForSong();
    resizeCanvas();
    drawVisualizer();
});
