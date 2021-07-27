/**
 * @overview e3s-core@1.2.2.js E3Sの制御プログラム
 * @author Refrain <refrain.net@gmail.com>
 * @since 2020/10/1
 * @update 2020/10/15 pad0の廃止
 * @update 2021/5/11 中断から再開まで1日開けられるように変更
 * @update 2021/5/29 書式の調整・途中から開始すると発生する計算誤差の修正
 * @update 2021/7/28 書式の調整・中断時間を10時から9時に変更
 * @version 1.2.2
 * @copyright (c) Copyright 2020 Refrain All Rights Reserved.
 */

'use strict';

/** @type {number[] | string[]} 走査中に得られたデータの保存先 */
const CACHE_DATA = [];
/** @type {string[]} 設備が動いていない期間のリスト */
const IM_LIST = [];
/** @type {string[]} 休日のリスト */
const HO_LIST = [];
/** @type {RegExp} フォーマット確認用の正規表現 */
const IM_PATTERN = /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}~\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}_.+$/;
/** @type {RegExp} フォーマット確認用の正規表現 */
const HO_PATTERN = /^\d{4}\/\d{2}\/\d{2}$/;
/** @type {number} 試験を中断する時間 */
const HOUR_OF_PAUSE = 9;
/** @type {number} 試験を再開する時間 */
const HOUR_OF_RESTART = 17;

/** @type {Date} 試験開始時点のDateオブジェクト */
let baseDate;
/** @type {Date} 参照を続けるDateオブジェクト */
let refDate;
/** @type {number} 試験開始時点での経過時間 */
let baseTime;
/** @type {number} ステップ毎の時間 */
let spanTime;
/** @type {number} 試験が終了する上限値 */
let limitTime;
/** @type {number} 途中から開始する場合の補正値 */
let loopOffset;
/** @type {number} 1日後に再開する場合の補正値 */
let spanOffset;
/** @type {number} 設備が停止している時間 */
let disableTime;
/** @type {number} 取り出し回数 */
let loopCount;
/** @type {number} 試験の経過時間 */
let totalTime;

/**
 * @function loadConfig コンフィグファイルの読み込み
 * @param {File} file 読み込み対象のファイル
 */
async function loadConfig (file) {
  IM_LIST.length = 0;
  HO_LIST.length = 0;
  const text = await readFile(file);
  text.replace(/\r/g, '').split('\n').forEach(function (currentValue) {
    if (IM_PATTERN.test(currentValue)) {
      IM_LIST.push(currentValue.split(/[~_]/));
    } else if (HO_PATTERN.test(currentValue)) {
      HO_LIST.push(currentValue);
    }
  });
}

/**
 * @function readFile ファイルを読み込む
 * @param {File} file 読み込む対象のFileオブジェクト
 * @returns {Promise} 読み込みを実行するPromiseオブジェクト
 */
function readFile (file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.addEventListener('error', function (event) {
      reject(reader.error);
    }, false);
    reader.addEventListener('load', function (event) {
      resolve(reader.result);
    }, false);
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * @function init 全データの初期化処理
 */
function init () {
  baseDate = new Date(`${iophZzyF.value}/${GFZYmEFU.value}/${QR0Oq3bL.value} ${az1m1nnB.value}:${NMQr9RMs.value}`);
  refDate = new Date(baseDate);
  baseTime = parseInt(H0jP0Xr4.value);
  spanTime = parseInt(ZHgPpUJS.value);
  limitTime = parseInt(UJNWVR0g.value);
  loopOffset = parseInt(baseTime / spanTime);
  spanOffset = 0;
  disableTime = -7 * loopOffset;
  loopCount = 0;
  totalTime = 0;
  CACHE_DATA.length = 0;
  YR6JWQam.querySelector('tbody').innerHTML = '';
}

/**
 * @function main 日程演算のメイン部
 * @description 1. 2周目以降でのみ補正を有効にする
 *              2. refDateを翌日に変更する
 *              3. 補正値を+24する
 *              4. 補正後の日付が休日の場合、翌日に変更する
 *              5. refDateのデータを保存する
 *              6. 0分に修正する
 *              7. 10時に設定する
 *              8. 経過時間を更新し、経過時間 < ループ回数 x スパンか、休日を検出する
 *              9. refDateを翌日に変更する
 *              10. 設備を停止させる日なら、trueを返して関数を抜け、親ループを継続する
 *              11. refDateのデータを保存する
 *              12. 経過時間と停止理由(停止させないので'')を保存する
 *              13. データをテーブルに出力する
 *              14. ループ回数を+1する
 *              15. 17時に設定する
 *              16. 経過時間が上限に達しているかを返し、親ループを制御する
 */
function main () {
  if (loopCount > 0) {                                                                                    // 1
    do {
      refDate.setDate(refDate.getDate() + 1);                                                             // 2
      spanOffset += 24;                                                                                   // 3
    } while (checkHoliday());                                                                             // 4
  }
  saveScheduleDateToCache();                                                                              // 5
  refDate.setMinutes(0);                                                                                  // 6
  setDate(HOUR_OF_PAUSE);                                                                                            // 7
  while ((totalTime = getTotalTime() - spanOffset) < spanTime * (getLoopCount() + 1) || checkHoliday()) { // 8
    refDate.setDate(refDate.getDate() + 1);                                                               // 9
    if (checkImmobile()) {
      return true;                                                                                        // 10
    }
  }
  saveScheduleDateToCache();                                                                              // 11
  CACHE_DATA.push(totalTime, totalTime - totalTime % spanTime);                                           // 12
  printScheduleToTable();                                                                                 // 13
  loopCount ++;                                                                                           // 14
  setDate(HOUR_OF_RESTART);                                                                                            // 15
  return totalTime < limitTime;                                                                           // 16
}

/**
 * @function checkHoliday 参照中の日時が休日かを判定する
 * @returns {boolean} 参照中の日時が休日か否か
 */
function checkHoliday () {
  return HO_LIST.includes(getFormatedDateValue()[0]) || refDate.isWeekend();
}

/**
 * @function saveScheduleDateToCache refDateの各値を保存する
 */
function saveScheduleDateToCache () {
  CACHE_DATA.push(refDate.getFullYear(), refDate.getMonth() + 1, refDate.getDate(), refDate.getHours(), refDate.getMinutes());
}

/**
 * @function setDate refDateを任意の時間に設定する
 * @param {number} hour 設定する時間
 */
function setDate (hour) {
  hour %= 24;
  if (refDate.getHours() > hour) {
    refDate.setDate(refDate.getDate() + 1);
  }
  refDate.setHours(hour);
}

/**
 * @function getTotalTime 経過時間を取得する
 * @returns {number} (現在時刻 - 開始時刻) - 中断時間 x ループ回数 - 停止時間 + 初期時間
 */
function getTotalTime () {
  return ms2hr(refDate.getTime() - baseDate.getTime()) - (HOUR_OF_RESTART - HOUR_OF_PAUSE) * getLoopCount() - disableTime + baseTime;
}

/**
 * @function ms2hr ミリ秒を時間に変換する
 * @param {number} milliseconds 変換するミリ秒
 * @returns {number} 変換後の時間
 */
function ms2hr (milliseconds) {
  return (milliseconds / 3600000) | 0;
}

/**
 * @function getLoopCount 繰り返し回数を取得する
 * @returns {number} 加算される繰り返し回数 + 繰り返し回数の補正値
 */
function getLoopCount () {
  return loopCount + loopOffset;
}

/**
 * @function checkImmobile imListに含まれる場合に計算を中断させる
 * @returns {boolean} 参照日時がimListに含まれていたか
 * @description 1. imListをループする
 *              2. refDateの日付と停止日が一致しなければループを再開する
 *              3. 停止日でDateオブジェクトを作成する
 *              4. stopDateのデータを保存する
 *              5. 経過時間を更新する
 *              6. 経過時間と停止理由を保存する
 *              7. データをテーブルに出力する
 *              8. 再開日でDateオブジェクトを作成する
 *              9. 再開日 - 停止日で停止させていた時間を取得する
 *              10. refDateを更新する
 *              11. trueを返し関数を終了し、親ループを終了する
 *              12. falseを返し関数を終了し、親ループを継続する
 */
function checkImmobile () {
  for (const [stop, restart, reason] of IM_LIST) {                  // 1
    if (getFormatedDateValue()[0] !== stop.split(' ')[0]) continue; // 2
    refDate = new Date(stop);                                       // 3
    saveScheduleDateToCache();                                      // 4
    totalTime = getTotalTime();                                     // 5
    CACHE_DATA.push(totalTime, reason);                             // 6
    printScheduleToTable();                                         // 7
    const temp = new Date(restart);                                 // 8
    disableTime += ms2hr(temp.getTime() - refDate.getTime());       // 9
    refDate = temp;                                                 // 10
    return true;                                                    // 11
  }
  return false;                                                     // 12
}

/**
 * @function getFormatedDateValue refDateを[YYYY/MM/DD, hh:mm]形式に変換する
 * @returns {string[]} [YYYY/MM/DD, hh:mm]形式に変換されたrefDate
 */
function getFormatedDateValue () {
  const ymd = `${refDate.getFullYear()}/${`${refDate.getMonth() + 1}`.padStart(2, '0')}/${`${refDate.getDate()}`.padStart(2, '0')}`;
  const hm = `${`${refDate.getHours()}`.padStart(2, '0')}:${`${refDate.getMinutes()}`.padStart(2, '0')}`;
  return [ymd, hm];
}

/**
 * @function printScheduleToTable 得られた日程データをテーブルに出力する
 */
function printScheduleToTable () {
  const tr = document.createElement('tr');
  let td;
  for (const data of CACHE_DATA) {
    td = document.createElement('td');
    td.textContent = data;
    tr.appendChild(td);
  }
  YR6JWQam.querySelector('tbody').appendChild(tr);
  CACHE_DATA.length = 0;
}
