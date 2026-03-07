import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StorageManager storage = new StorageManager();
        List<Transaction> history = storage.loadTransactions();

        SmartAnalyzer analyzer = new SmartAnalyzer();
        
        double soldCurent = 2000.0; 
        for(Transaction t : history){
            if(t.isIncome())
                soldCurent += t.getAmount();
            else
                soldCurent -= t.getAmount();
        }

        System.out.println("=== SmartMoney Management ===");

        while (true) {
            System.out.println("\n1. Adaugă Cheltuială");
            System.out.println("2. Vezi Analiză Obiceiuri");
            System.out.println("3. Ieșire");
            System.out.print("Alege o opțiune: ");
            
            if (!scanner.hasNextInt()) {
                System.out.println(" Introdu un număr valid!");
                scanner.next(); 
                continue;
            }

            int optiune = scanner.nextInt();
            scanner.nextLine(); 

            if (optiune == 1) {
                try {
                    System.out.print("Nume Magazin/Descriere (ex: Lidl, OMV, Zara): ");
                    String desc = scanner.nextLine();

                    Merchant m = MerchantDatabase.findMerchant(desc);
                    String categorieSugerata;
                    
                    if (m != null) {
                        System.out.println(" Magazin recunoscut: " + m.getName());
                        System.out.println(" Produse populare: " + m.getProducts());
                        categorieSugerata = m.getCategory();
                    } else {
                        categorieSugerata = "Altele";
                    }

                    System.out.print("Categorie [" + categorieSugerata + "]. Apasă Enter sau scrie alta: ");
                    String catInput = scanner.nextLine();
                    String catFinala = catInput.isEmpty() ? categorieSugerata : catInput;

                    System.out.print("Sumă (RON): ");
                    double suma = scanner.nextDouble();
                    scanner.nextLine(); 

                    Transaction t = new Transaction(suma, catFinala, desc, false);
                    
                    history.add(t);
                    storage.saveTransaction(t);

                    soldCurent -= suma;
                    System.out.println("Tranzacție salvată! Sold nou: " + soldCurent + " RON");

                } catch (Exception e) {
                    System.out.println(" Eroare la introducerea datelor. Încearcă din nou.");
                    scanner.nextLine();
                }
            }
            else if (optiune == 2) {
                if (history.isEmpty()) {
                    System.out.println(" Nu ai destule date pentru analiză.");
                } else {
                    analyzer.predictFuture(soldCurent, history);
                }
            } 
            else if (optiune == 3) {
                System.out.println(" La revedere!");
                break; 
            }
        } 
        
        scanner.close();
    }
}