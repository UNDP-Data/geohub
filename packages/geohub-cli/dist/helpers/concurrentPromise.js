"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concurrentPromise = void 0;
const concurrentPromise = async (promises, concurrency) => {
    const results = [];
    let currentIndex = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const chunks = promises.slice(currentIndex, currentIndex + concurrency);
        if (chunks.length === 0) {
            break;
        }
        Array.prototype.push.apply(results, await Promise.all(chunks));
        currentIndex += concurrency;
    }
    return results;
};
exports.concurrentPromise = concurrentPromise;
