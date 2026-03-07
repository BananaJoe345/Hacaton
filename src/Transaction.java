import java.time.LocalDateTime;
import java.time.LocalDate;

public class Transaction {
    private double amount;
    private String category;
    private String description;
    private LocalDateTime timestamp;
    private boolean isIncome;

    public Transaction(double amount, String category, String description, boolean isIncome) {
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.isIncome = isIncome;
        this.timestamp = LocalDateTime.now(); 
    }

    public Transaction(double amount, String category, String description, LocalDateTime timestamp, boolean isIncome) {
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.timestamp = timestamp;
        this.isIncome = isIncome;
    }

    public double getAmount() { return amount; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public LocalDate getDate() { return this.timestamp.toLocalDate(); }
    public LocalDateTime getTimestamp() { return timestamp; }
    public boolean isIncome() { return isIncome; }
}