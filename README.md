# 課題2 -じゃんけんアプリ_リッチVer-

## ①課題内容（どんな作品か）
### じゃんけん音ゲーム（機械学種）
- 課題1のじゃんけんアプリに、機械学習で画像判別要素を追加し、よりインタラクティブなゲームにしました（ゲーム性としては前回の方が楽しいですが、さらなる脳トレになる？？）
- index.htmlを開いて少しすると「カメラを使用する」のポップアップが出るので、「許可」を選択
- 任意のキーでスタート
- 降りてくるバーのじゃんけんに勝つように、左上の映像内におさまる形でグー、チョキ、パーを出す　※できるだけ背景はシンプルにしてください（顔や体も極力画面外に、、、）
- タイミングは「f」キーを押下する

## ②工夫した点・こだわった点
-  じゃんけんを画像識別できるように「Teachable Machine」で学習・予測モデルを生成し、実装しました
-  PC内臓カメラを使って映像を表示してます

## ③質問・疑問（あれば）
- 特になし

## ④その他（感想、シェアしたいことなんでも）
- 「Teachable Machine」で簡単に機械学習モデルが作れて便利です
- 本当は「f」キーも押下せずにタイミング識別できるようにしたかったです、、
- チョキの識別精度が悪いかもです
