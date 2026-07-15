export class Comment {
    id: number;
    user_id: number;
    text: string;
    reply_to: number;
    tags: string;


    constructor() {
        this.id = -1;
        this.user_id = -1;
        this.text = '';
        this.reply_to = -1;
        this.tags = '';
    }
}

