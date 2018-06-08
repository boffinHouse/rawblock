export const regEscape = /[-/\\^$*+?.()|[\]{}]/g;

export default function escapeRegExp(str) {
    return str.replace(regEscape, '\\$&');
}
