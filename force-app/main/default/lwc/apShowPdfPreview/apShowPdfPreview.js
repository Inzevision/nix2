import { LightningElement, api, wire } from 'lwc';
import generatePDF from '@salesforce/apex/DisplayPDFController.generatePDF';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDataForPDF from '@salesforce/apex/DisplayPDFController.getDataForPDF';


export default class ApShowPdfPreview extends LightningElement {
    showModal = false;
    showPdf = false;
    allowedFormats =  ['font', 'size', 'bold', 'italic', 'underline', 'strike',
    'list', 'indent', 'align', 'link', 'image', 'clean', 'table', 'header', 'color',
    'background','code','code-block'];

    paramToPDF = {};    
    attachment; //will use for link to attach proposal
    
    get url() {
        return "/apex/renderAsPdf?displayText=" + this.paramToPDF;
    }

    @api show() {
        this.showModal = true;
    }

    @api showPdf() {
        this.showPdf = false;
    }

    handleDialogClose() {
        this.showModal = false;
    }

    //execute afrer user select Send in dropdown row action
    @api setData(data){
        let _data = data;
        console.log(data);
        
        getDataForPDF({oppId: _data.Opportunity__c, propId: _data.Id})
        .then(responce => {
            this.paramToPDF = JSON.stringify(responce);
        })
        .then(responce => {
            this.showPdf = true;
        })
    }

    saveAsPdf(){
        generatePDF({txtValue1: this.paramToPDF})
        .then((result)=>{
            this.attachment = result;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Send email successfully',
                        //message: 'PDF generated successfully with Id:' + this.attachment.Id,
                        variant: 'success',
                    }),
                );
        })
        .then(() => {this.handleDialogClose()})
        .then(() => {
            this.dispatchEvent(
                new CustomEvent('needupdate')
            );
        })
        .catch(error=>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating Attachment record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        })
    }
}