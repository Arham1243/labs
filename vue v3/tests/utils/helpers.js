export const componentExists = async (wrapper, testId) => {
    try {
        const element = wrapper.find(`[data-testid="${testId}"]`);
        expect(element.exists()).toBe(true);
    } catch (error) {
        console.error(`Component with '${testId}' does not exist`, error);
        throw error;
    }
};
