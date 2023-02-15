import { LightningElement, api, track } from 'lwc';
import createProposal from '@salesforce/apex/ProposalsController.createProposal';

export default class AddProposal extends LightningElement {

  showModal = false;
  searchResult;
  @api oppRecordId;
  disableAddButton = false;

  @api show() {
    this.showModal = true;
  }

  handleDialogClose() {
    this.showModal = false;
  }

  handleSearchResult(event){
    this.searchResult = event.detail.payload;
    this.template.querySelector('c-ap-equipment-list').changeMessages(event.detail.payload);
  }

  saveClick(event){

    let prWrapper = {
      oppId: this.oppRecordId,
      fKey: this.uniqueId(),
      items: this.template.querySelector('c-ap-equipment-list').getSelectedListItems()
    }

    createProposal({pWrap:prWrapper})
    .then(result => {
      this.dispatchEvent(new CustomEvent('refreslist'));
      this.handleDialogClose();
    })
    .catch(error => console.log(error));
  }

  enableAddButton(event){
    this.disableAddButton = event.detail.payload;
  }

  get disableButton(){
    if(this.disableAddButton) return false;
    return true;
  }

  uniqueId(){
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substring(2);
    return dateString + randomness;
  };
}