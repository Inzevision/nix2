import { LightningElement, wire, track, api } from 'lwc';
import getProposal from '@salesforce/apex/ProposalsController.getProposal';
import { deleteRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import Id from '@salesforce/user/Id';
import ProfileId from '@salesforce/user/ProfileId';
import ProfileName from '@salesforce/schema/User.Profile.Name';

const COLUMNS = [
        { label: 'Name', fieldName: 'proposalURL', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'Name'
                }
            }
        },
        { label: 'Total Price', fieldName: 'Total_Price__c'},
        { label: 'Status', fieldName: 'Status__c'},
        { label: 'Attachment', fieldName: 'attachmentURL', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'Name'
                }
        }}
    ];
const userId = Id;

export default class ProposalsList extends LightningElement {
    
    columns = COLUMNS;
    refreshTable;
    userProfileName;

    constructor() {
        super();
        this.columns = this.columns.concat([
            {type: 'action', typeAttributes: {rowActions: this.getRowActions}},
        ]);
    }

    @api recordId;
    @track proposals = [];

    @wire(getProposal, {oppId: '$recordId'})
    wiredAccounts(response){
        this.refreshTable = response;
        const { data, error } = response;        
        if(data){
            let proposalURL;
            let attachmentURL;
            this.proposals = data.map((item, index) => {
                proposalURL = `/${item.Id}`;
                if(item.Attached_Proposal_Id__c){
                    attachmentURL = `/${item.Attached_Proposal_Id__c}`;
                    return {                    
                        ...item, proposalURL, attachmentURL
                    }
                }else{
                    return {                    
                        ...item, proposalURL
                    }
                }                
            });
        }
        else if(error){
            this.error = error;
            this.proposals = undefined;
        }
    }

    @wire(getRecord, { recordId: Id, fields: [ProfileName] })
    userDetails({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            if (data.fields.Profile.value != null) {
                console.log(data.fields.Profile.value);
                this.userProfileName = data.fields.Profile.value.fields.Name.value;
            }
        }
    }

    getRowActions(row, doneCallback){
        const actions = [
            {label: 'Delete', name: 'del_record', disabled: true},
            {label: 'Send', name: 'send', disabled: true}
        ];
        let act = [];
        if(row['Status__c'] === 'Draft'){
            actions.forEach((item, index) => {
                item.disabled = false;
                act.push(item);
                console.log(ProfileId);
            });
        }else{
            act = actions;
        }
        
        doneCallback(act);
    }

   handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            case 'del_record':
                deleteRecord(row.Id)
                    .then(() => {
                        this.refreshProposalList();
                    })
                    .catch(error => {
                        console.log('fail del record');
                    });
                break;
            case 'send':
                const modal = this.template.querySelector("c-ap-show-pdf-preview");
                modal.show();
                modal.setData(row);
                break;
            default:
        }
    }

    handleShowModal() {
        const modal = this.template.querySelector("c-add-proposal");
        modal.show();
    }

    get showAddButton(){
        return this.userProfileName !== 'Supply';
    }
    
    @api  
    refreshProposalList(){
        refreshApex(this.refreshTable);
        console.log('refreshed');
    }
}