// --- Munch Melody Synthesizer & Visualizer Engine v1.4 ---

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

    // Full 3-Octave Master Note Spectrum (C3 to C6)
    const masterNotes = [
        { note: 'C3', freq: 130.81, type: 'white' },
        { note: 'C#3', freq: 138.59, type: 'black' },
        { note: 'D3', freq: 146.83, type: 'white' },
        { note: 'D#3', freq: 155.56, type: 'black' },
        { note: 'E3', freq: 164.81, type: 'white' },
        { note: 'F3', freq: 174.61, type: 'white' },
        { note: 'F#3', freq: 185.00, type: 'black' },
        { note: 'G3', freq: 196.00, type: 'white' },
        { note: 'G#3', freq: 207.65, type: 'black' },
        { note: 'A3', freq: 220.00, type: 'white' },
        { note: 'A#3', freq: 233.08, type: 'black' },
        { note: 'B3', freq: 246.94, type: 'white' },
        { note: 'C4', freq: 261.63, type: 'white' },
        { note: 'C#4', freq: 277.18, type: 'black' },
        { note: 'D4', freq: 293.66, type: 'white' },
        { note: 'D#4', freq: 311.13, type: 'black' },
        { note: 'E4', freq: 329.63, type: 'white' },
        { note: 'F4', freq: 349.23, type: 'white' },
        { note: 'F#4', freq: 369.99, type: 'black' },
        { note: 'G4', freq: 392.00, type: 'white' },
        { note: 'G#4', freq: 415.30, type: 'black' },
        { note: 'A4', freq: 440.00, type: 'white' },
        { note: 'A#4', freq: 466.16, type: 'black' },
        { note: 'B4', freq: 493.88, type: 'white' },
        { note: 'C5', freq: 523.25, type: 'white' },
        { note: 'C#5', freq: 554.37, type: 'black' },
        { note: 'D5', freq: 587.33, type: 'white' },
        { note: 'D#5', freq: 622.25, type: 'black' },
        { note: 'E5', freq: 659.25, type: 'white' },
        { note: 'F5', freq: 698.46, type: 'white' },
        { note: 'F#5', freq: 739.99, type: 'black' },
        { note: 'G5', freq: 783.99, type: 'white' }
    ];

    // Preset Songs Database
    const songs = {
        fairouz: {
            title: "Fairouz - قديش كان في ناس (Qadish Kan Fi Nas)",
            arrangements: {
                easy: [
                    { time: 1.0, note: 'C4', duration: 0.8 },
                    { time: 3.0, note: 'E4', duration: 1.2 },
                    { time: 5.5, note: 'G4', duration: 0.8 },
                    { time: 8.5, note: 'C5', duration: 1.5 },
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
                    { time: 5.5, note: 'E4', duration: 0.8 },
                    { time: 6.5, note: 'D4', duration: 1.5 },
                    { time: 8.5, note: 'C4', duration: 1.0 },
                    { time: 10.0, note: 'C5', duration: 1.2 }
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
                    { time: 3.2, note: 'C3', duration: 1.5 },
                    { time: 3.5, note: 'B4', duration: 0.5 },
                    { time: 4.0, note: 'D5', duration: 0.5 },
                    { time: 5.0, note: 'E3', duration: 1.5 },
                    { time: 5.2, note: 'A4', duration: 1.2 },
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
                    { time: 10.0, note: 'A3', duration: 1.5 },
                ],
                hard: [
                    { time: 0.5, note: 'D3', duration: 2.0 },
                    { time: 1.0, note: 'D4', duration: 1.0 },
                    { time: 1.5, note: 'F#4', duration: 0.5 },
                    { time: 2.5, note: 'B3', duration: 1.0 },
                    { time: 4.0, note: 'A3', duration: 1.0 },
                    { time: 5.5, note: 'G3', duration: 1.0 },
                    { time: 7.0, note: 'F3', duration: 1.0 },
                    { time: 10.0, note: 'A3', duration: 1.5 }
                ]
            }
        }
    };

    let activeSongKey = 'fairouz';
    let activeSong = songs[activeSongKey];
    let keyElements = {};

    function getActiveNotes() {
        return activeSong.arrangements[currentDifficulty] || activeSong.arrangements['medium'];
    }

    // Perfectly Aligned Keyboard Builder
    function initKeyboardForSong() {
        keyboardEl.innerHTML = '';
        keyElements = {};

        let whiteKeyCount = 0;
        let lastWhiteLeft = 0;

        masterNotes.forEach((k) => {
            const keyDiv = document.createElement('div');
            keyDiv.className = `piano-key ${k.type === 'white' ? 'white-key' : 'black-key'}`;
            keyDiv.dataset.note = k.note;
            keyDiv.dataset.freq = k.freq;

            if (k.type === 'white') {
                lastWhiteLeft = whiteKeyCount * 40;
                keyDiv.style.left = `${lastWhiteLeft}px`;
                whiteKeyCount++;
            } else {
                // Position black key perfectly centered over the gap between white keys
                keyDiv.style.left = `${lastWhiteLeft + 26}px`;
            }

            keyDiv.addEventListener('mousedown', () => playNote(k.freq, keyDiv));
            keyboardEl.appendChild(keyDiv);
            keyElements[k.note] = keyDiv;
        });

        keyboardEl.style.width = `${whiteKeyCount * 40}px`;
    }

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

    // Falling Notes Waterfall
    function drawVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isPlaying) {
            songProgress += 0.03 * playbackSpeed;
        }

        const currentNotes = getActiveNotes();
        const keyboardRect = keyboardEl.getBoundingClientRect();

        currentNotes.forEach(item => {
            const timeDiff = item.time - songProgress;
            const keyboardY = canvas.height - 25;
            const speed = 70;
            const noteY = keyboardY - (item.time - songProgress) * speed;

            const keyEl = keyElements[item.note];
            if (keyEl) {
                const keyLeft = keyEl.offsetLeft;
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

    // YouTube Link Note Conversion Simulation
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
                        { time: 5.5, note: 'G4', duration: 1.2 }
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
                        { time: 2.5, note: 'F#4', duration: 0.5 },
                        { time: 3.0, note: 'G4', duration: 1.0 },
                        { time: 4.5, note: 'A4', duration: 0.8 },
                        { time: 6.0, note: 'C5', duration: 1.2 },
                        { time: 7.0, note: 'D5', duration: 0.5 },
                        { time: 8.0, note: 'B4', duration: 0.8 },
                        { time: 9.5, note: 'G5', duration: 1.5 }
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
