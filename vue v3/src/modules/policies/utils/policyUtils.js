export function maskPolicyNumber(policyNumber) {
    const prefixStartIndex = policyNumber.includes('POL-') ? 4 : 3;
    const prefix = policyNumber.substr(prefixStartIndex, 2);
    const suffix = policyNumber.slice(-2);
    const maskedLength = Math.max(
        0,
        policyNumber.length - prefix.length - suffix.length - prefixStartIndex
    );
    const maskedPart = '*'.repeat(maskedLength);

    return prefix + maskedPart + suffix;
}
