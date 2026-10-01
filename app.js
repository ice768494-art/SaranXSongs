const songs = [

    {
        title: "Song One",
        artist: "Artist One",
        audio: "music/song1.mp3",
        lyrics: "music/song1.lrc",
        cover: "music/cover1.jpg"
    },

    {
        title: "Song Two",
        artist: "Artist Two",
        audio: "music/song2.mp3",
        lyrics: "music/song2.lrc",
        cover: "music/cover2.jpg"
    }

];


const audio =
    document.getElementById("audio");

const title =
    document.getElementById("title");

const artist =
    document.getElementById("artist");

const cover =
    document.getElementById("cover");

const lyricsBox =
    document.getElementById("lyrics");

const songList =
    document.getElementById("songList");

const play =
    document.getElementById("play");

const previous =
    document.getElementById("previous");

const next =
    document.getElementById("next");

const progress =
    document.getElementById("progress");

const volume =
    document.getElementById("volume");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const searchToggle =
    document.getElementById("searchToggle");

const searchBox =
    document.getElementById("searchBox");

const searchInput =
    document.getElementById("searchInput");


let currentSong = -1;

let lyricData = [];

let currentLyric = -1;


/* ==========================
   SONG LIBRARY
========================== */

function renderSongs(list = songs) {

    songList.innerHTML = "";

    list.forEach((song, index) => {

        const item =
            document.createElement("div");

        item.className = "song";

        item.innerHTML = `
            <img
                src="${song.cover}"
                alt=""
            >

            <div class="song-info">

                <strong>
                    ${song.title}
                </strong>

                <span>
                    ${song.artist}
                </span>

            </div>
        `;

        item.addEventListener(
            "click",
            () => loadSong(
                songs.indexOf(song)
            )
        );

        songList.appendChild(item);
    });
}


/* ==========================
   LOAD SONG
========================== */

async function loadSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }

    currentSong = index;

    const song =
        songs[index];

    title.textContent =
        song.title;

    artist.textContent =
        song.artist;

    cover.src =
        song.cover;

    audio.src =
        song.audio;

    currentLyric = -1;

    lyricData = [];

    lyricsBox.innerHTML =
        `<div class="empty">
            Loading lyrics...
        </div>`;

    try {

        const response =
            await fetch(song.lyrics);

        if (!response.ok) {
            throw new Error(
                "Lyrics not found"
            );
        }

        const text =
            await response.text();

        parseLyrics(text);

    } catch (error) {

        lyricsBox.innerHTML =
            `<div class="empty">
                Lyrics unavailable
            </div>`;
    }

    audio.load();

    audio.play()
        .catch(() => {});

}


/* ==========================
   PARSE LRC
========================== */

function parseLyrics(text) {

    lyricData = [];

    const lines =
        text.split(/\r?\n/);

    lines.forEach(line => {

        const matches =
            [...line.matchAll(
                /\[(\d+):(\d+(?:\.\d+)?)\](.*)/g
            )];

        matches.forEach(match => {

            const minutes =
                Number(match[1]);

            const seconds =
                Number(match[2]);

            const text =
                match[3].trim();

            if (!text) return;

            lyricData.push({
                time:
                    minutes * 60 +
                    seconds,

                text: text
            });

        });

    });

    lyricData.sort(
        (a, b) =>
            a.time - b.time
    );

    renderLyrics();
}


/* ==========================
   RENDER LYRICS
========================== */

function renderLyrics() {

    lyricsBox.innerHTML = "";

    lyricData.forEach(
        (line, index) => {

            const element =
                document.createElement("div");

            element.className =
                "lyric";

            element.textContent =
                line.text;

            element.addEventListener(
                "click",
                () => {

                    audio.currentTime =
                        line.time;

                    audio.play();

                }
            );

            lyricsBox.appendChild(
                element
            );

        }
    );
}


/* ==========================
   UPDATE LYRICS
========================== */

function updateLyrics() {

    if (!lyricData.length) {
        return;
    }

    const time =
        audio.currentTime;

    let index = -1;

    for (
        let i = 0;
        i < lyricData.length;
        i++
    ) {

        if (
            lyricData[i].time <= time
        ) {

            index = i;

        } else {

            break;

        }
    }

    if (index === currentLyric) {
        return;
    }

    currentLyric = index;

    const elements =
        document.querySelectorAll(
            ".lyric"
        );

    elements.forEach(
        (element, i) => {

            element.classList.remove(
                "active"
            );

            if (i === index) {

                element.classList.add(
                    "active"
                );

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }
    );
}


/* ==========================
   PLAY / PAUSE
========================== */

play.addEventListener(
    "click",
    () => {

        if (!audio.src) return;

        if (audio.paused) {

            audio.play();

        } else {

            audio.pause();

        }

    }
);


audio.addEventListener(
    "play",
    () => {

        play.textContent = "⏸";

    }
);


audio.addEventListener(
    "pause",
    () => {

        play.textContent = "▶";

    }
);


/* ==========================
   TIME
========================== */

function formatTime(seconds) {

    if (!isFinite(seconds)) {
        return "0:00";
    }

    const min =
        Math.floor(
            seconds / 60
        );

    const sec =
        Math.floor(
            seconds % 60
        );

    return (
        min +
        ":" +
        String(sec)
            .padStart(2, "0")
    );
}


audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }

        progress.value =
            (
                audio.currentTime /
                audio.duration
            ) * 100;

        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

        updateLyrics();

    }
);


/* ==========================
   SEEK
========================== */

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }

        audio.currentTime =
            (
                progress.value /
                100
            ) *
            audio.duration;

    }
);


/* ==========================
   VOLUME
========================== */

volume.addEventListener(
    "input",
    () => {

        audio.volume =
            volume.value;

    }
);


/* ==========================
   PREVIOUS
========================== */

previous.addEventListener(
    "click",
    () => {

        if (
            audio.currentTime > 5
        ) {

            audio.currentTime = 0;

            return;
        }

        if (currentSong > 0) {

            loadSong(
                currentSong - 1
            );

        }

    }
);


/* ==========================
   NEXT
========================== */

next.addEventListener(
    "click",
    () => {

        if (
            currentSong <
            songs.length - 1
        ) {

            loadSong(
                currentSong + 1
            );

        }

    }
);


/* ==========================
   SEARCH
========================== */

searchToggle.addEventListener(
    "click",
    () => {

        searchBox.classList.toggle(
            "show"
        );

        if (
            searchBox.classList.contains(
                "show"
            )
        ) {

            searchInput.focus();

        }

    }
);


searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        const filtered =
            songs.filter(song =>

                song.title
                    .toLowerCase()
                    .includes(query)

                ||

                song.artist
                    .toLowerCase()
                    .includes(query)

            );

        renderSongs(filtered);

    }
);


/* ==========================
   START
========================== */

renderSongs();
