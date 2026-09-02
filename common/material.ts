export class material {
    id: number;
    main_image: string;
    title: string;
    summary: string;
    tags: string;
    sequence: number;

    constructor() {
        this.id = -1;
        this.main_image = '';
        this.title = '';
        this.summary = '';
        this.tags = '';
        this.sequence = -1;
    }
}

