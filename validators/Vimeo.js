module.exports = class Facebook {
    static key = 'vm';
    static pattern = /vimeo\.com(?:\/|\/video\/)(\d+)/gi;
    static check = (url) => {
        this.pattern.lastIndex = 0;
        const match = this.pattern.exec(url);

        if(match) return { url: match[1], key: this.key };
        return false;
    };
}