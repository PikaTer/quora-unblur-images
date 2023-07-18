// ==UserScript==
// @name         Quora Unblur Images
// @namespace    quora-unblur-images
// @version      0.1
// @description  Unblur quora images and other utilities
// @author       PikaTer
// @match        https://*.quora.com/*
// @license
// ==/UserScript==

(function() {
    'use strict';

    // Remove Image Blur
    function removeBlur() {
        const images = document.querySelectorAll('.q-box');

        images.forEach(image => {
            image.style.filter = 'none'
        });
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
                    removeBlur();
                }
            }
        };

        if( MutationObserver ){
            const mutationObserver = new MutationObserver(callback);

            mutationObserver.observe( targetNode, config);
        }
        else if( window.addEventListener ){
            targetNode.addEventListener('DOMNodeInserted', callback, false)
            targetNode.addEventListener('DOMNodeRemoved', callback, false)
        }

        removeBlur();
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

        if (target) {
            observeDOM(target);
        } else {
            setTimeout(getMainFeedNode, 5000);
        }
    }

    // Define Mouse Click Event
    const clickEvent = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    });

    // Try To Get Target Node Into Observer Watch
    getMainContentNode();
    getMainFeedNode();

    // Listener To Listen To Keypresses Events (Shortcuts to utilities)
    document.addEventListener ("keydown", function (zEvent) {
        // Expand Posts
        if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "e") {
            expandPosts();
        }
        // Unblur Images
        if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "b") {
            removeBlur();
        }
    } );
})();
