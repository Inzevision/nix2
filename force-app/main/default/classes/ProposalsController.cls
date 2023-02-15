public with sharing class ProposalsController {
    
    @AuraEnabled(cacheable=true)
    public static List<Proposal__c> getProposal(String oppId){
        List<Proposal__c> proposal = [SELECT Id, Name, Status__c, Opportunity__c, Total_Price__c, Attached_Proposal_Id__c FROM Proposal__c WHERE Opportunity__c = :oppId];
        return proposal;
    }

    @AuraEnabled
    public static Boolean createProposal(ProposalWrapper pWrap){
        List<SObject> eItems = new List<SObject>();

        Proposal__c proposalRef = new Proposal__c(ExternalKey__c = pWrap.fKey);
        for (Equipment_Item__c item : pWrap.items) {
            Equipment_Item__c equipment = new Equipment_Item__c(Name = item.Name, Equipment__c = item.Id, Quantity__c = item.Quantity__c, Cost__c = item.Cost__c);
            equipment.Proposal__r = proposalRef;
            eItems.add(equipment);
        }
        Proposal__c proposal = new Proposal__c(Opportunity__c = pWrap.oppId, ExternalKey__c = pWrap.fKey, Status__c = 'Draft');
        eItems.add(0, proposal);
        Database.SaveResult[] results = Database.insert(eItems);
        for (Database.SaveResult result : results) {
            if(result.isSuccess() == false){
                return false;
            }
        }
        return true;
    }
}