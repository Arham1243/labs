import { describe, expect, it, vi } from 'vitest';
import { ability, updateAbility } from '@/plugins/ability';
import { PureAbility } from '@casl/ability';

describe('Ability Plugin', () => {
    it('exports an instance of PureAbility', () => {
        expect(ability).toBeInstanceOf(PureAbility);
    });

    it('updateAbility updates the ability instance with mapped permissions', () => {
        // Spy on the ability.update method
        const updateSpy = vi.spyOn(ability, 'update');

        // Call updateAbility with some permissions
        const permissions = ['read', 'write', 'delete'];
        updateAbility(permissions);

        // Check that ability.update was called with the correct rules
        const expectedRules = [
            { action: 'read' },
            { action: 'write' },
            { action: 'delete' }
        ];

        expect(updateSpy).toHaveBeenCalledWith(expectedRules);

        // Restore the original method
        updateSpy.mockRestore();
    });
});
