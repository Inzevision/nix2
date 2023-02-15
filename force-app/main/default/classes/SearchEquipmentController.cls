public with sharing class SearchEquipmentController {
    
    @AuraEnabled(cacheable=true)
    public static List<Equipment__c> getEquipments(String cId, String eName){
        String s = '%' + eName + '%';
        List<Equipment__c> result = new List<Equipment__c>();

        try {
            result = [SELECT Id, Name, Equipment_Categoty__c, Cost__c FROM Equipment__c WHERE Equipment_Categoty__c = :cId AND Name LIKE :s];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return result;
    }
}