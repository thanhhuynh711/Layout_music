// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepest: false,
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Người em từng yêu",
      singer: "Ngân Ngân",
      path: "./music/NguoiEmTungYeu-NganNgan-7903927.mp3",
      image:
        "https://avatar-ex-swe.nixcdn.com/song/2022/09/17/2/7/7/e/1663430367280_500.jpg",
    },
    {
      name: "Tìm Được Nhau Khó Thế Nào",
      singer: "Anh Tú",
      path: "./music/TimDuocNhauKhoTheNaoOriginalMovieSoundtrackFromChiaKhoaTramTy-AnhTuTheVoice-7127088.mp3",
      image:
        "https://avatar-ex-swe.nixcdn.com/song/2022/01/17/6/c/e/0/1642406689812_500.jpg",
    },
    {
      name: "Anh Tự Do Nhưng Cô Đơn",
      singer: "Đạt G",
      path: "./music/AnhTuDoNhungCoDonLiveAtDearocean-DatG-8398152.mp3",
      image:
        "https://avatar-ex-swe.nixcdn.com/singer/avatar/2022/07/14/2/1/0/a/1657771898603.jpg",
    },
    {
      name: "I'm Not OK",
      singer: "XMASwu",
      path: "./music/ImNotOK-XMASwu-6384046.mp3",
      image: "https://stc-id.nixcdn.com/v11/images/avatar_default.jpg",
    },
    {
      name: "Chẳng Gì Đẹp Đẽ Trên Đời Mãi",
      singer: "Khang Việt",
      path: "./music/ChangGiDepDeTrenDoiMai-KhangViet-5183426.mp3",
      image:
        "https://avatar-ex-swe.nixcdn.com/song/2017/09/21/9/a/b/3/1505988699959_500.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return ` 
      <div data-index=${index} class="song ${
        index == this.currentIndex ? "active" : ""
      }">
        <div
          class="thumb"
          style="
            background-image: url('${song.image}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  definePropeties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvevts: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    repeatBtn.onclick = function (e) {
      _this.isRepest = !_this.isRepest;
      _this.setConfig("isRepest", _this.isRepest);
      repeatBtn.classList.toggle("active", _this.isRepest);
    };

    audio.onended = function () {
      if (_this.isRepest) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || !e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSongs();
          _this.render();
          audio.play();
        }
        if (!e.target.closest(".option")) {
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadCurrentSongs: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepest = this.config.isRepest;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSongs();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSongs();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSongs();
  },

  start: function () {
    this.loadConfig();
    this.definePropeties();
    this.handleEvevts();
    this.loadCurrentSongs();
    this.render();
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepest);
  },
};

app.start();
