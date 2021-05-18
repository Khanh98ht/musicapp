const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8-PLAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "By Your Side",
            singer: "MARIN HOXHA & BRITT LARI",
            path: "./songs/by your side/01_-_By_Your_Side.mp3",
            image: "./songs/by your side/photo_2020-12-19_02-05-49-300x300.jpg"
        },
        {
            name: "Nevada",
            singer: "Vicetone Cozi Zuehlsdorff",
            path: "./songs/nevada/Nevada - Vicetone Cozi Zuehlsdorff (NhacPro.net).mp3",
            image:
              "./songs/nevada/d89e2ea79b01f1400e06c98fb849cf84.jpg"
        },
        {
            name: "Astronomy",
            singer: "Antomage & Sarah de Warren",
            path:
              "./songs/astronomy/y2mate.com - Antomage  Sarah de Warren  Astronomy.mp3",
            image: "./songs/astronomy/0.jpg"
        },
        {
            name: "Walk thru fire",
            singer: "Vicetone Cozi Zuehlsdorff",
            path: "./songs/walk thru fire/y2mate.com - Vicetone  Walk Thru Fire Lyrics ft Meron Ryan.mp3",
            image:
              "./songs/walk thru fire/0 (1).jpg"
        },     
        {
            name: "BEAUZ  Outerspace feat",
            singer: "Dallas Monstercat",
            path: "./songs/beauz outer space/y2mate.com - BEAUZ  Outerspace feat Dallas Monstercat Release_320kbps.mp3",
            image:
              "./songs/beauz outer space/0.jpg"
        },     
    ],
    setConfig: function(key, value) {
      this.config[key] = value;
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    
    render: function() {
      const htmls = this.songs.map((song, index) => {
        return `
        <div class="song ${index === this.currentIndex ? 'active': ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
        `
      })
      playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
      Object.defineProperty(this, 'currentSong', {
        get: function() {
          return this.songs[this.currentIndex]
        }
      })
    },
    handleEvents: function() {
      const _this = this
      const cdWidth = cd.offsetWidth

      // Xử lý CD quay / dừng
      const cdThumbAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)' }
      ], {
        duration: 10000,
        iterations: Infinity,
      })
      cdThumbAnimate.pause()


      // Xử lý phóng to, thu nhỏ
      document.onscroll = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const newCdWidth = cdWidth - scrollTop

        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0
        cd.style.opacity = newCdWidth / cdWidth
      }

      // xử lý khi play
      playBtn.onclick = function() {
        if (_this.isPlaying) {
          audio.pause()
        } else {
          audio.play()
        }

        // Khi play 
        audio.onplay = function() {
          _this.isPlaying = true         
          player.classList.add('playing')
          cdThumbAnimate.play()
        }
        // khi pause
        audio.onpause = function() {
          _this.isPlaying = false,
          player.classList.remove('playing')
          cdThumbAnimate.pause()
        }

        // Tien do bai hat thay doi
        audio.ontimeupdate = function() {
          if(audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercent
          }
        }

        // Tua
        progress.onchange = function(e) {
          console.log(e.target)
          const seekTime = audio.duration*e.target.value/100
          audio.currentTime = seekTime
        }
      }

      // Khi next song
      nextBtn.onclick = function() {
        if (_this.isRandom) {
          _this.playRandomSong()
        } else {
          _this.nextSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong1()
      }
      // Khi prev song
      prevBtn.onclick = function() {
        if (_this.isRandom) {
          _this.playRandomSong()
        } else {
          _this.prevSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong2()
      }

      // Xử lý khi bật tắt random songs
      randomBtn.onclick = function(e) {
        _this.isRandom = !_this.isRandom
        _this.setConfig('isRandom', _this.isRandom)
        randomBtn.classList.toggle('active', _this.isRandom)
      }

      // Xử lý phát lại 1 bài hát
      repeatBtn.onclick = function(e) {
        _this.isRepeat = !_this.isRepeat
        _this.setConfig('isRepeat', _this.isRepeat)
        repeatBtn.classList.toggle('active', _this.isRepeat)
      }

      // Xử lý next song khi audio ended
      audio.onended = function () {
        if (_this.isRepeat) {
          audio.play()
        } else {
          nextBtn.click
        }
      }

      // Lắng nghe hành vi click vào playlist
      playlist.onclick = function(e) {
        const songNode = e.target.closest('.song:not(.active)')
        
        if (songNode ||
        e.target.closest('.option')
        ) {
          // Xử lý khi click vào song
          if (songNode) {
            _this.currentIndex = Number(songNode.dataset.index)
            _this.loadCurrentSong()
            _this.render()
            audio.play()
          }
        }
      }
      
    },
    scrollToActiveSong1: function() {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    },
    scrollToActiveSong2: function() {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    },

    loadCurrentSong: function() {
      heading.textContent = this.currentSong.name
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
      audio.src = this.currentSong.path
    },
    loadConfig: function() {
      this.isRandom = this.config.isRandom
      this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
      this.currentIndex++
      if(this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
      }
      this.loadCurrentSong()
    },
    prevSong: function() {
      this.currentIndex--
      if(this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1
      }
      this.loadCurrentSong()
    },
    playRandomSong: function() {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * this.songs.length)
      } while (newIndex === this.currentIndex)

      this.currentIndex = newIndex
      this.loadCurrentSong()
    },
    

    start: function() {
      this.loadConfig()
      this.defineProperties()
      this.handleEvents()
      this.loadCurrentSong()
      this.render()

      // Hiển thị trạng thái ban đầu của btn repeat và random
      randomBtn.classList.toggle('active', this.isRandom)
      repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()

// 1. Render
