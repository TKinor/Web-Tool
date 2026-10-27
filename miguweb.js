// ==UserScript==
// @name         伪造桌面分辨率 | 拦截移动端跳转 | 解锁缩放
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  覆盖screen、innerWidth、devicePixelRatio，拦截location跳转，重写viewport
// @author       You
// @match        https://www.miguvideo.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';
    // ========== 在这里修改伪造参数 ==========
    const FAKE_W = 1920;
    const FAKE_H = 1080;
    const FAKE_DPR = 1; // devicePixelRatio 缩放比例
    // ========================================

    // 1. 伪造 screen 对象（screen.width / screen.height / availWidth等）
    const screenDesc = {
        width: { value: FAKE_W, configurable: false },
        height: { value: FAKE_H, configurable: false },
        availWidth: { value: FAKE_W, configurable: false },
        availHeight: { value: FAKE_H, configurable: false },
        colorDepth: { value: 24, configurable: false },
        pixelDepth: { value: 24, configurable: false }
    };
    Object.defineProperties(window.screen, screenDesc);

    // 2. 伪造视口尺寸 innerWidth / innerHeight / outerWidth
    Object.defineProperties(window, {
        innerWidth: { value: FAKE_W, configurable: false },
        innerHeight: { value: FAKE_H, configurable: false },
        outerWidth: { value: FAKE_W, configurable: false },
        outerHeight: { value: FAKE_H, configurable: false },
        devicePixelRatio: { value: FAKE_DPR, configurable: false }
    });

    // 3. 拦截 location.replace / assign 跳转（JS自动跳m站）
    const _assign = window.location.assign;
    window.location.assign = function(url) {
        if (/m\.|mobile|wap/.test(url)) {
            console.log('[油猴] 拦截移动端跳转：', url);
            return;
        }
        return _assign.call(this, url);
    };
    const _replace = window.location.replace;
    window.location.replace = function(url) {
        if (/m\.|mobile|wap/.test(url)) {
            console.log('[油猴] 拦截移动端跳转：', url);
            return;
        }
        return _replace.call(this, url);
    };

    // 4. 修复viewport：取消禁止缩放 user-scalable=no
    function fixViewport() {
        let vp = document.querySelector('meta[name="viewport"]');
        const vpContent = `width=${FAKE_W}, initial-scale=1, maximum-scale=10, user-scalable=yes`;
        if (vp) {
            vp.setAttribute('content', vpContent);
        } else {
            const m = document.createElement('meta');
            m.name = 'viewport';
            m.content = vpContent;
            document.head.appendChild(m);
        }
    }
    // 监听DOM变化，防止网站后续重新覆盖viewport
    const obs = new MutationObserver(fixViewport);
    obs.observe(document.documentElement, { childList: true, subtree: true });
    fixViewport();
})();
