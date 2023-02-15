public with sharing class DataForPDFWrapper {
    
    @AuraEnabled
    public List<OpportunityContactRole> contactData{get; set;}
    @AuraEnabled
    public List<Opportunity> accountData{get; set;}
    @AuraEnabled
    public List<Equipment_Item__c> items{get; set;}
    @AuraEnabled
    public Proposal__c proposal{get; set;}
}