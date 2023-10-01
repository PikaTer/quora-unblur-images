// ==UserScript==
// @name         Quora Unblur Images
// @namespace    quora-unblur-images
// @version      0.5.0
// @description  Unblur quora images and other utilities
// @author       PikaTer
// @match        https://*.quora.com/*
// @icon         https://raw.githubusercontent.com/PikaTer/quora-unblur-images/main/favicon.ico
// @license      MIT
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// ==/UserScript==

(function () {
    'use strict';

    /// ---- FUNCTIONS ---- ///

    // Remove Image Blur
    function removeBlur() {
        const images = document.querySelectorAll('.q-box[style*="filter"], .unzoomed');

        images.forEach(image => {
            if (window.getComputedStyle(image).getPropertyValue('filter') != 'blur(0px)') {
                image.style.filter = 'none';
                image.classList.add('unblured');
            }
        });

        setSessionSetting('autoUnblur', true);
    }

    // Blur Images
    function addBlur() {
        const images = document.querySelectorAll('.unblured');

        images.forEach(image => {
            image.style.filter = 'blur(30px)';
            image.classList.remove('unblured');
        });

        setSessionSetting('autoUnblur', false);
    }

    // Expand Posts
    function expandPosts() {
        // TODO: Find a better way to form the selector
        const posts = document.querySelectorAll('.q-click-wrapper.qu-display--block.qu-tapHighlight--none.qu-cursor--pointer:not(.qu-color--gray,[role="listitem"])');

        posts.forEach(post => {
            post.dispatchEvent(clickEvent);
        });
    }

    // Observe the DOM for New Post Loaded
    // Credit: @vsync [https://stackoverflow.com/a/14570614]
    function observeDOM(targetNode) {
        const config = { childList: true, subtree: true };

        const callback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    getSessionSetting('autoUnblur') && removeBlur();
                }
            }
        };

        if (MutationObserver) {
            const mutationObserver = new MutationObserver(callback);

            mutationObserver.observe(targetNode, config);
        }
        else if (window.addEventListener) {
            targetNode.addEventListener('DOMNodeInserted', callback, false);
            targetNode.addEventListener('DOMNodeRemoved', callback, false);
        }

        getSessionSetting('autoUnblur') && removeBlur();
    }

    // Get The Main Content Node To Add It Into Observer Watch
    function getMainContentNode() {
        var target = document.getElementById('mainContent');

        if (target) {
            observeDOM(target);
        } else {
            setTimeout(getMainContentNode, 1000);
        }
    }

    // Get The Main Feed Node (Quora Spaces) To Add It Into Observer Watch
    function getMainFeedNode() {
        var target = document.querySelector('.dom_annotate_multifeed_tribe_top_items');
        var target2 = document.querySelector('.dom_annotate_multifeed_tribe_page');

        if (target) {
            observeDOM(target);
        } else if (target2) {
            observeDOM(target2);
        } else {
            setTimeout(getMainFeedNode, 5000);
        }
    }

    // Get Global Setting
    function getGlobalSetting(settingName) {
        return GM_getValue(settingName, globalDefaults[settingName]);
    }

    // Set Global Setting
    function setGlobalSetting(settingName, settingValue) {
        GM_setValue(settingName, settingValue);
        // Update Session Setting
        setSessionSetting(settingName, settingValue);
    }

    // Get Session Setting
    function getSessionSetting(settingName) {
        switch (settingName) {
            case 'autoUnblur':
                // Don not auto unblur images if the global setting is false
                return getGlobalSetting('autoUnblur') ? sessionSettings[settingName] : false;
            default:
                return sessionSettings[settingName];
        }
    }

    // Set Session Setting
    function setSessionSetting(settingName, settingValue) {
        sessionSettings[settingName] = settingValue;
    }

    /// ---- GLOBAL VARIABLES ---- ///

    // Define Mouse Click Event
    const clickEvent = new MouseEvent("click", {
        "bubbles": true,
        "cancelable": false
    });

    // Define Global Defaluts
    const globalDefaults = {
        autoUnblur: true,
        autoExpand: false,
    }

    // Define Session Settings
    var sessionSettings = {
        autoUnblur: getGlobalSetting('autoUnblur'),
        autoExpand: getGlobalSetting('autoExpand'),
    }

    /// ---- LISTENERS ---- ///

    // Listener To Listen To Keypresses Events (Shortcuts to utilities)
    document.addEventListener("keydown", function (zEvent) {
        // Expand Posts
        if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "e") {
            expandPosts();
        }
        // Unblur Images
        if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "b") {
            removeBlur();
        }
        // Blur Images
        if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "r") {
            addBlur();
        }
    });

    /// ---- MAIN SCRIPT ---- ///

    // Try To Get Target Node Into Observer Watch
    getMainContentNode();
    getMainFeedNode();
})();
