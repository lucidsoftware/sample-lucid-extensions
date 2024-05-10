import { EditorClient, JsonSerializable, Modal } from "lucid-extension-sdk";

export class RentACarModal extends Modal {
  private static icon = "https://lucid.app/favicon.ico";

  constructor(client: EditorClient) {
    super(client, {
      title: "Rental Car Manager",
      url: "angular/index.html",
      width: 800,
      height: 600,
    });
  }

  protected async messageFromFrame(message: JsonSerializable): Promise<void> {}
}
