public with sharing class CategoryController {

    @AuraEnabled(cacheable=true)
    public static List<Equipment_Categoty__c> getGategories(){
        return [SELECT Id, Name, Margin__c FROM Equipment_Categoty__c];
    }

}