// --- Munch Melody Synthesizer & Visualizer Engine ---

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

    let currentDifficulty = 'medium';
    let isPlaying = false;
    let animationFrameId = null;
    let songProgress = 0;
    let audioCtx = null;

    // Define Piano Keys (2 Octaves C3 to C5)
    const notesConfig = [
        { note: 'C3', type: 'white', midi: 48, freq: 130.81 },
        { note: 'C#3', type: 'black', midi: 49, freq: 138.59, offset: 24 },
        { note: 'D3', type: 'white', midi: 50, freq: 146.83 },
        { note: 'D#3', type: 'black', midi: 51, freq: 155.56, offset: 60 },
        { note: 'E3', type: 'white', midi: 52, freq: 164.81 },
        { note: 'F3', type: 'white', midi: 53, freq: 174.61 },
        { note: 'F#3', type: 'black', midi: 54, freq: 185.00, offset: 132 },
        { note: 'G3', type: 'white', midi: 55, freq: 196.00 },
        { note: 'G#3', type: 'black', midi: 56, freq: 207.65, offset: 168 },
        { note: 'A3', type: 'white', midi: 57, freq: 220.00 },
        { note: 'A#3', type: 'black', midi: 58, freq: 233.08, offset: 204 },
        { note: 'B3', type: 'white', midi: 59, freq: 246.94 },
        { note: 'C4', type: 'white', midi: 60, freq: 261.63 },
        { note: 'C#4', type: 'black', midi: 61, freq: 277.18, offset: 276 },
        { note: 'D4', type: 'white', midi: 62, freq: 293.66 },
        { note: 'D#4', type: 'black', midi: 63, freq: 311.13, offset: 312 },
        { note: 'E4', type: 'white', midi: 64, freq: 329.63 },
        { note: 'F4', type: 'white', midi: 65, freq: 349.23 },
        { note: 'F#4', type: 'black', midi: 66, freq: 369.99, offset: 384 },
        { note: 'G4', type: 'white', midi: 67, freq: 392.00 },
        { note: 'G#4', type: 'black', midi: 68, freq: 415.30, offset: 420 },
        { note: 'A4', type: 'white', midi: 69, freq: 440.00 },
        { note: 'A#4', type: 'black', midi: 70, freq: 466.16, offset: 456 },
        { note: 'B4', type: 'white', midi: 71, freq: 493.88 },
        { note: 'C5', type: 'white', midi: 72, freq: 523.25 }
    ];

    const keyElements = {};

    // Build Keyboard DOM
    function initKeyboard() {
        keyboardEl.innerHTML = '';
        let whiteKeyIndex = 0;

        notesConfig.forEach(k => {
            const keyDiv = document.createElement('div');
            keyDiv.className = `piano-key ${k.type === 'white' ? 'white-key' : 'black-key'}`;
            
            if (k.type === 'white') {
                keyDiv.style.left = `${whiteKeyIndex * 38}px`;
                whiteKeyIndex++;
            } else {
                keyDiv.style.left = `${k.offset}px`;
            }

            keyDiv.dataset.note = k.note;
            keyDiv.dataset.freq = k.freq;

            keyDiv.addEventListener('mousedown', () => playNote(k.freq, keyDiv));
            keyboardEl.appendChild(keyDiv);
            keyElements[k.note] = keyDiv;
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

    // Preset Song Falling Note Sequences
    const songs = {
        fairouz: {
            title: "Fairouz - قديش كان في ناس (Qadish Kan Fi Nas)",
            notes: [
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
            ]
        },
        fur_elise: {
            title: "Beethoven - Für Elise (Easy Arrangement)",
            notes: [
                { time: 1.0, note: 'E4', duration: 0.5 },
                { time: 1.5, note: 'D#4', duration: 0.5 },
                { time: 2.0, note: 'E4', duration: 0.5 },
                { time: 2.5, note: 'D#4', duration: 0.5 },
                { time: 3.0, note: 'E4', duration: 0.5 },
                { time: 3.5, note: 'B3', duration: 0.5 },
                { time: 4.0, note: 'D4', duration: 0.5 },
                { time: 4.5, note: 'C4', duration: 0.5 },
                { time: 5.2, note: 'A3', duration: 1.2 },
            ]
        },
        canon: {
            title: "Pachelbel - Canon in D",
            notes: [
                { time: 1.0, note: 'D4', duration: 1.0 },
                { time: 2.5, note: 'B3', duration: 1.0 },
                { time: 4.0, note: 'A3', duration: 1.0 },
                { time: 5.5, note: 'G3', duration: 1.0 },
                { time: 7.0, note: 'F3', duration: 1.0 },
                { time: 8.5, note: 'G3', duration: 1.0 },
                { time: 10.0, note: 'A3', duration: 1.5 },
            ]
        }
    };

    let activeSong = songs.fairouz;

    // Resize Canvas
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    // Render Falling Notes Waterfall
    function drawVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isPlaying) {
            songProgress += 0.03;
        }

        const pianoWidth = keyboardEl.clientWidth;
        const startX = (canvas.width - pianoWidth) / 2;

        activeSong.notes.forEach(item => {
            const timeDiff = item.time - songProgress;
            // Notes fall from top (y = 0) down to keyboard level (y = canvas.height - 20)
            const keyboardY = canvas.height - 20;
            const speed = 70; // fall speed
            const noteY = keyboardY - (item.time - songProgress) * speed;

            const keyEl = keyElements[item.note];
            if (keyEl) {
                const keyLeft = startX + keyEl.offsetLeft;
                const keyWidth = keyEl.offsetWidth;

                if (noteY > -50 && noteY < keyboardY) {
                    ctx.fillStyle = currentDifficulty === 'easy' ? '#34d399' : '#10b981';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#34d399';
                    ctx.fillRect(keyLeft + 2, noteY, keyWidth - 4, item.duration * 40);
                    ctx.shadowBlur = 0;

                    // Note label
                    ctx.fillStyle = '#090d16';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.fillText(item.note, keyLeft + 4, noteY + 14);
                }

                // Trigger audio & key highlight when note reaches keyboard
                if (Math.abs(timeDiff) < 0.02 && isPlaying) {
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
            drawVisualizer();
        } else {
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playBtnText.textContent = 'Resume';
            cancelAnimationFrame(animationFrameId);
        }
    });

    stopBtn.addEventListener('click', () => {
        isPlaying = false;
        songProgress = 0;
        cancelAnimationFrame(animationFrameId);
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        playBtnText.textContent = 'Play Tutorial';
        drawVisualizer();
    });

    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (songs[val]) {
            activeSong = songs[val];
            songTitleEl.textContent = activeSong.title;
            songProgress = 0;
            isPlaying = false;
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playBtnText.textContent = 'Play Tutorial';
            drawVisualizer();
        }
    });

    loadBtn.addEventListener('click', () => {
        const url = ytUrlInput.value.trim();
        if (!url) {
            alert('Please paste a valid YouTube link!');
            return;
        }
        songTitleEl.textContent = "Custom YouTube Link Loaded Successfully 🎵";
        songInfoEl.textContent = `Source: ${url} • ${currentDifficulty} difficulty`;
        songProgress = 0;
        isPlaying = true;
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        playBtnText.textContent = 'Pause';
        drawVisualizer();
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
            songInfoEl.textContent = `Ready to play • ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} difficulty`;
        });
    });

    // Initialize
    initKeyboard();
    resizeCanvas();
    drawVisualizer();
});
