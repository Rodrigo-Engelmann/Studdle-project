export class RouterButton {
    buttonText: string;
    buttonRoute: string;
    sideTitle: string | undefined;
    sideSubtitle: string | undefined;

    constructor(buttonText: string, buttonRoute: string, sideTitle: string | undefined, sideSubtitle: string | undefined) {
        this.buttonText = buttonText;
        this.buttonRoute = buttonRoute;
        this.sideTitle = sideTitle;
        this.sideSubtitle = sideSubtitle;
    }
}