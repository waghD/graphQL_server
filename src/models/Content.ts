import {DBContent} from './interfaces';

export class Content implements Content {
    private id: number;
    label: string;    
    contentType: "text" | "imageLink" | "pdfLink" | 'externalLink';
    text: string;
    src: string;

    constructor(db: DBContent){
        this.id = db.contentId;
        this.label = db.label;
        this.contentType = (db.contentType === 'text' || db.contentType === 'imageLink' || db.contentType === 'pdfLink' || db.contentType === 'externalLink') ? db.contentType : 'text';
        this.text = db.text;
        this.src = db.src;
    }

    get contentId(): number {
        return this.id;
    }

}