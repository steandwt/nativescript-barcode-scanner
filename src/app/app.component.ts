import { Component, OnInit } from "@angular/core";
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { ItemEventData } from "tns-core-modules/ui/list-view";
import * as email from "nativescript-email";
import { throwError } from 'rxjs'; 

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

    barcodeList: IBarcode[] = [];
    dialogs = require("tns-core-modules/ui/dialogs");
    currentActiveBarcode: string;

    a: boolean = false

    ngOnInit(): void {

    }

    constructor(private barcodeScanner: BarcodeScanner) {
    }

    public onScan() {

        this.barcodeScanner.scan({
            formats: "QR_CODE, EAN_13, EAN-8",
            showFlipCameraButton: false,
            preferFrontCamera: false,
            showTorchButton: true,
            beepOnScan: true,
            torchOn: false,
            resultDisplayDuration: 0,
        }).then((result) => {

            let duplicate = this.barcodeList.find(x => x.barcode == result.text);

            if (!duplicate) {
                this.barcodeList.push({ barcode: result.text });
            }
            
        }, (errorMessage) => {
            alert("Error while scanning " + errorMessage);
            });
    }

    public send() {

        email.available().then((available: boolean) => {
            if (available) {

                let body = ""; 

                this.barcodeList.forEach(x => {
                    body = body + "\n" + x.barcode; 
                });

                email.compose({
                    subject: "",
                    body: body
                });

            } else {
                alert("Unable to open email application. Please install one.");
            }
        });
    }

    onItemTap(args: ItemEventData) {
        this.currentActiveBarcode = this.barcodeList[args.index].barcode;

        this.dialogs.confirm({
            title: "Remove Barcode",
            message: this.currentActiveBarcode,
            okButtonText: "Remove",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result) {
                this.barcodeList.splice(args.index, 1);
            }
        });
    }
}

export interface IBarcode {
    barcode: string;
}


