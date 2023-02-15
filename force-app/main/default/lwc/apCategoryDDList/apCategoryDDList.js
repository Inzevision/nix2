import { LightningElement, wire } from 'lwc';
import getGategories from '@salesforce/apex/CategoryController.getGategories';

export default class ApCategoryDDList extends LightningElement {

    opt = [];
    rawData = [];

    @wire(getGategories)
    wiredCategory(response){
        const { data, error } = response;
        if(data){
            this.rawData = data;
            this.opt = data.map((item, index) => {
                let label = item.Name;
                let value = item.Name;
                return {
                    label, value
                }
            });
        }else if(error){
            console.log(JSON.stringify(error));
        }
    }

    get options() {
        return this.opt;
    }

    handleChange(event) {
        const setCategoryEvent = new CustomEvent(
            'category', {
                detail: {category: this.rawData.filter(e => e.Name === event.detail.value)}
            }
        );
        this.dispatchEvent(setCategoryEvent);
    }
}