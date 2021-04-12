// This is a code example found here:
//   https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_stores
// Juding from the commit history
//   https://github.com/mdn/content/commits/main/files/en-us/learn/tools_and_testing/client-side_javascript_frameworks/svelte_stores/index.html
// this content was added clearly added after Aug 20th 2010.
// Thus, as is explained here
//  https://developer.mozilla.org/en-US/docs/MDN/About#copyrights_and_licenses
// it should be in the public domain (CC0) and require no special attribution.
// My sincer apologies if I got this wrong.

import { writable } from 'svelte/store';

export const localStore = (key, initial) => {                 // receives the key of the local storage and an initial value

  const toString = (value) => JSON.stringify(value, null, 2)  // helper function
  const toObj = JSON.parse                                    // helper function

  if (localStorage.getItem(key) === null) {                   // item not present in local storage
    localStorage.setItem(key, toString(initial))              // initialize local storage with initial value
  }

  const saved = toObj(localStorage.getItem(key))              // convert to object

  const { subscribe, set, update } = writable(saved)          // create the underlying writable store

  return {
    subscribe,
    set: (value) => {
      localStorage.setItem(key, toString(value))              // save also to local storage as a string
      return set(value)
    },
    update
  }
};
