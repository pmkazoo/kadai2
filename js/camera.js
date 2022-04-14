
const labelContainer = document.getElementById('label-container');

//学習モデルをアップロードして生成されたURLに置き換えてください
const URL = "https://teachablemachine.withgoogle.com/models/shIZfDnZw/";

let model, webcam, maxPredictions, frame, max_class;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const webcamContainer = document.getElementById('webcam-container');


    //学習モデルの読み込みと入力クラス（グー・チョキ・パー）の取得
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    //Webカメラの起動準備
    webcam = new tmImage.Webcam(200, 200);
    await webcam.setup();
    await webcam.play();

    //Webカメラの映像を画面に表示する
    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcam.canvas);

    //モデル予測の繰り返し実行
    window.requestAnimationFrame(loop);

    // //モデルにあるすべてのクラス要素にdivタグをつける
    // for (let i = 0; i < maxPredictions; i++) {
    //     labelContainer.appendChild(document.createElement("div"));
    // }
}

//モデル予測を繰り返し実行する
async function loop() {
    webcam.update();
    await predict();
    frame = window.requestAnimationFrame(loop);
}

//モデル予測処理
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let temp_max_class = 0;
    let temp_max_value = prediction[0].probability.toFixed(2);
    
    for (let i = 1; i < maxPredictions; i++) {
        let temp_class = i;
        let temp_value = prediction[i].probability.toFixed(2);
        
        if(temp_value > temp_max_value) {
            temp_max_class = temp_class;
            temp_max_value = temp_value;
        }

        // const prediction_name = prediction[i].className;  //クラス名の取得
        // const prediction_value = prediction[i].probability.toFixed(2); //認識率の取得

        // //判定結果を随時表示する
        // labelContainer.childNodes[i].innerHTML = `${name}: ${value}`;
    }
    max_class = temp_max_class;
    // console.log(max_class);
}

//モデル予測の終了処理
function stopCamera() {
    webcam.stop();
    window.cancelAnimationFrame(frame);
}
