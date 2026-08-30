export class video {
    id: number;
    link: string;
    video_url: string;
    description: string;
    title: string;
    thumbnail: string;
    createdDate: string;
    last_update: string;
    sequence: number;
    video_statuses: number;
    comments: number;
    task_contents: number;

    constructor() {
        this.id = 0;
        this.link = '';
        this.video_url = '';
        this.description = '';
        this.title = '';
        this.thumbnail = '';
        this.createdDate = '';
        this.last_update = '';
        this.sequence = 0;
        this.video_statuses = 0;
        this.comments = 0;
        this.task_contents = 0;
    }
}

