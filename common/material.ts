export class material {
    id: number;
    main_image: string;
    title: string;
    summary: string;
    main_content: string;
    tags: string;
    sequence: number;
    link: string;
    createdDate: string;
    last_update: string;

    constructor() {
        this.id = -1;
        this.main_image = '';
        this.title = '';
        this.summary = '';
        this.main_content = '';
        this.tags = '';
        this.sequence = -1;
        this.link = '';
        this.createdDate = '';
        this.last_update = '';
    }
}

