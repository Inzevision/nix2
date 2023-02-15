import { LightningElement } from 'lwc';

export default class ApInputForSearch extends LightningElement {
    handleChangeSearch(event){
        const setSearchEvent = new CustomEvent('stext', {
                detail: { stext: event.target.value }
            }            
        );
        this.dispatchEvent(setSearchEvent);
      }
}