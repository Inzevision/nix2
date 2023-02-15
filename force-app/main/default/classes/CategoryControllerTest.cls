@IsTest
public class CategoryControllerTest {
    
    @IsTest
    static void runPositiveTestCases() {

        final Integer singleRecordCount = 1;
        String profile = 'Demand';
        User u1 = [SELECT Id, Name FROM User WHERE ProfileId IN (SELECT Id FROM Profile WHERE Name=:profile)];

        System.runAs(u1){
            Integer categoryCount = 0;
            //Validate single insert
            Equipment_Categoty__c category = new Equipment_Categoty__c(Name = 'test category', Margin__c = 5);
            insert category;            

            List<Equipment_Categoty__c> categoriesSelect = CategoryController.getGategories();
            for (Equipment_Categoty__c variable : categoriesSelect) {
                if(variable.Name == 'test category' && variable.Margin__c == 5){
                    categoryCount++;
                }
            }

            Assert.isTrue(categoryCount == 1, 'Insert 1 record, Select 1 record');
            //reset counter before next test
            categoryCount = 0;

        
            //Bulk validation
            List<Equipment_Categoty__c> categories = new List<Equipment_Categoty__c>();
            for (Integer i = 0; i < 200; i++) {
                categories.add(new Equipment_Categoty__c(Name = 'test category ' + i, Margin__c = 5));
            }
            insert categories;
            Pattern pat = Pattern.compile('^test category.*');
            List<Equipment_Categoty__c> categories2Select = CategoryController.getGategories();
            for (Equipment_Categoty__c variable : categories2Select) {
                if((variable.Margin__c == 5) && pat.matcher(variable.Name).matches()){
                    categoryCount++;
                }
            } 
            
            Assert.isTrue(categoryCount == (200+1), 'Insert 200 record, Select '+categoryCount+' record (one from previous test)');
        }
    }
}