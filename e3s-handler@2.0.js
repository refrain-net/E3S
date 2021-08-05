/**
 * @overview e3s-handler@2.0.js E3Sのイベント系統の制御プログラム
 * @author Refrain <refrain.net@gmail.com>
 * @since 2020/10/1
 * @update 2021/1/16 onCopyの廃止
 * @update 2021/5/11 DnD対象をファイルのみに変更
 * @update 2021/7/28 書式の調整
 * @update 2021/8/5 URLパラメータによる自動生成機能の実装
 * @version 1.2.1
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
window.addEventListener('load', onLoad, false);

/**
 * changeイベント
 * @function onChange
 * @param {Event} event
 * @this {HTMLElement}
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
 * clickイベント
 * @function onClick
 * @param {Event} event
 * @this {HTMLElement}
 */
function onClick (event) {
  switch (this) {
    case JdVP0JG2:
      cXXeUh7g.click();
      break;
    case F8tWfFbD:
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
      YR6JWQam.copy();
      break;
    default:
      break;
  }
}

/**
 * dragoverイベント
 * @function onDragover
 * @param {Event} event
 * @this {HTMLElement}
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
 * dropイベント
 * @function onDrop
 * @param {Event} event
 * @this {HTMLElement}
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


/**
 * loadイベント
 * @function onLoad
 * @param {Event} event
 * @this {HTMLElement}
 */
function onLoad (event) {
  switch (this) {
    case window:
      const {
        base = 0,
        limit = 1000,
        step = 250,
        year = 2000,
        month = 1,
        date = 1,
        hour = 17,
        minute = 0
      } = document.getParameters();
      H0jP0Xr4.value = base;
      UJNWVR0g.value = limit;
      ZHgPpUJS.value = step;
      iophZzyF.value = year;
      GFZYmEFU.value = month;
      QR0Oq3bL.value = date;
      az1m1nnB.value = hour;
      NMQr9RMs.value = minute;
      init();
      while (main());
      break;
    default:
      break;
  }
}
