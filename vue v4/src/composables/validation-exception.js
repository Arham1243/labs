export default class ValidationException extends Error {
    constructor(field, message) {
        super(message);
        this.name = 'ValidationException';
        this.response = {
            data: {
                errors: {
                    [field]: [message]
                },
                message
            }
        };
    }
}
