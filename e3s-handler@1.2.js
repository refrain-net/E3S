/**
 * @overview e3s-handler@1.2.js E3Sのイベント系統の制御プログラム
 * @author Refrain <refrain.net@gmail.com>
 * @since 2020/10/1
 * @update 2021/1/16 onCopyの廃止
 * @update 2021/5/11 DnD対象をファイルのみに変更
 * @version 1.2
 * @copyright (c) Copyright 2020 Refrain All Rights Reserved.
 */

'use strict';

/** @type {HTMLElement} HTML要素を取得する */
const cXXeUh7g = document.querySelector('#cXXeUh7g');
const JdVP0JG2 = document.querySelector('#JdVP0JG2');
const H0jP0Xr4 = document.querySelector('#H0jP0Xr4');
const UJNWVR0g = document.querySelector('#UJNWVR0g');
const ZHgPpUJS = document.querySelector('#ZHgPpUJS');
const iophZzyF = document.querySelector('#iophZzyF');
const GFZYmEFU = document.querySelector('#GFZYmEFU');
const QR0Oq3bL = document.querySelector('#QR0Oq3bL');
const az1m1nnB = document.querySelector('#az1m1nnB');
const NMQr9RMs = document.querySelector('#NMQr9RMs');
const F8tWfFbD = document.querySelector('#F8tWfFbD');
const Dekkg8Z2 = document.querySelector('#Dekkg8Z2');
const dJLELTrV = document.querySelector('#dJLELTrV');
const YR6JWQam = document.querySelector('#YR6JWQam');

/** @summary イベントハンドラの登録 */
cXXeUh7g.addEventListener('change', onChange, false);
JdVP0JG2.addEventListener('click', onClick, false);
F8tWfFbD.addEventListener('click', onClick, false);
Dekkg8Z2.addEventListener('click', onClick, false);
dJLELTrV.addEventListener('click', onClick, false);
document.addEventListener('dragover', onDragover, false);
document.addEventListener('drop', onDrop, false);

/**
 * @function onChange changeイベント用の関数
 * @argument {Event} event changeイベント
 * @this {HTMLElement} イベントの発生したHTML要素
 */
function onChange (event) {
  switch (this) {
    case cXXeUh7g:
      loadConfig(this.files[0]);
      break;
    default:
      break;
  }
}

/**
 * @function onClick clickイベント用の関数
 * @argument {Event} event clickイベント
 * @this {HTMLElement} イベントの発生したHTML要素
 */
function onClick (event) {
  switch (this) {
    case JdVP0JG2:
      cXXeUh7g.click();
      break;
    case F8tWfFbD:
      /** @summary Dateオブジェクトを作成し、各値をinput要素に設定する */
      const date = new Date();
      iophZzyF.value = date.getFullYear();
      GFZYmEFU.value = date.getMonth() + 1;
      QR0Oq3bL.value = date.getDate();
      az1m1nnB.value = date.getHours();
      NMQr9RMs.value = date.getMinutes();
      break;
    case Dekkg8Z2:
      init();
      while (main());
      break;
    case dJLELTrV:
      /** @summary HTML要素をクリップボードにコピーする */
      YR6JWQam.copy();
      break;
    default:
      break;
  }
}

/**
 * @function onDragover dragoverイベント用の関数
 * @argument {Event} event dragoverイベント
 * @this {HTMLElement} イベントの発生したHTML要素
 */
function onDragover (event) {
  switch (this) {
    case document:
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      break;
    default:
      break;
  }
}

/**
 * @function onDrop dropイベント用の関数
 * @argument {Event} event dropイベント
 * @this {HTMLElement} イベントの発生したHTML要素
 */
function onDrop (event) {
  switch (this) {
    case document:
      const file = event.dataTransfer.files[0];
      if (file === undefined) return;
      event.stopPropagation();
      event.preventDefault();
      loadConfig(file);
      break;
    default:
      break;
  }
}
