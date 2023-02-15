public with sharing class ProposalWrapper {
    
    @AuraEnabled
    public String oppId{get; set;}
    @AuraEnabled
    public String fKey{get; set;}
    @AuraEnabled
    public List<Equipment_Item__c> items{get; set;}

}