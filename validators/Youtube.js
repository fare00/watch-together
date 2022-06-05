module.exports = class Youtube {
    static key = 'yt';
    static pattern = /youtube\.com\/(?:watch\?v=|embed\/)(.{11})/gi;
    static check(url) {
        this.pattern.lastIndex = 0;
        const match = this.pattern.exec(url);

        if(match) return { url: match[1], key: this.key };
        return false;
    }
}