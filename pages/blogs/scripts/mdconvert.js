const markdown = document.getElementById('markdown');
const output = document.getElementById('output');

function convertMarkdown(pathname) {

    const path = filePath.value.trim();
    if (!path || !path.filePath.value.endsWith('.md')) { // checks potential injection
        return;
    }

    try {
        const data = await window.fs.readFile(path, { encoding: 'utf8' });
        markdown.value = data;

    } catch (error) {
        console.error('File read error:', error);
    }

    let html = text;
    
    // Headers (h1-h6)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Images
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Unordered lists
    html = html.replace(/^\-\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Line breaks and paragraphs
    html = html.split('\n\n').map(para => {
        if (para.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
            return para;
        }
        return para.trim() ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '';
    }).join('\n');

    return html;
}