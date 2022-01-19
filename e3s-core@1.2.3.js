/**
 * @overview e3s-core@1.2.3.js E3Sの制御プログラム
 * @author Refrain <refrain.net@gmail.com>
 * @since 2020/10/1
 * @update 2020/10/15 pad0の廃止
 * @update 2021/5/11 中断から再開まで1日開けられるように変更
 * @update 2021/5/29 書式の調整・途中から開始すると発生する計算誤差の修正
 * @update 2021/7/28 書式の調整・中断時間を10時から9時に変更
 * @update 2022/1/20 書式の調整
 * @version 1.2.3
 * @copyright (c) Copyright 2020 Refrain All Rights Reserved.
 */

'use strict';

/** @type {number[] | string[]} 走査中に得られたデータの保存先 */
const CACHE_DATA = [];
/** @type {string[]} 設備が動いていない期間のリスト */
const IMMOBILE_LIST = [];
/** @type {string[]} 休日のリスト */
const HOLIDAYS_LIST = [];
/** @type {RegExp} フォーマット確認用の正規表現 */
const IMMOBILE_PATTERN = /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}~\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}_.+$/;
/** @type {RegExp} フォーマット確認用の正規表現 */
const HOLIDAYS_PATTERN = /^\d{4}\/\d{2}\/\d{2}$/;
/** @type {number} 試験を中断する時間 */
const HOUR_OF_PAUSE = 9;
/** @type {number} 試験を再開する時間 */
const HOUR_OF_RESTART = 17;
/** @type {number} 試験を中断している時間 */
const HOUR_OF_PAUSING = HOUR_OF_RESTART - HOUR_OF_PAUSE;

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
 * refDateが休日であれば、refDateを翌日に変更する
 * @function addDateIfDateIsHoliday
 */
function addDateIfDateIsHoliday () {
  do {
    refDate.setDate(refDate.getDate() + 1);
    spanOffset += 24;
  } while (refDateIsHoliday());
}

/**
 * refDateを[YYYY/MM/DD, hh:mm]形式に変換する
 * @function getFormatedDateValue
 * @returns {string[]}
 */
function getFormatedDateValue () {
  const yyyyMMdd = `${refDate.getFullYear()}/${String(refDate.getMonth() + 1).padStart(2, '0')}/${String(refDate.getDate()).padStart(2, '0')}`;
  const hhmm = `${String(refDate.getHours()).padStart(2, '0')}:${String(refDate.getMinutes()).padStart(2, '0')}`;
  return [yyyyMMdd, hhmm];
}

/**
 * 繰り返し回数を取得する
 * @function getLoopCount
 * @returns {number} 繰り返し回数 + 補正値
 */
function getLoopCount () {
  return loopCount + loopOffset;
}

/**
 * 経過時間を取得する
 * @function getTotalTime
 * @returns {number} (現在時刻 - 開始時刻) - 中断させていた時間 x ループ回数 - 停止させていた時間 + 初期に経過していた時間
 */
function getTotalTime () {
  return ms2hr(refDate.getTime() - baseDate.getTime()) - HOUR_OF_PAUSING * getLoopCount() - disableTime + baseTime;
}

/**
 * 初期化処理
 * @function init
 */
function init () {
  CACHE_DATA.length = 0;
  baseDate = new Date(`${iophZzyF.value}/${GFZYmEFU.value}/${QR0Oq3bL.value} ${az1m1nnB.value}:${NMQr9RMs.value}`);
  refDate = new Date(baseDate);
  baseTime = parseInt(H0jP0Xr4.value);
  spanTime = parseInt(ZHgPpUJS.value);
  limitTime = parseInt(UJNWVR0g.value);
  loopOffset = parseInt(baseTime / spanTime);
  spanOffset = 0;
  disableTime = -1 * HOUR_OF_PAUSING * loopOffset;
  loopCount = 0;
  totalTime = 0;
  YR6JWQam.querySelector('tbody').innerHTML = '';
}

/**
 * コンフィグファイルの読み込み
 * @function loadConfig
 * @param {File} file
 */
async function loadConfig (file) {
  IM_LIST.length = 0;
  HO_LIST.length = 0;
  const text = await readFile(file);
  text.replace(/\r/g, '')
      .split('\n')
      .forEach(line => {
    /** @summary 正規表現で値をテストし、結果に応じてデータを加工・格納する */
    if (IMMOBILE_PATTERN.test(line)) IMMOBILE_LIST.push(line.split(/[~_]/));
    else if (HOLIDAYS_PATTERN.test(line)) HOLIDAYS_LIST.push(line);
  });
}

/**
 * 日程演算を実行する
 * @function main
 * @returns {boolean}
 */
function main () {
  if (loopCount > 0) addDateIfDateIsHoliday();
  saveScheduleDateToCache();
  refDate.setMinutes(0);
  setDate(HOUR_OF_PAUSE);
  /** @summary 経過時間を更新し、経過時間がループ回数 x スパン未満または休日であれば繰り返す */
  while ((totalTime = getTotalTime() - spanOffset) < spanTime * (getLoopCount() + 1) || refDateIsHoliday()) {
    refDate.setDate(refDate.getDate() + 1);
    /** @summary 設備を停止させる日ならtrueを返す */
    if (refDateIsImmobile()) return true;
  }
  saveScheduleDateToCache();
  CACHE_DATA.push(totalTime, totalTime - totalTime % spanTime);
  printScheduleToTable();
  loopCount ++;
  setDate(HOUR_OF_RESTART);
  /** @summary 経過時間が上限に達しているかを返す */
  return totalTime < limitTime;
}

/**
 * ミリ秒を時間に変換する
 * @function ms2hr
 * @param {number} milliseconds
 * @returns {number}
 */
function ms2hr (milliseconds) {
  return (milliseconds / 3600000) | 0;
}

/**
 * 得られた日程データをテーブルに出力する
 * @function printScheduleToTable
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

/**
 * ファイルを読み込む
 * @function readFile
 * @param {File} file
 * @returns {Promise}
 */
function readFile (file) {
  return new Promise((onLoad, onError) => {
    const reader = new FileReader();
    reader.onerror = event => onError(reader.error);
    reader.onload = event => onLoad(reader.result);
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * refDateが休日かを判定する
 * @function refDateIsHoliday
 * @returns {boolean}
 */
function refDateIsHoliday () {
  return HOLIDAYS_LIST.includes(getFormatedDateValue()[0]) || refDate.isWeekend();
}

/**
 * refDateがimListに含まれるかを判定する
 * @function refDateIsImmobile
 * @returns {boolean}
 */
function refDateIsImmobile () {
  for (const [stop, restart, reason] of IMMOBILE_LIST) {
    if (getFormatedDateValue()[0] !== stop.split(' ')[0]) continue;
    refDate = new Date(stop);
    saveScheduleDateToCache();
    totalTime = getTotalTime();
    CACHE_DATA.push(totalTime, reason);
    printScheduleToTable();
    const temp = new Date(restart);
    disableTime += ms2hr(temp.getTime() - refDate.getTime());
    refDate = temp;
    return true;
  }
  return false;
}

/**
 * refDateの値を保存する
 * @function saveScheduleDateToCache
 */
function saveScheduleDateToCache () {
  CACHE_DATA.push(refDate.getFullYear(), refDate.getMonth() + 1, refDate.getDate(), refDate.getHours(), refDate.getMinutes());
}

/**
 * refDateを任意の時間に設定する
 * @function setDate
 * @param {number} hour
 */
function setDate (hour) {
  hour %= 24;
  if (refDate.getHours() > hour) refDate.setDate(refDate.getDate() + 1);
  refDate.setHours(hour);
}
