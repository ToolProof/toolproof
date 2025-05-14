
export const extractNodeSpec = (fileContent: string): string | null => {
    const start = fileContent.indexOf('static nodeSpec: NodeSpec = {');
    if (start === -1) return null;

    let braceCount = 0;
    let inString = false;
    let escape = false;
    let specContent = '';

    for (let i = start; i < fileContent.length; i++) {
        const char = fileContent[i];

        if (char === '"' || char === "'") {
            if (!escape) inString = !inString;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }

        specContent += char;

        if (braceCount === 0 && specContent.trim().endsWith('};')) {
            return specContent;
        }

        escape = char === '\\' && !escape;
    }

    return null; // Failed to extract properly
}