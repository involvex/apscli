/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const assert = require('assert');
const { createDelay } = require('../utils/delay');

describe('createDelay', () => {
    it('should delay for the specified amount of time', async () => {
        const delayTime = 100; // Use a small delay for testing
        const startTime = Date.now();
        await createDelay(delayTime);
        const endTime = Date.now();
        const actualDelay = endTime - startTime;

        // Allow for some tolerance in delay
        assert.ok(
            actualDelay >= delayTime,
            `Expected delay to be at least ${delayTime}ms, but was ${actualDelay}ms`
        );
        assert.ok(
            actualDelay < delayTime + 50,
            `Expected delay to be less than ${delayTime + 50}ms, but was ${actualDelay}ms`
        );
    }).timeout(2000); // Set a timeout for the test to prevent it from hanging
});
