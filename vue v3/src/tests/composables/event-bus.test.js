import { describe, expect, it } from 'vitest';
import useEventsBus from '@/composables/event-bus';
import { nextTick } from 'vue';

describe('useEventsBus', () => {
    it('creates an event bus with the expected properties', () => {
        const eventBus = useEventsBus();

        // Check that the event bus has the expected properties
        expect(eventBus).toBeDefined();
        expect(typeof eventBus.emit).toBe('function');
        expect(eventBus.bus).toBeDefined();
        expect(eventBus.bus.value).toBeInstanceOf(Map);
        expect(eventBus.bus.value.size).toBe(0);
    });

    it('emits events and stores them in the bus', async () => {
        const eventBus = useEventsBus();
        const eventName = 'test-event';
        const eventData = { id: 1, name: 'Test' };

        // Emit an event
        eventBus.emit(eventName, eventData);

        // Wait for Vue's reactivity to update
        await nextTick();

        // Check that the event was stored in the bus
        expect(eventBus.bus.value.has(eventName)).toBe(true);
        expect(eventBus.bus.value.get(eventName)).toEqual([eventData]);
    });

    it('can emit multiple events with different data', async () => {
        const eventBus = useEventsBus();

        // Emit first event
        eventBus.emit('event1', 'data1');

        // Emit second event
        eventBus.emit('event2', 'data2');

        // Wait for Vue's reactivity to update
        await nextTick();

        // Check that both events were stored
        expect(eventBus.bus.value.has('event1')).toBe(true);
        expect(eventBus.bus.value.get('event1')).toEqual(['data1']);

        expect(eventBus.bus.value.has('event2')).toBe(true);
        expect(eventBus.bus.value.get('event2')).toEqual(['data2']);
    });

    it('can emit events with multiple arguments', async () => {
        const eventBus = useEventsBus();
        const eventName = 'multi-arg-event';

        // Emit an event with multiple arguments
        eventBus.emit(eventName, 'arg1', 'arg2', 'arg3');

        // Wait for Vue's reactivity to update
        await nextTick();

        // Check that all arguments were stored
        expect(eventBus.bus.value.has(eventName)).toBe(true);
        expect(eventBus.bus.value.get(eventName)).toEqual([
            'arg1',
            'arg2',
            'arg3'
        ]);
    });

    it('overwrites previous event data when emitting the same event', async () => {
        const eventBus = useEventsBus();
        const eventName = 'overwrite-event';

        // Emit an event
        eventBus.emit(eventName, 'initial-data');

        // Wait for Vue's reactivity to update
        await nextTick();

        // Check initial data
        expect(eventBus.bus.value.get(eventName)).toEqual(['initial-data']);

        // Emit the same event with different data
        eventBus.emit(eventName, 'new-data');

        // Wait for Vue's reactivity to update
        await nextTick();

        // Check that the data was overwritten
        expect(eventBus.bus.value.get(eventName)).toEqual(['new-data']);
    });
});
