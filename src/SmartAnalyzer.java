import java.util.List;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class SmartAnalyzer {
    public void predictFuture(double currentBalance, List<Transaction> history) {
        if (history.isEmpty()) return;

        double totalSpent = 0;
        for (Transaction t : history) {
            if (!t.isIncome()) totalSpent += t.getAmount();
        }

        LocalDate start = history.get(0).getDate();
        LocalDate end = LocalDate.now();
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        double dailyAvg = totalSpent / days;

        System.out.println("--- ANALIZĂ SMART ---");
        System.out.printf("Cheltuială medie zilnică: %.2f RON\n", dailyAvg);
        System.out.printf("La acest ritm, în 30 de zile vei cheltui: %.2f RON\n", dailyAvg * 30);
        
        if (dailyAvg * 30 > currentBalance) {
            System.out.println("ATENȚIE: Soldul tău nu va acoperi cheltuielile pe luna viitoare!");
        } else {
            System.out.println("INFO: Bugetul tău este stabil.");
        }
    }
}