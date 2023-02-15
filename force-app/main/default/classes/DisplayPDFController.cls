public with sharing class DisplayPDFController {

    public String displayText {get; set;}
    public String displayText2 {get; set;}
    public String renderAs { get; set; }
    public DataForPDFWrapper wrp {get; set;}
    public DisplayPDFController() {
        String inputText = (Apexpages.currentPage().getParameters().get('displayText'));
        if(inputText != null) {
            displayText = inputText;
            DataForPDFWrapper wrapper = (DataForPDFWrapper)(JSON.deserialize(displayText, DataForPDFWrapper.class));
            wrp = wrapper;            
        }
    }

    @AuraEnabled
    public static Attachment generatePDF(String txtValue1){
        DataForPDFWrapper wrapper = (DataForPDFWrapper)(JSON.deserialize(txtValue1, DataForPDFWrapper.class));
        Pagereference pg = Page.renderAsPDF;
        pg.getParameters().put('displayText', txtValue1);
        Attachment objAttachment = new Attachment();            
        objAttachment.Name = wrapper.items[0].Proposal__r.Name + '.pdf';
        objAttachment.ParentId = wrapper.contactData[0].ContactId;
        Blob b = pg.getContentAsPdf();
        objAttachment.Body = b;
        objAttachment.IsPrivate = false;
        insert objAttachment;

        Messaging.SingleEmailMessage semail = new Messaging.SingleEmailMessage();
        Messaging.EmailFileAttachment attach = new Messaging.EmailFileAttachment();
        attach.setFileName(wrapper.items[0].Proposal__r.Name + '.pdf');
        attach.setBody(b);
        semail.setSubject('Proposal Details for ' + wrapper.contactData[0].Contact.Name);
        semail.setToAddresses(new List<String>{wrapper.contactData[0].Contact.Email});
        semail.setPlainTextBody('Please find the attached proposal details'); //TODO: https://salesforce.stackexchange.com/questions/180980/how-to-send-an-email-template-via-apex
        semail.setFileAttachments(new Messaging.EmailFileAttachment[]{attach});
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{semail});
        Proposal__c propToUpdate = [SELECT Id, Status__c, Attached_Proposal_Id__c FROM Proposal__c WHERE Id =: wrapper.items[0].Proposal__r.Id];
        propToUpdate.Status__c = 'Send';
        propToUpdate.Attached_Proposal_Id__c = objAttachment.Id;
        update propToUpdate;
        return objAttachment;
    }

    @AuraEnabled(cacheable=true)
    public static DataForPDFWrapper getDataForPDF(String oppId, String propId){
        DataForPDFWrapper wrapper = new DataForPDFWrapper();
        try {            
            wrapper.contactData = [SELECT 
                ContactId, 
                Contact.Email, 
                Contact.Name, 
                Contact.MailingStreet, 
                Contact.MailingCity, 
                Contact.MailingState, 
                Contact.MailingPostalCode, 
                Contact.MailingCountry 
                FROM OpportunityContactRole WHERE Opportunity.Id=:oppId AND IsPrimary=true];

            wrapper.accountData = [SELECT Id, Name, Account.Name FROM Opportunity WHERE Id=:oppId];
            wrapper.items = [SELECT Id, Name, Quantity__c, Total_Price__c, Proposal__r.Name FROM Equipment_Item__c where Proposal__c =:propId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return wrapper;
    }

    public PageReference rerenderPage() {
        renderAs = 'PDF';
        return null;
    }
}