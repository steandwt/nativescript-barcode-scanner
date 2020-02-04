import { Component, OnInit } from "@angular/core";
import { BarcodeScanner } from "nativescript-barcodescanner";
import * as email from "nativescript-email";
import * as camera from "nativescript-camera";
import { ImageSource } from "tns-core-modules/image-source";
import { knownFolders, path } from "tns-core-modules/file-system";

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
    barcodeList: IBarcode[] = [];
    dialogs = require("tns-core-modules/ui/dialogs");
    attachments: any[];

    ngOnInit(): void {}

    constructor(private barcodeScanner: BarcodeScanner) {}

    public onScan() {
        this.barcodeScanner
            .scan({
                formats: "QR_CODE, EAN_13, EAN-8",
                showFlipCameraButton: false,
                preferFrontCamera: false,
                showTorchButton: true,
                beepOnScan: true,
                torchOn: false,
                resultDisplayDuration: 0
            })
            .then(
                result => {
                    let duplicate = this.barcodeList.find(
                        x => x.Barcode == result.text
                    );

                    if (!duplicate) {
                        this.barcodeList.push({
                            Barcode: result.text,
                            ImagePath: null
                        });
                    }
                },
                errorMessage => {
                    console.log("Error while scanning " + errorMessage);
                }
            );
    }

    public send() {
        this.attachments = [];

        this.barcodeList.forEach(x => {
            if (x.ImagePath != null) {
                this.attachments.push({
                    fileName: x.Barcode + ".jpg",
                    mimeType: "image/jpg",
                    path: x.ImagePath
                });
            }
        });

        let body = "";

        this.barcodeList.forEach(x => {
            body = body + "\n" + x.Barcode;
        });

        let emailOptions: email.ComposeOptions = <email.ComposeOptions>{};
        emailOptions.body = body;
        emailOptions.subject = "";

        if (this.attachments.length > 0) {
            emailOptions.attachments = this.attachments;
        }

        email.available().then((available: boolean) => {
            if (available) {
                email.compose(emailOptions);
            } else {
                alert("Unable to open email application. Please install one.");
            }
        });
    }

    deleteItem(index: number) {
        this.dialogs
            .confirm({
                title: "Remove Barcode",
                message: this.barcodeList[index].Barcode,
                okButtonText: "Remove",
                cancelButtonText: "Cancel"
            })
            .then(result => {
                if (result) {
                    this.barcodeList.splice(index, 1);
                }
            });
    }

    addImage(index: number) {
        camera.requestPermissions().then(
            () => {
                camera
                    .takePicture()
                    .then(imageAsset => {
                        ImageSource.fromAsset(imageAsset).then(
                            (imageSource: ImageSource) => {
                                var date = new Date();
                                var dateTime = date.getTime();

                                const folderPath: string = knownFolders.documents()
                                    .path;
                                const fileName: string =
                                    this.barcodeList[index].Barcode +
                                    "_" +
                                    dateTime +
                                    ".jpg";

                                const filePath: string = path.join(
                                    folderPath,
                                    fileName
                                );
                                const saved: boolean = imageSource.saveToFile(
                                    filePath,
                                    "jpg"
                                );

                                if (saved) {
                                    this.barcodeList[
                                        index
                                    ].ImagePath = filePath;
                                }
                            }
                        );
                    })
                    .catch(function(err) {
                        alert("Error -> " + err.message);
                    });
            },
            function failure() {
                alert("Permission request failed");
            }
        );
    }

    deleteImage(index: number) {
        this.dialogs
            .confirm({
                title: "Remove Image",
                message: "Are you sure you want to remove this image?",
                okButtonText: "Remove",
                cancelButtonText: "Cancel"
            })
            .then((result: boolean) => {
                if (result) {
                    this.barcodeList[index].ImagePath = null;
                }
            });
    }
}

interface IBarcode {
    Barcode: string;
    ImagePath: string;
}
