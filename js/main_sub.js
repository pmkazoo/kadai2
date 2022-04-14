const VIDEO_SIZE = {
  width: 640,
  height: 360,
},
  CANVAS = {
    back: 0,
    layer: 1,
  },
  //状態
  GAME_MODE = {
    standby: 1,
    play: 2,
    playData: 3,
    end: 4,
    cancel: 5,
    wait: 9,
    make_standby: 11,
    make_play: 12,
    make_playData: 13,
    make_end: 14,
    make_cancel: 15,
    make_replay: 16,
    make_wait: 19,
    state: null,
  },
  //タイミング判定
  JUDGE = {
    perfect: 0,
    excellent: 1,
    good: 2,
    normal: 3,
    miss: 4,
    size: 4,
    score: [],
    text: ["perfect", "excellent", "good", "normal", "miss"],
  },
  //バーの色
  BAR_COLOR = [
    "#ff007f",
    "#007fff",
    "#7f00ff",
    "#ffff00",
    "#00ff7f",
    "#ffadd6",
    "#add6ff",
    "#adffad",
    "#ffffad",
    "#d6adff",
  ],
  //キーボード入力
  KEY = [
    [""],
    ["f"],
    ["f", "j"],
    ["f", "g", "h"],
    ["d", "f", "j", "k"],
    ["s", "d", "f", "j", "k", "l"],
    ["a", "s", "d", "f", "j", "k", "l", ";"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ];
// じゃんけん画像
IMG = [
  "./img/rock.png",
  "./img/scissors.png",
  "./img/paper.png",
]


let player; //YouTube
let isSP; //trueならスマホ
let isPortrait; //true縦向き
let ctx; //コンテキスト
let cvSize; //キャンバスサイズ
let rectRange; //矩形範囲
let inputRange; //入力範囲
let touchRange; //タッチ範囲
let notes; //譜面データ
let playData; //プレイデータ
let keyList; //キーリスト
let bar; //タイミングバー

class Bar {
  #width = (rectRange.width - rectRange.rightSpace) * 3;
  #height = rectRange.height;
  constructor(color) {
    //    this.x = rectRange.width * i + rectRange.leftSpace;
    this.x = rectRange.leftSpace;
    this.color = color;
  }
  draw(y, janken) {
    ctx.layer.fillStyle = this.color;
    ctx.layer.fillRect(this.x, y, this.#width, this.#height);

    let img = new Image();
    img.onload = function (e) {
      ctx.layer.drawImage(img, this.x + rectRange.width, y, rectRange.height, rectRange.height);
      ctx.layer.drawImage(img, this.x + rectRange.width * 2, y, rectRange.height, rectRange.height);
    }
    img.src = img[janken];
  }
}

//スタンバイ状態
const setStandby = () => {
  player.stopVideo();

  setGameData();
  gameStandby();
};

//譜面データをセット
const setGameData = () => {
  if (GAME_MODE.state === GAME_MODE.play) {

  } else {
    notes = {
      lineSize: FILE.lineSize,//ライン数
      timing: FILE.timing,//入力タイミング
      line: FILE.line,//ライン
      index: 0,
      offset: 0,
      getSize() {
        return this.timing.length;
      },
      get isEnd() {
        return this.timing.length <= this.offset;
      },
    };
  }
};

const makeNotes = {
  lineSize: 3,

  timing: [
  ],

  line: [
  ],

}

//wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//対象のctxをクリア
const clearCanvas = (ctx) => ctx.clearRect(0, 0, cvSize.width, cvSize.height);

//0埋め
const padZero = (value, digit) => value.toString().padStart(digit, "0");

//スタンバイ
const gameStandby = async () => {
  GAME_MODE.state = GAME_MODE.standby;

  //ラインを描画
  const drawLine = () => {
    ctx.back.lineWidth = 1;
    ctx.back.strokeStyle = "#ffffff77";
    ctx.back.beginPath();
    const size = notes.lineSize + 1;
    for (let i = 0; i < size; ++i) {
      let x = rectRange.width * i - 0.5;
      if (i === 0) ++x;
      ctx.back.moveTo(x, 0);
      ctx.back.lineTo(x, cvSize.height);
    }
    ctx.back.stroke();
  };

  //矩形を描画
  const drawBoxes = () => {
    const drawBox = (i) => {
      let x = rectRange.width * i + rectRange.leftSpace + 1,
        width = rectRange.width - rectRange.rightSpace,
        img = new Image();
      if (0 < i) x -= 1;
      ctx.back.strokeStyle = BAR_COLOR[i];
      ctx.back.strokeRect(x, rectRange.y + 0.5, width, rectRange.height);
      ctx.back.fillStyle = BAR_COLOR[i] + "55";
      ctx.back.fillRect(x, rectRange.y, width, rectRange.height);
      img.onload = function (e) {
        ctx.back.drawImage(img, x + rectRange.width / 2.5, rectRange.y, rectRange.height * 1.5, rectRange.height * 1.5);
      }
      img.src = img[i];
    };
    ctx.back.lineWidth = 2;
    for (let i = 0; i < notes.lineSize; ++i) drawBox(i);
  };

  //テキストを描画
  const text = "TOUCH START";
  const drawText = () => {
    ctx.layer.font = "28pt sans-serif";
    ctx.layer.fillStyle = "white";
    ctx.layer.fillText(text, (cvSize.width - ctx.layer.measureText(text).width) / 2, cvSize.height / 1.75);
  };

  drawBoxes();
  drawLine();

  let b = false;
  while (GAME_MODE.state === GAME_MODE.standby) {
    clearCanvas(ctx.layer);
    if ((b = !b)) drawText();
    await sleep(500);
  }
};

//プレイデータを初期化
const initGame = () => {
  playData = {
    score: 0, //点数
    combo: 0, //コンボ
    maxCombo: 0, //MAXコンボ
    judge: null, //タイミング判定
    judgeCount: JUDGE.text.map(() => 0), //各タイミングの判定回数
    speed: 3, //落下速度
    isInput: false, //trueなら入力あり
    inputLine: null, //入力ライン
    over: false, //入力ラインを越えたか
    index: 0, //ずれ防止用入力対象
    setInput(line, over) {
      this.isInput = true;
      this.inputLine = line;
      this.over = over;
      this.index = notes.index;
    },
  };

  //ライン数分のバーを作成
  const barColor = BAR_COLOR.map((value) => value + "cc");
  const size = notes.getSize();
  // bar = [];
  //  for (let i = 0; i < notes.lineSize; ++i) bar[i] = new Bar(i, barColor[i]);
  // console.log("linesize:"+notes.lineSize);
  // for (let i = 0; i < notes.lineSize; ++i) bar[i] = new Bar(i, "#fafad2cc");
  // for (let i = 0; i < notes.lineSize; ++i) bar[i] = new Bar("#fafad2cc");
  bar = new Bar("#fafad2cc");

  //PC用キーを設定
  //  keyList = KEY[notes.lineSize / 2 - 1];
  keyList = KEY[notes.lineSize]; //add
};

// 作成
const gameMake = async () => {
  GAME_MODE.state = GAME_MODE.make_play;

  initGame();
  const effectColorForMake = BAR_COLOR.map((value) => value + "77");
  let drawCount = 0; //描画カウンター

  //入力エフェクトを描画
  function drawInputEffectForMake() {
    ctx.layer.fillStyle = effectColorForMake[playData.inputLine];
    ctx.layer.fillRect(
      rectRange.width * playData.inputLine + rectRange.leftSpace,
      0,
      rectRange.width - rectRange.rightSpace,
      cvSize.height
    );
  }

  //プレイデータを作成
  const makePlayData = () => {
  };

  //作成終了
  const makeGameEnd = () => {
    GAME_MODE.state = GAME_MODE.replay;
    alert(GAME_MODE.state);
  };

  player.playVideo();

  while (GAME_MODE.state === GAME_MODE.make_play) {
    // console.log(playData.inputLine);
    clearCanvas(ctx.layer);
    makePlayData();
    drawInputEffectForMake();
    console.log(makeNotes.line);
    if (makeNotes.timing.length > 10) makeGameEnd();
    await sleep(16);
  }

}

//プレイ
const gamePlay = async () => {
  GAME_MODE.state = GAME_MODE.play;
  initGame();
  const effectColor = BAR_COLOR.map((value) => value + "77");
  let drawCount = 0; //描画カウンター

  //入力ミス
  const setInputMiss = () => {
    playData.combo = 0;
    ++playData.judgeCount[(playData.judge = JUDGE.miss)];
  };

  //バーを描画
  const drawTimingBar = () => {
    const current = (player.getCurrentTime() * 1000) | 0;
    for (let i = notes.offset, size = notes.getSize(); i < size; ++i) {
      const y = (current - notes.timing[i]) / playData.speed + rectRange.y - rectRange.height;
      if (y < 0) break;
      bar.draw(y, notes.line[i]);
      if (i == notes.index && inputRange.bottom[JUDGE.normal] < y) {
        setInputMiss();
        drawCount = 30;
        notes.index = i + 1;
      }
      if (cvSize.height < y) notes.offset = i + 1;
    }
  };

  //判定を描画
  const drawJudge = () => {
    if (drawCount <= 0) return;
    ctx.layer.font = "32pt sans-serif";
    ctx.layer.fillStyle = "white";
    ctx.layer.fillText(
      JUDGE.text[playData.judge],
      (cvSize.width - ctx.layer.measureText(JUDGE.text[playData.judge]).width) >> 1,
      cvSize.height / 2 + drawCount
    );
    if (1 < playData.combo) {
      let text = playData.combo + " Combo";
      ctx.layer.fillText(
        text,
        (cvSize.width - ctx.layer.measureText(text).width) >> 1,
        cvSize.height / 1.75 + drawCount
      );
    }
    --drawCount;
  };

  //入力エフェクトを描画
  const drawInputEffect = () => {
    ctx.layer.fillStyle = effectColor[playData.inputLine];
    ctx.layer.fillRect(
      rectRange.width * playData.inputLine + rectRange.leftSpace,
      0,
      rectRange.width - rectRange.rightSpace,
      cvSize.height
    );
  };

  //タイミング判定
  const judge = () => {
    if (playData.isInput) {
      if (playData.judge === JUDGE.miss) {
        setInputMiss();
      }
      else {
        notes.offset = ++notes.index;
        ++playData.judgeCount[playData.judge];
        if (playData.maxCombo < ++playData.combo) playData.maxCombo = playData.combo;
      }
      if (playData.over && notes.index === playData.index) notes.offset = ++notes.index;
      drawInputEffect();
      playData.isInput = false;
      drawCount = 30;
    }
  };

  //プレイデータを描画
  const drawPlayData = () => {
    clearCanvas(ctx.back);
    clearCanvas(ctx.layer);
    let digit = 10;
    while (true) {
      if (notes.getSize() < digit) {
        digit = String(digit - 1).length;
        break;
      }
      digit *= 10;
    }
    ctx.layer.font = "24pt sans-serif";
    ctx.layer.fillStyle = "white";
    const mesure = ctx.layer.measureText(
      JUDGE.text[JUDGE.excellent] + " : " + padZero(playData.judgeCount[JUDGE.excellent], digit)
    ),
      right = (cvSize.width - mesure.width) / 2,
      textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent + 8,
      list = [...JUDGE.text, "combo"],
      data = [...playData.judgeCount, playData.maxCombo];
    for (let [i, text] of list.entries()) {
      text += " : " + padZero(data[i], digit);
      const x = i === JUDGE.excellent ? right : cvSize.width - right - ctx.layer.measureText(text).width;
      ctx.layer.fillText(text, x, cvSize.height / 2 + textHeight * i);
    }
  };

  //プレイ終了
  const gameEnd = () => {
    GAME_MODE.state = GAME_MODE.playData;

    drawPlayData();
    setTimeout(() => {
      notes = playData = bar = null;
      GAME_MODE.state = GAME_MODE.end;
    }, 1000);
  };

  player.playVideo();

  while (GAME_MODE.state === GAME_MODE.play) {
    console.log("play");
    clearCanvas(ctx.layer);
    judge();
    drawJudge();
    drawTimingBar();
    if (notes.isEnd) gameEnd();
    await sleep(16);
  }
};

//入力情報をセット
const setInput = (line) => {

  if (GAME_MODE.state === GAME_MODE.play) {
    const y =
      (((player.getCurrentTime() * 1000) | 0) - notes.timing[notes.index]) / playData.speed + rectRange.y;
    playData.setInput(line, inputRange.over < y);
    playData.judge = JUDGE.miss;

    // if (line === notes.line[notes.index]) {
    //   for (let i = 0; i < JUDGE.size; ++i) {
    //     if (inputRange.top[i] < y && y < inputRange.bottom[i]) {
    //       playData.judge = i;
    //       break;
    //     }
    //   }
    // }

    if (((line === 0) && (notes.line[notes.index] === 1)) || ((line === 1) && (notes.line[notes.index] === 2)) || ((line === 2) && (notes.line[notes.index] === 0))) {
      for (let i = 0; i < JUDGE.size; ++i) {
        if (inputRange.top[i] < y && y < inputRange.bottom[i]) {
          playData.judge = i;
          break;
        }
      }
    }
  } else if (GAME_MODE.state === GAME_MODE.make_play) {
    console.log(line);
    playData.setInput(line, false);
    makeNotes.timing.push(performance.now());
    makeNotes.line.push(line);
  }
};

//タッチ
const touch = (e) => {
  if (touchRange.top < e.pageY && e.pageY < cvSize.height) {
    for (let i = 0; i < notes.lineSize; ++i) {
      if (touchRange.getLeft(i) < e.pageX && e.pageX < touchRange.getRight(i)) {
        setInput(i);
        break;
      }
    }
  }
};

//キーボード
const push = (kb) => {
  for (let [i, key] of keyList.entries()) {
    if (key === kb) {
      // console.log(i);
      setInput(i);
      break;
    }
  }
};


//入力
const input = (isTouch, e) => {

  switch (GAME_MODE.state) {
    case GAME_MODE.standby:
      gamePlay();
      break;
    case GAME_MODE.play:
    case GAME_MODE.make_play:
      isTouch ? touch(e.changedTouches[0]) : push(e.key);
      break;
    case GAME_MODE.end:
      setGameData();
      break;
    case GAME_MODE.make_standby:
      gameMake();
    case GAME_MODE.make_end:
      makeGameData();
      break;

  }

  // if(e.key==GAME_MODE.make){
  //   gameMake();
  // }else{
  //   gamePlay();
  // }

};

window.onload = () => {
  document.documentElement.addEventListener("touchstart", (e) => input(true, e));
  document.onkeydown = (e) => {
    if (e.repeat) return;

    // gameMake用
    if (e.key == "m") {
      GAME_MODE.state = GAME_MODE.make_standby;
    }

    input(false, e);
  };
};
