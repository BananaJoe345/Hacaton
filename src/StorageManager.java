import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class StorageManager {
    private static final String FILE_NAME = "history.csv";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public void saveTransaction(Transaction t) {
        try (FileWriter fw = new FileWriter(FILE_NAME, true);
             BufferedWriter bw = new BufferedWriter(fw);
             PrintWriter out = new PrintWriter(bw)) {
            
            String dataFormata = t.getTimestamp().format(formatter);
            
            out.println(t.getAmount() + "|" + t.getCategory() + "|" + 
                        t.getDescription() + "|" + dataFormata + "|" + t.isIncome());
            
        } catch (IOException e) {
            System.err.println("Eroare la salvare: " + e.getMessage());
        }
    }

    public List<Transaction> loadTransactions() {
        List<Transaction> history = new ArrayList<>();
        File file = new File(FILE_NAME);
        
        if (!file.exists()) return history;

        try (BufferedReader br = new BufferedReader(new FileReader(FILE_NAME))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                String[] values = line.split("\\|");
                if (values.length >= 5) {
                    double amount = Double.parseDouble(values[0]);
                    String category = values[1];
                    String desc = values[2];
                    LocalDateTime time = LocalDateTime.parse(values[3], formatter);
                    boolean isIncome = Boolean.parseBoolean(values[4]);
                    
                    history.add(new Transaction(amount, category, desc, time, isIncome));
                }
            }
        } catch (Exception e) {
            System.err.println("Eroare la încărcarea istoricului: " + e.getMessage());
            System.err.println("Sfat: Șterge fișierul history.csv dacă formatul vechi cauzează probleme.");
        }
        return history;
    }
}