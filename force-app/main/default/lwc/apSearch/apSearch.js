import { LightningElement, api } from 'lwc';
import getEquipments from '@salesforce/apex/SearchEquipmentController.getEquipments';

export default class ApSearch extends LightningElement {

  searchText;
  category;
  categoryName;
  data;  
    
    //HANDLE EVENTS
  handleCategory(event){
    this.category = event.detail.category[0].Id;
    this.categoryName = event.detail.category[0].Name;
  }

  handleSearchText(event){
    this.searchText = event.detail.stext;
  }

  searchEquipment(){
    getEquipments({cId: this.category, eName: this.searchText})
    .then(data => {
        this.data = data;
        let categoryName;
        let outboundData = data.map(item => {
          categoryName = this.categoryName;
          return {...item, categoryName};
        })
        const setData = new CustomEvent('setdata', {
          detail: { payload: outboundData }
        });
        this.dispatchEvent(setData);
    })
    .catch(error => {
        console.log(error);
    })
  }


  
}