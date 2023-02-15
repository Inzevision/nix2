import { LightningElement, api, track } from 'lwc';
import { getRecordNotifyChange } from "lightning/uiRecordApi";

const COLUMNS = [
    {label: 'Category', fieldName: 'categoryName'},
    {label: 'Name', fieldName: 'Name'},
    {label: 'Amount', fieldName: 'Cost__c', type: 'currency'},
    {label: 'Quantity', fieldName: 'Quantity__c', type: 'number', typeAttributes: {
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        step: 1,
        }, 
    editable: true},
]

export default class ApEquipmentList extends LightningElement {
    @track searchData = [];
    tmpData;
    selectedRows = [];
    @track errors = {};
    draftValues = new Map();
    @track columns = COLUMNS;
    @track hasRendered = true;
    btnEnable = false;
    noErr = true;
    

    get data(){
        return this.searchData;
    }

    @api
    changeMessages(param){
        let Quantity__c, columnIndex;
        this.errors.rows = {};
        this.searchData = param.map((item, index) => {
            Quantity__c = 1;
            columnIndex = 'row-' + index;
            return { ...item, Quantity__c, columnIndex}
        });
    }

    @api
    getSelectedListItems(){
        let outboundSelectedItems = [];
        this.template.querySelector('lightning-datatable').getSelectedRows().forEach((item, index) => {
            outboundSelectedItems.push(this.searchData.filter(e => e.Name === item.Name)[0]);
        });
        return outboundSelectedItems;
    }

    rowselect(event){
        console.log(JSON.stringify(event.detail.selectedRows));
        if (event.detail.selectedRows.length > 0) {
            this.btnEnable = true;
        } else if (event.detail.selectedRows.length <= 0){
            this.btnEnable = false;
        }
        this.enableAddButton();
    }

    enableAddButton(){
        //errors pereset
        if (this.cellErrorPresent()){
            this.noErr = false;
        }

        //no row select
        if(this.btnEnable == false){
            this.noErr = false;
        }

        //no errors and row select        
        if (this.cellErrorPresent() == false && this.btnEnable){        
            this.noErr = true;
        }
        this.setBtnActive(this.noErr);
    }

    setBtnActive(flag){
        this.dispatchEvent(new CustomEvent('enabebutton',{ 
                detail:{ payload: flag }
        }));
    }

    isRowsSelect(){
        console.log('get rowSelect bool');
        return this.btnEnable;
    }

    cellErrorPresent(){
        if (this.errors !== {} && Object.keys(this.errors.rows).length > 0){
            return true;
        }
        return false;
    }

    cellChange(event){
        this.draftValues.set(event.detail.draftValues[0].id, event.detail.draftValues[0].Quantity__c);
        console.log(event);
        let err = {};
        err.rows = {};
        this.searchData.map(item => {
            this.draftValues.forEach((value, key) => {
                console.log(parseInt(value))
                if(key === item.columnIndex && parseInt(value) > 0){
                    item.Quantity__c = value;
                    if (this.errors !== {} && key in this.errors.rows) {
                        delete this.errors.rows[key];
                    }
                } else if (key === item.columnIndex && parseInt(value) <= 0){
                    item.Quantity__c = 1;
                    err.rows[key] = {title: 'We found an error', messages: ['Enter a valid quantity.'], fieldNames: ['Quantity__c']};
                    this.errors = err;
                }
            });
        return { ...item }
        })   
        this.enableAddButton();
    }
}